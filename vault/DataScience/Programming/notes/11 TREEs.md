### **1. Concept Overview**

In Data Science, Trees are everything.

- **Machine Learning:** "Decision Trees" and "Random Forests" are core algorithms.
    
- **Data Structures:** Your computer's file system (Folders inside Folders) is a tree.
    
- **HTML/XML:** The structure of every website (DOM) is a tree.
    

### **2. Intuition (The Family Tree)**

A **Tree** is a specific type of graph that organizes data hierarchically (Top-Down).

- **Rule 1:** Everything starts from one "Grandparent" (Root).
    
- **Rule 2:** No cycles. You cannot go from Child back to Parent and back to Child in a loop.
    
- **Rule 3:** It is "Connected". No floating parts.
    

### **3. Formal Definitions (The Vocabulary)**

You will likely get short questions defining these terms.

- **Root:** The single top node (Level 0).
    
- **Parent/Child:** If $A$ connects down to $B$, $A$ is the parent, $B$ is the child.
    
- **Leaf:** A node with **no children** (The bottom tips).
    
- **Internal Node:** A node that has at least one child.
    
- **Degree:** The number of children a node has.
    
- **Height/Depth:** The number of edges from the Root to the deepest Leaf.
    
- **Forest:** A collection of disjoint (unconnected) trees.
    

> The Golden Rule of Trees:
> 
> If a Tree has $n$ vertices (nodes), it has exactly $n - 1$ edges.

### **4. Visual Representation**

Plaintext

```
       [A]  <-- Root
      /   \
    [B]   [C]  <-- Children of A
    / \     \
  [D] [E]   [F] <-- Leaves (No children)
```

- **Vertices ($V$):** $\{A, B, C, D, E, F\}$ ($n=6$)
    
- **Edges ($E$):** $\{(A,B), (A,C), (B,D), (B,E), (C,F)\}$ (Count = 5)
    
- **Check:** $n-1 = 6-1 = 5$. Formula holds.
    
- **Leaves:** $D, E, F$.
    

---

### **5. Tree Traversal Algorithms (DFS vs BFS)**

Traversing means "visiting every node exactly once."

#### **A. Depth-First Search (DFS)**

"Go deep to the bottom before moving to the next branch." (Uses a Stack).

There are 3 ways to do this (Crucial for exams):

1. **Pre-order (Root $\to$ Left $\to$ Right):**
    
    - Visit the node immediately, then go left, then right.
        
    - _Usage:_ Copying a tree structure.
        
2. **In-order (Left $\to$ Root $\to$ Right):**
    
    - Go all the way left, visit the node, then go right.
        
    - _Usage:_ In Binary Search Trees, this gives you sorted numbers!
        
3. **Post-order (Left $\to$ Right $\to$ Root):**
    
    - Visit children first, then the parent.
        
    - _Usage:_ Deleting a tree (delete children before killing the parent).
        

#### **B. Breadth-First Search (BFS)**

"Go level by level." (Uses a **Queue**).

- Visit A, then B, C, then D, E, F.
    

---

### **6. Worked Example: Finding Traversals**

**Tree:**

Plaintext

```
       1
      / \
     2   3
    / \
   4   5
```

**Task:** Write the Pre-order, In-order, and Post-order sequences.

**Solution:**

- **Pre-order (Root-Left-Right):**
    
    1. Start at 1. (Write **1**)
        
    2. Go Left to 2. (Write **2**)
        
    3. Go Left to 4. (Write **4**)
        
    4. 4 is done. Back to 2. Go Right to 5. (Write **5**)
        
    5. Left branch done. Back to 1. Go Right to 3. (Write **3**)
        
    
    - **Result:** `1, 2, 4, 5, 3`
        
- **In-order (Left-Root-Right):**
    
    1. Go Left to 2, then Left to 4. (No left child). Write **4**.
        
    2. Back to Root of that subtree (2). Write **2**.
        
    3. Go Right to 5. Write **5**.
        
    4. Whole left side done. Back to main Root (1). Write **1**.
        
    5. Go Right to 3. Write **3**.
        
    
    - **Result:** `4, 2, 5, 1, 3`
        
- **Post-order (Left-Right-Root):**
    
    1. Left to 4. Write **4**.
        
    2. Right to 5. Write **5**.
        
    3. Root of that subtree (2). Write **2**.
        
    4. Right side (3). Write **3**.
        
    5. Main Root (1). Write **1**.
        
    
    - **Result:** `4, 5, 2, 3, 1`
        

---

### **7. Spanning Trees & MST (Minimum Spanning Tree)**

This is often a 5-mark question.

- **Spanning Tree:** A subgraph that includes **all** vertices of the original graph but is a Tree (no cycles, minimal edges).
	  to find the number of vortex  = $n^{n-2}$ where and is the number of nodes
    
- **Minimum Spanning Tree (MST):** The spanning tree with the **lowest total weight** (sum of edge costs).
    

#### **Algorithms to find MST:**

1. **Kruskal’s Algorithm (The Greedy Edges approach):**
    
    - Sort all edges from cheapest to most expensive.
        
    - Pick the cheapest edge. Add it.
        
    - Pick the next cheapest. Add it **UNLESS** it creates a cycle (loop).
        
    - Repeat until all vertices are connected.
        
2. **Prim’s Algorithm (The Growing Blob approach):**
    
    - Start at any vertex (e.g., A).
        
    - Look at all edges connecting "Visited" nodes to "Unvisited" nodes.
        
    - Pick the cheapest one.
        
    - Repeat.
        

---

### **8. Data Science Connection**

- **Decision Trees:** A flow-chart like structure used for classification.
    
    - Root: "Is Age > 18?"
        
    - Left Child: "No" $\to$ Leaf: "Student".
        
    - Right Child: "Yes" $\to$ Node: "Has Income?".
        
- **Huffman Coding:** A tree-based algorithm used for data compression (ZIP files).
    

---


---
Tags: #cs #dsa


#Algorithms_and_Data_Structures
