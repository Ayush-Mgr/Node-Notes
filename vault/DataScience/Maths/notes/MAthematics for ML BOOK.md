---
annotation-target: 0 assets/mml-book.pdf
---

# BOOK
[Mathematics for ML](https://play.google.com/books?authuser=2)
![[mml-book.pdf]]

# Notes








>%%
>```annotation-json
>{"created":"2025-03-12T17:44:00.901Z","updated":"2025-03-12T17:44:00.901Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":30228,"end":30372},{"type":"TextQuoteSelector","exact":"We represent numerical data as vectors and represent a table of suchdata as a matrix. The study of vectors and matrices is called linear algebra","prefix":"on, which is laid out in Part I.","suffix":",which we introduce in Chapter 2"}]}]}
>```
>%%
>*%%PREFIX%%on, which is laid out in Part I.%%HIGHLIGHT%% ==We represent numerical data as vectors and represent a table of suchdata as a matrix. The study of vectors and matrices is called linear algebra== %%POSTFIX%%,which we introduce in Chapter 2*
>%%LINK%%[[#^37zun5mamp3|show annotation]]
>%%COMMENT%%
>
>%%TAGS%%
>
^37zun5mamp3


>%%
>```annotation-json
>{"created":"2025-03-12T17:46:38.406Z","updated":"2025-03-12T17:46:38.406Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":30593,"end":30981},{"type":"TextQuoteSelector","exact":"The idea is that vectors thatare similar should be predicted to have similar outputs by our machinelearning algorithm (our predictor). To formalize the idea of similarity be-tween vectors, we need to introduce operations that take two vectors asinput and return a numerical value representing their similarity. The con-struction of similarity and distances is central to analytic geometry","prefix":"tements about their similarity. ","suffix":" and isanalytic geometrydiscusse"}]}]}
>```
>%%
>*%%PREFIX%%tements about their similarity.%%HIGHLIGHT%% ==The idea is that vectors thatare similar should be predicted to have similar outputs by our machinelearning algorithm (our predictor). To formalize the idea of similarity be-tween vectors, we need to introduce operations that take two vectors asinput and return a numerical value representing their similarity. The con-struction of similarity and distances is central to analytic geometry== %%POSTFIX%%and isanalytic geometrydiscusse*
>%%LINK%%[[#^v7l7w2al0tg|show annotation]]
>%%COMMENT%%
>
>%%TAGS%%
>
^v7l7w2al0tg



>%%
>```annotation-json
>{"text":"A **vector** is a quantity that has both *magnitude* (measurable) and *direction*, such as force, which involves a push or pull in a specific direction. In contrast, a **scalar** is a measurable quantity that has only magnitude and no direction, such as temperature.\n\n1. **Addition**: Two vectors can be added together to produce another vector. This means if you have vectors **A** and **B**, their sum **A + B** is also a vector.  \n2. **Scalar Multiplication**: A vector can be multiplied by a scalar (a regular number with magnitude and no direction ), and the result is still a vector in the same space but scaled in magnitude.\n","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":36318,"end":36566},{"type":"TextQuoteSelector","exact":"In general, vectors are special objects that can be added together andmultiplied by scalars to produce another object of the same kind. Froman abstract mathematical viewpoint, any object that satisfies these twoproperties can be considered a vector","prefix":"o represent them, e.g., x and y.","suffix":". Here are some examples of such"}]}],"created":"2025-03-13T07:22:31.381Z","updated":"2025-03-13T07:22:31.381Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf"}
>```
>%%
>*%%PREFIX%%o represent them, e.g., x and y.%%HIGHLIGHT%% ==In general, vectors are special objects that can be added together andmultiplied by scalars to produce another object of the same kind. Froman abstract mathematical viewpoint, any object that satisfies these twoproperties can be considered a vector== %%POSTFIX%%. Here are some examples of such*
>%%LINK%%[[#^z1poq84as4|show annotation]]
>%%COMMENT%%
>A **vector** is a quantity that has both *magnitude* (measurable) and *direction*, such as force, which involves a push or pull in a specific direction. In contrast, a **scalar** is a measurable quantity that has only magnitude and no direction, such as temperature.
>
>1. **Addition**: Two vectors can be added together to produce another vector. This means if you have vectors **A** and **B**, their sum **A + B** is also a vector.  
>2. **Scalar Multiplication**: A vector can be multiplied by a scalar (a regular number with magnitude and no direction ), and the result is still a vector in the same space but scaled in magnitude.
>
>%%TAGS%%
>
^z1poq84as4


>%%
>```annotation-json
>{"text":"vector in a 2D plane","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":36616,"end":36633},{"type":"TextQuoteSelector","exact":"Geometric vectors","prefix":"amples of suchvector objects:1.","suffix":". This example of a vector may b"}]}],"created":"2025-03-13T07:35:16.960Z","updated":"2025-03-13T07:35:16.960Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf"}
>```
>%%
>*%%PREFIX%%amples of suchvector objects:1.%%HIGHLIGHT%% ==Geometric vectors== %%POSTFIX%%. This example of a vector may b*
>%%LINK%%[[#^c8p3cbwe9xo|show annotation]]
>%%COMMENT%%
>vector in a 2D plane
>%%TAGS%%
>
^c8p3cbwe9xo


>%%
>```annotation-json
>{"text":"A **polynomial** is an algebraic expression made up of variables, coefficients, and exponents, combined using addition, subtraction, and multiplication (but no division by variables). \n[polynomial](obsidian://open?vault=Data%20Science&file=maths%2Fpolynomial)","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":37284,"end":37295},{"type":"TextQuoteSelector","exact":"Polynomials","prefix":"bout mathematical operations.2.","suffix":"are also vectors; see Figure 2."}]}],"created":"2025-03-18T13:40:43.678Z","updated":"2025-03-18T13:40:43.678Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf"}
>```
>%%
>*%%PREFIX%%bout mathematical operations.2.%%HIGHLIGHT%% ==Polynomials== %%POSTFIX%%are also vectors; see Figure 2.*
>%%LINK%%[[#^f4q8oayrr3e|show annotation]]
>%%COMMENT%%
>A **polynomial** is an algebraic expression made up of variables, coefficients, and exponents, combined using addition, subtraction, and multiplication (but no division by variables). 
>[polynomial](obsidian://open?vault=Data%20Science&file=maths%2Fpolynomial)
>%%TAGS%%
>
^f4q8oayrr3e


>%%
>```annotation-json
>{"created":"2025-03-18T13:50:42.046Z","text":"# **polynomials as a vector**\nTwo polynomials can be added together, which result in another polynomial and they can be multiplied by a [scalar](obsidian://open?vault=Data%20Science&file=maths%2Fscalar)  and it results in a polynomial as well, which fulfill the two properties of vector making polynomial a vector as well","updated":"2025-03-18T13:50:42.046Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":37333,"end":37352},{"type":"TextQuoteSelector","exact":"Two polynomials can","prefix":"lso vectors; see Figure 2.1(b): ","suffix":"Figure 2.1Different types ofvect"}]}]}
>```
>%%
>*%%PREFIX%%lso vectors; see Figure 2.1(b):%%HIGHLIGHT%% ==Two polynomials can== %%POSTFIX%%Figure 2.1Different types ofvect*
>%%LINK%%[[#^6fz3njurn3i|show annotation]]
>%%COMMENT%%
># **polynomials as a vector**
>Two polynomials can be added together, which result in another polynomial and they can be multiplied by a [scalar](obsidian://open?vault=Data%20Science&file=maths%2Fscalar)  and it results in a polynomial as well, which fulfill the two properties of vector making polynomial a vector as well
>%%TAGS%%
>
^6fz3njurn3i


>%%
>```annotation-json
>{"created":"2025-03-18T14:01:55.431Z","text":"# Geometric vectors vs polynomial\nGeometric vectors and polynomial vectors differ in their nature, but both follow vector space rules. \n\n### **1. Geometric Vectors (Concrete & Fixed)**\n- Geometric vectors exist in **physical space** (2D, 3D, etc.).\n- They have **fixed components** (magnitude & direction).\n- Once drawn, they represent a **specific quantity** (like force, displacement).\n- They don’t “change” unless modified explicitly.\n\n### **2. Polynomial Vectors (Abstract & Flexible)**\n- Polynomials exist in **function space** (not physical space).\n- Their components (coefficients) can **change based on variables**.\n- They can be manipulated in many ways (addition, multiplication, differentiation).\n- A polynomial represents an **infinite set of values** depending on the input \\( x \\).\n\n### **Flexibility vs. Rigidity**\n- Geometric vectors are **fixed structures**: if you define a vector \\( (3,4) \\), it stays the same unless changed.\n- Polynomial vectors are **more flexible**: the polynomial \\( P(x) = x^2 + 2x + 3 \\) behaves differently for different values of \\( x \\), making it more **dynamic**.\n\nSo, in a way, **geometric vectors are “sturdy,” while polynomial vectors are “fluid” and depend on the variable**. \n\n","updated":"2025-03-18T14:01:55.431Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":38127,"end":38305},{"type":"TextQuoteSelector","exact":"Note that polynomials are very different from geometric vectors. Whilegeometric vectors are concrete “drawings”, polynomials are abstractconcepts. However, they are both vectors ","prefix":"r unusual) instances of vectors.","suffix":"in the sense previously de-scrib"}]}]}
>```
>%%
>*%%PREFIX%%r unusual) instances of vectors.%%HIGHLIGHT%% ==Note that polynomials are very different from geometric vectors. Whilegeometric vectors are concrete “drawings”, polynomials are abstractconcepts. However, they are both vectors== %%POSTFIX%%in the sense previously de-scrib*
>%%LINK%%[[#^z7kutetlycn|show annotation]]
>%%COMMENT%%
># Geometric vectors vs polynomial
>Geometric vectors and polynomial vectors differ in their nature, but both follow vector space rules. 
>
>### **1. Geometric Vectors (Concrete & Fixed)**
>- Geometric vectors exist in **physical space** (2D, 3D, etc.).
>- They have **fixed components** (magnitude & direction).
>- Once drawn, they represent a **specific quantity** (like force, displacement).
>- They don’t “change” unless modified explicitly.
>
>### **2. Polynomial Vectors (Abstract & Flexible)**
>- Polynomials exist in **function space** (not physical space).
>- Their components (coefficients) can **change based on variables**.
>- They can be manipulated in many ways (addition, multiplication, differentiation).
>- A polynomial represents an **infinite set of values** depending on the input \( x \).
>
>### **Flexibility vs. Rigidity**
>- Geometric vectors are **fixed structures**: if you define a vector \( (3,4) \), it stays the same unless changed.
>- Polynomial vectors are **more flexible**: the polynomial \( P(x) = x^2 + 2x + 3 \) behaves differently for different values of \( x \), making it more **dynamic**.
>
>So, in a way, **geometric vectors are “sturdy,” while polynomial vectors are “fluid” and depend on the variable**. 
>
>
>%%TAGS%%
>
^z7kutetlycn


>%%
>```annotation-json
>{"text":"[n-dimensional real space](obsidian://open?vault=Data%20Science&file=maths%2Flinear%20Alzebra%2Fn-dimensional%20real%20space)","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":38608,"end":38623},{"type":"TextQuoteSelector","exact":"Elements of Rn ","prefix":"ls are a type of vector, too.4.","suffix":"(tuples of n real numbers) are v"}]}],"created":"2025-03-18T14:36:34.651Z","updated":"2025-03-18T14:36:34.651Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf"}
>```
>%%
>*%%PREFIX%%ls are a type of vector, too.4.%%HIGHLIGHT%% ==Elements of Rn== %%POSTFIX%%(tuples of n real numbers) are v*
>%%LINK%%[[#^yn6su2i6ey|show annotation]]
>%%COMMENT%%
>[n-dimensional real space](obsidian://open?vault=Data%20Science&file=maths%2Flinear%20Alzebra%2Fn-dimensional%20real%20space)
>%%TAGS%%
>
^yn6su2i6ey


>%%
>```annotation-json
>{"text":"the LInear equation road map\n[Linear Equation overview](obsidian://open?vault=Data%20Science&file=maths%2Flinear%20Alzebra%2FLINEAR%20EQUATION)","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":40921,"end":40948},{"type":"TextQuoteSelector","exact":"Systems of Linear Equations","prefix":"dback: https://mml-book.com.2.1","suffix":"19Figure 2.2 A mindmap of the c"}]}],"created":"2025-03-21T09:02:00.316Z","updated":"2025-03-21T09:02:00.316Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf"}
>```
>%%
>*%%PREFIX%%dback: https://mml-book.com.2.1%%HIGHLIGHT%% ==Systems of Linear Equations== %%POSTFIX%%19Figure 2.2 A mindmap of the c*
>%%LINK%%[[#^os99qsxjj5p|show annotation]]
>%%COMMENT%%
>the LInear equation road map
>[Linear Equation overview](obsidian://open?vault=Data%20Science&file=maths%2Flinear%20Alzebra%2FLINEAR%20EQUATION)
>%%TAGS%%
>
^os99qsxjj5p


>%%
>```annotation-json
>{"created":"2025-03-22T05:43:37.765Z","text":"[system of linear equations](obsidian://open?vault=Data%20Science&file=maths%2Flinear%20Alzebra%2Fsystem%20of%20linear%20equations)","updated":"2025-03-22T05:43:37.765Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":43153,"end":43179},{"type":"TextQuoteSelector","exact":"system of linear equations","prefix":" (2.3) is the general form of a ","suffix":", andsystem of linearequations x"}]}]}
>```
>%%
>*%%PREFIX%%(2.3) is the general form of a%%HIGHLIGHT%% ==system of linear equations== %%POSTFIX%%, andsystem of linearequations x*
>%%LINK%%[[#^fdvqvi1w1wn|show annotation]]
>%%COMMENT%%
>[system of linear equations](obsidian://open?vault=Data%20Science&file=maths%2Flinear%20Alzebra%2Fsystem%20of%20linear%20equations)
>%%TAGS%%
>
^fdvqvi1w1wn


>%%
>```annotation-json
>{"text":"[Geometric representation of a linear equation](obsidian://open?vault=Data%20Science&file=maths%2Flinear%20Alzebra%2FGeometric%20representation%20of%20a%20linear%20equation)\nIn a geometric interpretation of linear equation, \nthe unique solution of X 1 and X2 could be plotted in the graph \nwhere X_1 is axis and X2 is another axis,\n if we draw the line of linear equation their intersecting point will be our unique solution of X1 and X2,\nif they are parallel, there will be no solution.\n If they are join entirely, they will be infinitely many solutions,","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":44937,"end":44992},{"type":"TextQuoteSelector","exact":"Geometric Interpretation of Systems of Linear Equations","prefix":"stem of linearequations.Remark (","suffix":"). In asystem of linear equation"}]}],"created":"2025-03-23T06:57:42.690Z","updated":"2025-03-23T06:57:42.690Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf"}
>```
>%%
>*%%PREFIX%%stem of linearequations.Remark (%%HIGHLIGHT%% ==Geometric Interpretation of Systems of Linear Equations== %%POSTFIX%%). In asystem of linear equation*
>%%LINK%%[[#^qxwbfgktab|show annotation]]
>%%COMMENT%%
>[Geometric representation of a linear equation](obsidian://open?vault=Data%20Science&file=maths%2Flinear%20Alzebra%2FGeometric%20representation%20of%20a%20linear%20equation)
>In a geometric interpretation of linear equation, 
>the unique solution of X 1 and X2 could be plotted in the graph 
>where X_1 is axis and X2 is another axis,
> if we draw the line of linear equation their intersecting point will be our unique solution of X1 and X2,
>if they are parallel, there will be no solution.
> If they are join entirely, they will be infinitely many solutions,
>%%TAGS%%
>
^qxwbfgktab


>%%
>```annotation-json
>{"created":"2025-04-07T07:15:40.623Z","text":"[Note](obsidian://open?vault=Data%20Science&file=maths%2Flinear%20Alzebra%2Fmatrix%2Fpractical%20%26%20general%20solutions)","updated":"2025-04-07T07:15:40.623Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":55436,"end":55467},{"type":"TextQuoteSelector","exact":"Particular and General Solution","prefix":"g the inverse of a matrix.2.3.1 ","suffix":"Before discussing how to general"}]}]}
>```
>%%
>*%%PREFIX%%g the inverse of a matrix.2.3.1%%HIGHLIGHT%% ==Particular and General Solution== %%POSTFIX%%Before discussing how to general*
>%%LINK%%[[#^lrm2ebx0o08|show annotation]]
>%%COMMENT%%
>[Note](obsidian://open?vault=Data%20Science&file=maths%2Flinear%20Alzebra%2Fmatrix%2Fpractical%20%26%20general%20solutions)
>%%TAGS%%
>
^lrm2ebx0o08


>%%
>```annotation-json
>{"created":"2025-04-19T12:10:56.128Z","updated":"2025-04-19T12:10:56.128Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":58297,"end":58317},{"type":"TextQuoteSelector","exact":"Gaussian elimination","prefix":"rm: Gaussianelimination. Key to ","suffix":" are elementary transformationso"}]}]}
>```
>%%
>*%%PREFIX%%rm: Gaussianelimination. Key to%%HIGHLIGHT%% ==Gaussian elimination== %%POSTFIX%%are elementary transformationso*
>%%LINK%%[[#^43nh1f87h3s|show annotation]]
>%%COMMENT%%
>
>%%TAGS%%
>
^43nh1f87h3s


>%%
>```annotation-json
>{"created":"2025-04-20T08:23:23.082Z","text":"Issue force to all the equations of  \\( Ax \\), which will give us result b = zero , there fore Ax=0 the null space ","updated":"2025-04-20T08:23:23.082Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":66722,"end":66738},{"type":"TextQuoteSelector","exact":"kernelnull space","prefix":"null space (see Section 2.7.3). ","suffix":"Example 2.8 (Minus-1 Trick)Let u"}]}]}
>```
>%%
>*%%PREFIX%%null space (see Section 2.7.3).%%HIGHLIGHT%% ==kernelnull space== %%POSTFIX%%Example 2.8 (Minus-1 Trick)Let u*
>%%LINK%%[[#^zy8ltqqnfmc|show annotation]]
>%%COMMENT%%
>Issue force to all the equations of  \( Ax \), which will give us result b = zero , there fore Ax=0 the null space 
>%%TAGS%%
>
^zy8ltqqnfmc


>%%
>```annotation-json
>{"created":"2025-10-10T06:18:31.100Z","updated":"2025-10-10T06:18:31.100Z","document":{"title":"Mathematics for Machine Learning","link":[{"href":"urn:x-pdf:3baffb08fa43253147613eabe04f3eb1"},{"href":"vault:/0 assets/mml-book.pdf"}],"documentFingerprint":"3baffb08fa43253147613eabe04f3eb1"},"uri":"vault:/0 assets/mml-book.pdf","target":[{"source":"vault:/0 assets/mml-book.pdf","selector":[{"type":"TextPositionSelector","start":71946,"end":72006},{"type":"TextQuoteSelector","exact":"vector spaces, i.e., a structured space in whichvectors live","prefix":"g,we will have a closer look at ","suffix":".In the beginning of this chapte"}]}]}
>```
>%%
>*%%PREFIX%%g,we will have a closer look at%%HIGHLIGHT%% ==vector spaces, i.e., a structured space in whichvectors live== %%POSTFIX%%.In the beginning of this chapte*
>%%LINK%%[[#^ihsco5voyh|show annotation]]
>%%COMMENT%%
>
>%%TAGS%%
>
^ihsco5voyh

---
Tags: #math #statistics
