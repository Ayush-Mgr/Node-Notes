 _Addition Theorem:_  the probability of occurrence $P(A \cup B)$ of either A or B is the sum of their probability $P(A)+P(B)$ minus intersection of their probability $P(A \cap B)$  :
$$
P(A \cup B) = P(A) + P(B) - P(A \cap B)
$$
This formula ensures that if $A$ and $B$ overlap, the overlap $P(A \cap B)$ is not double-counted.

If $A$ and $B$ are [[2.Terminologies#^99598a|mutually exclusive]] ($A \cap B = \emptyset$), the formula simplifies to:
$$
P(A \cup B) = P(A) + P(B)
$$

### Points
1. if the events $A_1,A_2.....A_k$, are mutually exclusive then the probability of occurring anyone of this mutually exclusive events would be the [[representation of  various probabilistic concepts#^961955|sum of their probabilities]] of the [[2.Terminologies#^99598a|mutually exclusive]] event.
	- $P(A_1 + A_2....+A_k ) =P(A_1)+P(A_2)......+P(A_k)$
	- **Example**:
		Imagine rolling a fair six-sided die, and define the following mutually exclusive events:
		- $A_1 = {1}$: Rolling a 1.
		- $A_2 = {2}$: Rolling a 2.
		- $A_3 = {3}$: Rolling a 3.
		
		Since the events are mutually exclusive, the probability of rolling **1, 2, or 3** (i.e., $A_1 \cup A_2 \cup A_3$) is the sum of their individual probabilities:
		$$		P(A_1 \cup A_2 \cup A_3) = P(A_1) + P(A_2) + P(A_3).$$		    
		For a fair die:
		$$		P(A_1) = P(A_2) = P(A_3) = \frac{1}{6}.		$$		so:		$$
		P(A_1 \cup A_2 \cup A_3) = \frac{1}{6} + \frac{1}{6} + \frac{1}{6} = \frac{3}{6} = \frac{1}{2}.
		$$
---
2. Probability different [[representation of  various probabilistic concepts#^0551df|complementary]] to a is $P(\bar{A}) = 1 - P(A)$ or $P(A) = 1 - P(\bar{A})$
	- since , $P(\bar{A}+A)=P(\bar{A})+P(A)$ from  _[[Addition Theorem]]_
	- So $P(\bar{A}+A)=1$ 
	- and $P(\bar{A})+P(A)=1$ 
	
--- 
3. The probability of occurrence of two events, A and B, which is _not mutually exclusive_() is found by
	-  $P(A + B) =P(A)+P(B)-P(AB)$
---
4. Boole's inequality $P(A + B) =< P(A)+P(B)$
	-  $P(A + B)$ could be written as  $P(A + B)  =P(A)+P(B)-P(AB)$
	- since the the result of any probability lies between 0 and 1  
		- P(AB) = 0 at lowest , $P(A)+P(B$) remains same so RHS = LHS
		- if P(AB) > 0 ,  $P(A + B)  =P(A)+P(B)-P(AB)$ it decrease the value of RHS. 
	- Here's how the term $-P(A \cap B)$ reduces $P(A + B)$ compared to $P(A) + P(B)$:  
	- Example:  
		- Let $P(A) = 0.5$, $P(B) = 0.4$, and $P(A \cap B) = 0.2$.  
		- Compute $P(A + B)$:  
		  $$		  P(A + B) = 0.5 + 0.4 - 0.2 = 0.7$$
		- Compare $P(A + B)$ with $P(A) + P(B)$:  
		  $$
		  0.7 < 0.5 + 0.4 = \boxed{0.9}
		  $$

---

---
Tags: #math #statistics


#Probability_Theory
