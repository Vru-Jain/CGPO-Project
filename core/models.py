import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv, global_mean_pool

class GNNPolicy(nn.Module):
    def __init__(self, num_node_features, hidden_dim=64):
        super(GNNPolicy, self).__init__()
        self.conv1 = GCNConv(num_node_features, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, hidden_dim)
        
        # Actor Head: Projects each node embedding to a score
        self.actor_head = nn.Linear(hidden_dim, 1)
        
        # Critic Head: Projects global graph embedding to a scalar value
        self.critic_head = nn.Linear(hidden_dim, 1)

    def forward(self, x, edge_index, batch=None):
        """
        Args:
            x: Node features [N, F]
            edge_index: Graph connectivity [2, E]
            batch: Batch vector, maps each node to a graph in the batch
        """
        # GNN Layers
        x = F.relu(self.conv1(x, edge_index))
        x = F.dropout(x, p=0.1, training=self.training)
        x = F.relu(self.conv2(x, edge_index)) # [N, hidden_dim]
        
        # Actor: Calculate unnormalized action logits (per node)
        # We want to output a weight distribution across the N assets.
        # So we take the node embeddings and project to scalar.
        action_logits = self.actor_head(x).squeeze(-1) # [N]
        # We'll apply softmax outside or inside depending on algorithm (e.g. PPO takes logits)
        
        # Critic: Value of the state
        if batch is None:
            batch = torch.zeros(x.size(0), dtype=torch.long, device=x.device)
            
        # Global mean pooling to get graph-level embedding
        graph_embed = global_mean_pool(x, batch) # [Batch_Size, hidden_dim]
        value = self.critic_head(graph_embed)   # [Batch_Size, 1]
        
        return action_logits, value
