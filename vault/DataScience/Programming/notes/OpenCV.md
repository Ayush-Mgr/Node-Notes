 the python does not understand .JPG, .MP3 and .MP4 formats so open cv helps to convert it into Numpy array which python understands.
 
**it allows the Python to process data on visualization stuff like images,videos .** 



```Python
import cv2  

# file path (string)
data = "image.jpg"  

# read the image
img = cv2.imread(data)# import the data in RGB format  oe datas format , three dimensional array
img_Grey = cv2.imread(data,cv2.IMREAD_GRAYSCALE) #cv2.IMREAD_GRAYSCALE imorts the data in grey scale format, two dimensional array  

# show the image in a window
cv2.imshow("Output", img)  
cv2.waitKey(0)  # waits for a key press  
cv2.destroyAllWindows()  

``` 

---

### 📊 Example

Say your image is `3×4`
(H=3, W=4):
```
[
[  0, 127, 255,  64],
[200, 100,  50,  25],
[255, 255,   0,   0]
]
```

- First row = first horizontal line of pixels
    
- Second row = second line, etc.
    
- Each number = brightness of that pixel (0=black, 255=white)
    


- Outer dimension = **height** (rows)
    
- Inner dimension = **width** (columns)

---
Tags: #programming #tools


#Miscellaneous
