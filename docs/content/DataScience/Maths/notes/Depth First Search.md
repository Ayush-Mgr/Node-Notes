
# 4. **Depth-Limited Search (DLS):**
- **Strategy**: Performs DFS up to a fixed depth limit and does not explore nodes beyond that limit.
- **Data Structure**: [[Stack]].
- **Features**:
  - Useful for avoiding infinite loops in infinite state spaces.
  - **Not Complete**: May fail if the solution is deeper than the limit.
  - **Not Optimal**: Does not guarantee the shortest or cheapest path.

---

## Example
For a tree structure:
```
         A
       / | \
      B  C  D
     /|  /\   \
    E F  G H    I
   /| 
  K J
```

---

### DFS Process Using a Stack:

1. **Start at the root node**:  
   - Begin with the initial node \( A \).  
   - Push \( A \) onto the [[Stack]].  
   - The stack now looks like: **[A]**.

2. **Visit and Pop**:
   - Pop \( A \) from the stack, process it, and push its children in **reverse order** (to maintain left-to-right traversal when popped).  
   - Push \( D, C, B \).  
   - The stack now looks like: **[D, C, B]**.

3. **Process \( B \):**
   - Pop \( B \), process it, and push its children (\( F, E \)) in reverse order.  
   - The stack now looks like: **[D, C, F, E]**.

4. **Process \( E \):**
   - Pop \( E \), process it, and push its children (\( K, J \)) in reverse order.  
   - The stack now looks like: **[D, C, F, K, J]**.

6. **Continue**:
   - Follow this process for each node in the stack until it is empty.

---

### Example of DFS Stack:
- Initial Stack: **[A]**  
- After processing \( A \): **[D, C, B]**  
- After processing \( B \): **[D, C, F, E]**  
- After processing \( E \): **[D, C, F, K, J]**  
- After processing \( J \): **[D, C, F, K]**  
- Continue until the stack is empty.

---


---
Tags: #cs #dsa


#Machine_Learning_and_AI_Math
