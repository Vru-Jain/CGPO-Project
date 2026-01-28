import torch
import torch.optim as optim
import torch.nn.functional as F
from torch.distributions import Categorical, Dirichlet
import numpy as np

from core.models import GNNPolicy

class Agent:
    def __init__(self, num_features, num_assets, lr=0.001, gamma=0.99):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.policy = GNNPolicy(num_features, hidden_dim=64).to(self.device)
        self.optimizer = optim.Adam(self.policy.parameters(), lr=lr)
        self.gamma = gamma
        self.num_assets = num_assets

    def get_action(self, obs, training=True):
        """
        Returns action (weights) and log_prob if training.
        """
        x = torch.tensor(obs['x'], dtype=torch.float32).to(self.device)
        edge_index = torch.tensor(obs['edge_index'], dtype=torch.long).to(self.device)
        
        logits, value = self.policy(x, edge_index) # logits: [N], value: [1, 1]
        
        # We need to sample weights. 
        # Deterministic: Softmax(logits)
        # Stochastic: Sample from Dirichlet? Or Categorical?
        # Since action space is a distribution (Portfolio Weights), we usually use Dirichlet 
        # parameterized by exp(logits) or Softmax.
        
        # For simplicity in this v1, let's treat the logits as defining a Dirichlet alpha.
        # But standard Dirichlet needs alpha > 0. using softplus.
        
        alphas = F.softplus(logits) + 1.0 # Ensure > 0
        dist = Dirichlet(alphas)
        
        if training:
            action = dist.sample()
        else:
            action = dist.mean # Deterministic
            
        log_prob = dist.log_prob(action)
        
        return action.detach().cpu().numpy(), log_prob, value

    def train(self, env, episodes=10):
        self.policy.train()
        all_rewards = []
        
        print(f"Starting training on device: {self.device}")
        
        for ep in range(episodes):
            obs, _ = env.reset()
            done = False
            total_reward = 0
            
            # Storage for trajectory
            log_probs = []
            values = []
            rewards = []
            
            while not done:
                action, log_prob, value = self.get_action(obs, training=True)
                
                next_obs, reward, terminated, truncated, _ = env.step(action)
                done = terminated or truncated
                
                log_probs.append(log_prob)
                values.append(value)
                rewards.append(reward)
                
                obs = next_obs
                total_reward += reward
                
            # Calculate returns and advantages
            returns = []
            R = 0
            for r in reversed(rewards):
                R = r + self.gamma * R
                returns.insert(0, R)
                
            returns = torch.tensor(returns, dtype=torch.float32).to(self.device)
            # Normalize returns
            if len(returns) > 1:
                returns = (returns - returns.mean()) / (returns.std() + 1e-8)
                
            loss = 0
            for log_prob, val, R in zip(log_probs, values, returns):
                advantage = R - val.item()
                
                # A2C Loss
                # Policy Loss = - log_prob * advantage
                # Value Loss = (R - val)^2
                
                actor_loss = -log_prob * advantage
                critic_loss = F.mse_loss(val.squeeze(), torch.tensor(R, device=self.device))
                
                loss += actor_loss + 0.5 * critic_loss
                
            self.optimizer.zero_grad()
            loss.backward()
            self.optimizer.step()
            
            all_rewards.append(total_reward)
            if (ep+1) % 1 == 0:
                print(f"Episode {ep+1}: Total Reward: {total_reward:.4f}")
                
        return all_rewards
