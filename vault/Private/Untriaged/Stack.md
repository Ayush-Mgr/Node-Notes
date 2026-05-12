- It is a type of data structure  
- In which data follows the **Last In, First Out (LIFO)** principle  
- Data is added (pushed) and removed (popped) from the **same end**  

## Example

Given data: $A, B, C, D, E$

1. Start with an empty stack. Add (push) $A, B, C$ into the stack:  
   $$ [A] \rightarrow [A, B] \rightarrow [A, B, C] $$  

2. Remove (pop) $C$ from the stack:  
   $$ [A, B, C] \rightarrow [A, B] $$  

3. Add (push) $D, E$ into the stack:  
   $$ [A, B] \rightarrow [A, B, D] \rightarrow [A, B, D, E] $$  

4. Final stack:  
   $$ [A, B, D, E] $$  

Here:  
- $C$ is the last item added, so it is the first one to be removed.  
- The stack only allows adding or removing items from **one end**, unlike a queue.

---
Tags: #cs #dsa


#Computer_Science_and_Programming
