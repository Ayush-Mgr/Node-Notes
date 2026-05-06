# code
```
import matplotlib.pyplot as plt

plt.figure(figsize=(5,5))

plt.xticks([]), plt.yticks([])

fig, ax = plt.subplots()

fig.patch.set_facecolor('black')

ax.set_facecolor('black')

def line(x1, y1, x2, y2):

"""Draws a line between two points."""

plt.plot([x1, x2], [y1, y2], color='white', linewidth=2)

  
  

# Draw outer boundaries

line(0, 0, 10, 0) # Bottom wall

line(0, 0, 10, 0) # Bottom wall

line(10, 0, 10, 10) # Right wall

line(10, 10, 0, 10) # Top wall

line(0, 10, 0, 0) # Left wall

  

# Draw inner maze walls

line(2, 0, 2, 8)

line(2, 8, 8, 8)

line(8, 8, 8, 2)

line(8, 2, 4, 2)

line(4, 2, 4, 6)

line(4, 6, 6, 6)

line(6, 6, 6, 4)

  
  
  

# Start and end points (optional visualization)

plt.scatter(0.88, 0.44, color='green', label='Start') # Start

plt.scatter(5, 5, color='red', label='End') # End

  
  

# Show the legend

plt.legend()

  

plt.show()

  
  
  

###
```

# Algorithm

^ef43f1


### Step-by-Step Algorithm

-  _the stack is just there to help for back tracking when there is a dead end_

1. **Initialize the Maze**:
    
    - Create a 2D array to represent the maze grid.
    - Mark all cells as unvisited.
2. **Choose a Starting Cell**:
    
    - Select a random cell as the starting point.
    - Mark the starting cell as visited and push it onto the stack.
3. **DFS Algorithm**:
    
    - While there are cells in the stack:
        1. Pop the current cell from the stack., to backtrack if we got stuck in, a dead end
        2. Get a list of all unvisited neighboring cells.
        3. If there are unvisited neighbors:
            - Push the current cell back onto the stack.
            - Choose a random unvisited neighbor.
            - Remove the wall between the current cell and the chosen neighbor.
            - Mark the chosen neighbor as visited and push it onto the stack.
4. **End**:
    
    - The maze is complete when there are no more cells in the stack.
### Animation
1. **Maze Generation Phase**:
    
    - During the maze generation loop, the algorithm calculates which wall to delete (e.g., between `current_cell`and `neighbor`).
    - Instead of deleting it immediately, the wall's coordinates are **added to the `steps` list**.
2. **Animation Phase**:
    
    - The animation function (`update`) processes the `steps` list one item at a time.
    - For each frame, the function takes the next coordinate pair from `steps` and draws the corresponding black line, simulating the wall deletion.

---
Tags: #cs #dsa


#Miscellaneous
