# 1. **Breadth-First Search (BFS):**
- **Strategy**: Explores all nodes at the current depth level before moving to the next depth level.
- **Data Structure**: [[Queue (FIFO - First In, First Out)  ]].
- **Features**:
  - **Complete**: Always finds a solution if one exists.
  - **Optimal**: Finds the shortest path if all actions have the same cost.
- **Time/Space Complexity**: $O(b^d)$, where $b$ is the branching factor (average number of children per node) and $d$ is the depth of the solution.

### Example
For a tree structure:
```
       A
     / | \
    B  C  D
   /|  /\   \
  E F  G H    I
```
- BFS explores in this order: $A, B, C, D, E, F, G, H$.



From the image, the content seems to show the process of a **Breadth-First Search (BFS)** traversal on a graph or tree structure, queuing nodes at each level systematically.

Here’s how **BFS works**, step-by-step, using the provided diagram as an example:

---

## BFS Traversal Process:

1. **Start at the root node**:  
   - Begin with the initial node $A$.  
   - Enqueue $A$ into the queue.  
   - The [[Queue (FIFO - First In, First Out)#^2e94b8|queue]] now looks like: **[A]**.

2. **Visit and Dequeue**:
   - Dequeue $A$, process it, and enqueue its children ($B, C, D$).  
   - The queue now looks like: **[B, C, D]**.

3. **Process $B$:**
   - Dequeue $B$, process it, and enqueue its children ($E, F$).  
   - The queue now looks like: **[C, D, E, F]**.

4. **Process $C$:**
   - Dequeue $C$, process it, and enqueue its children ($G, H$).  
   - The queue now looks like: **[D, E, F, G, H]**.

5. **Process $D$:**
   - Dequeue $D$, process it, and enqueue its children ($I$).  
   - The queue now looks like: **[E, F, G, H, I]**.


7. **Continue**:
   - Follow this process for each node in the queue, adding children in the order they appear.

---

## BFS Queue Example:
- Initial Queue: **[A]**  
- After processing $A$: **[B, C, D]**  
- After processing $B$: **[C, D, E, F]**  
- After processing $C$: **[D, E, F, G, H]**  
- After processing $D$: **[E, F, G, H, I]**  
- Continue until the queue is empty.

---


## Source
- [yt ](https://youtu.be/qul0f79gxGs)

---
Tags: #cs #dsa


#Machine_Learning_and_AI
