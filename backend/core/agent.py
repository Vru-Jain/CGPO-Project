import os
import torch
import torch.optim as optim
import torch.nn.functional as F
from torch.distributions import Categorical, Dirichlet
import numpy as np

from core.models import GNNPolicy

class Agent:
    def __init__(self, num_features, num_assets, lr=0.001, gamma=0.99, entropy_coef=0.01):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.policy = GNNPolicy(num_features, hidden_dim=64).to(self.device)
        self.optimizer = optim.Adam(self.policy.parameters(), lr=lr)
        self.gamma = gamma
        self.entropy_coef = entropy_coef
        self.num_assets = num_assets

    def get_action(self, obs, training=True):
        """
        Returns action (weights) and log_prob if training.
        """
        x = torch.tensor(obs['x'], dtype=torch.float32).to(self.device)
        edge_index = torch.tensor(obs['edge_index'], dtype=torch.long).to(self.device)
        edge_attr = torch.tensor(obs.get('edge_attr', []), dtype=torch.float32).to(self.device) if 'edge_attr' in obs else None
        
        logits, value = self.policy(x, edge_index, edge_attr)  # Pass edge weights
        
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
        entropy = dist.entropy()
        
        return action.detach().cpu().numpy(), log_prob, value, entropy

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
            entropies = []
            
            while not done:
                action, log_prob, value, entropy = self.get_action(obs, training=True)
                
                next_obs, reward, terminated, truncated, _ = env.step(action)
                done = terminated or truncated
                
                log_probs.append(log_prob)
                values.append(value)
                rewards.append(float(reward))  # Ensure float
                entropies.append(entropy)
                
                obs = next_obs
                total_reward += float(reward)  # Ensure float
                
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
            for log_prob, val, R, ent in zip(log_probs, values, returns, entropies):
                advantage = R - val.item()
                
                # A2C Loss
                # Policy Loss = - log_prob * advantage
                # Value Loss = (R - val)^2
                
                actor_loss = -log_prob * advantage
                # Clone R tensor to avoid warning, ensure correct shape
                R_tensor = R.clone().detach() if isinstance(R, torch.Tensor) else torch.tensor(R, device=self.device)
                critic_loss = F.mse_loss(val.squeeze().unsqueeze(0), R_tensor.unsqueeze(0))
                entropy_loss = -self.entropy_coef * ent.mean()
                
                loss += actor_loss + 0.5 * critic_loss + entropy_loss
                
            # NaN Guard: Skip update if loss is unstable
            if torch.isnan(loss) or torch.isinf(loss):
                print(f"[Warning] Episode {ep+1}: Skipped update due to unstable loss (NaN/Inf)")
                continue
                
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.policy.parameters(), max_norm=0.5)
            self.optimizer.step()
            
            all_rewards.append(total_reward)
            if (ep+1) % 1 == 0:
                print(f"Episode {ep+1}: Total Reward: {total_reward:.4f}")
                
                
        return all_rewards

    def save_model(self, path="models/agent.pth"):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        torch.save(self.policy.state_dict(), path)
        print(f"Model saved to {path}")

    def load_model(self, path="models/agent.pth"):
        if os.path.exists(path):
            self.policy.load_state_dict(torch.load(path, map_location=self.device))
            self.policy.eval()
            print(f"Model loaded from {path}")
        else:
            print(f"No model found at {path}, starting from scratch.")
