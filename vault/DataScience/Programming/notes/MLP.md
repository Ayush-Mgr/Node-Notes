```python

class MLP (nn.Module):

	def __init__(self,num_classes):
			
			super().__init__()
		
			self.fc0 = nn.Linear(784,512)
			
			self.bn0 = nn.BatchNorm1d(512)
			
			self.fc1 = nn.Linear(512,256)
			
			self.bn1 = nn.BatchNorm1d(256)
			
			self.fc2 = nn.Linear(256,128)
			
			self.bn2 = nn.BatchNorm1d(128)
			
			self.fc3 = nn.Linear(128,64)
			
			self.bn3 = nn.BatchNorm1d(64)
			
			self.fc4 = nn.Linear(64, num_classes)
			
			  
			
			self.dropout = nn.Dropout(p=0.3)
	```

[Note_Book](https://colab.research.google.com/drive/1D2a0vbbvWeddA-8LmtG6NEhKhkxha_76?usp=sharing)

---
Tags: #deep-learning #neural-networks


#Machine_Learning_Concepts_In_Programming
