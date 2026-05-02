
[yt](https://www.youtube.com/watch?v=-L-WgKMFuhE)
- **Closed List** (Visited Nodes): This contains nodes that have already been visited (expanded). Once a node is placed in the closed list, it will not be processed again.
    
- **Open List** (Discovered Nodes): This contains nodes that have been discovered (i.e., they are neighbors of visited nodes) but have not yet been fully explored. The algorithm picks the node with the lowest f(n)=g(n)+h(n)f(n)=g(n)+h(n) value from this list for expansion.

# Start
- **Initialize**:
    
    - Open list (priority queue sorted by `f = g + h`) and closed list (set).
        
- **Node Processing**:
    
    - While open list is not empty:
        
        - Pop node `q` with the **lowest `f`**.
            
        - If `q` is the goal, **reconstruct the path**.
            
        - Generate successors and compute `g`, `h`, `f`.
            
        - For each successor:
            
            - If it’s in the **closed list** and the new `g` is **not cheaper**, skip.
                
            - If it’s in the **open list** and the new `g` is **not cheaper**, skip.
                
            - **Update** the open/closed lists if a cheaper path is found.
                
        - Add `q` to the closed list.

---
Tags: #cs #dsa


#Algorithms_and_Data_Structures
