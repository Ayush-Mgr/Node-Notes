## Introduction

Almost everything starts somewhere.

Neural networks began with Perceptron. In 1943, Warren MuCulloch, a neuroscientist and Walter Pitts, a logician proposed the first computational model of a biological neuron referred to as the McCulloch-Pitts Neuron in their paper ‘ *A Logical Calculus of the Ideas Immanent in Nervous Activity* ’.

<img src="https://miro.medium.com/v2/resize:fit:640/format:webp/0*HHkPL7CUFhxC-Yzm.png" 
     style="filter: invert(1) brightness(2); width: auto;">



In a biological neuron, the Dendrites receives signals from external neurons, the Soma processes or synthesizes these signals, the Axon transmits these signals and the Synapse outputs or communicates externally. The McCulloch-Pitts Neuron mimicked this system. The aim of McCulloch and Pitts’s research was to present logic that explains the neural activity and computation in the brain. However this commenced the development of neural networks in artificial intelligence.


## What is a Perceptron?

**A perceptron is a one neuron neural network.** On a high level, it takes several inputs, and produces a binary output. It does this by:

1. initializes weights
2. multiplying each inputs with weights
3. sums all weight-input multiples
4. compares the weighted sum of the inputs to a threshold
5. produces an output of 0 or 1 based on the comparison

<img src="https://miro.medium.com/v2/resize:fit:640/format:webp/0*qrlA8w3mBqrC0SKw.jpg" 
     style="filter: invert(1) brightness(2); width: auto;">


![]()



In the diagram above, the inputs $𝑿_1$ to $𝑿_n$ are multiplied with weights $𝒲_1$ to $𝒲_n$, summed by the Adder function and passed through the activation function — a function that calculates the output based on its individual inputs and threshold set therein. The activation outputs a binary decision y.

## Theory: How Does a Perceptron Work

The perceptron follows a simple algorithm as delineated above.

- Initializes weights 𝒲 equal to number of inputs.
- It takes the input 𝑿 and multiplies each by weights 𝒲 and derives sum of all weighted inputs.

for $j$ inputs of $X$ multiplied by $j$ weights($w$):

<img src="https://miro.medium.com/v2/resize:fit:232/0*M7y315PPmdqSIGrD" 
     style="filter: invert(1) brightness(2); max-width: 100%; height: auto; width: auto;">


- Next the perceptron algorithm compares the output of the summation with a threshold b and outputs a 0 or 1 based on this comparison.


 <img src="https://miro.medium.com/v2/resize:fit:642/0*lD5T-yeQJMPNhhBv" 
     style="filter: invert(1) brightness(2); max-width: 100%; height: auto; width: auto;">

- The above expression can be rewritten as:

 <img src="https://miro.medium.com/v2/resize:fit:652/0*w8kSrZixDusfAsNP" 
     style="filter: invert(1) brightness(2); max-width: 100%; height: auto; width: auto;">


If $z = w.x+b$



 <img src="https://miro.medium.com/v2/resize:fit:542/0*ioz3b2ZIxShif938" 
     style="filter: invert(1) brightness(2); max-width: 100%; height: auto; width: auto;">

In mathematics, f(z) is referred to as a _step function_ (_[[1 Activation Function|an activation function]]_).


 <img src="https://miro.medium.com/v2/resize:fit:640/format:webp/0*VK8CSBgAO1-QHz6U.png" 
     style="filter: invert(1) brightness(2); max-width: 100%; height: auto; width: auto;">



Also since z is similar to the equation of a line, the activation function creates a plane which segments the input distribution into two binary classes like in the diagram below.

 <img src="https://miro.medium.com/v2/resize:fit:640/format:webp/0*oOgzTtata5rDVYvz.png" 
     style="filter: invert(1) brightness(2); max-width: 100%; height: auto; width: auto;">



## Application: When to Use Perceptrons?

Since the Perceptron is a building block, its use cases, though limited can be customized. At its core, a perceptron is a binary classifier. Asides from binary classification, Perceptrons can represent logical operations like AND, OR, and NOT, making them useful in building basic logic gates and circuits. In fact, a NAND, which is universal logic gate is a simple perceptron. In electronics, a universal logic gate can be used to derive any other gate. This further proofs the essence of a perceptron as a building block.

Perceptrons can be layered for more complex use cases — after all a neural network is a network of interconnected perceptrons.

---
Tags: #deep-learning #neural-networks


#Neural_Networks_and_Deep_Learning
