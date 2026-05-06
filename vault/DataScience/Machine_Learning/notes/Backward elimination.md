**Backward Elimination** is a **feature selection method** that starts with **all available features** in the model, and then **removes them one by one** based on their **lack of significance or low impact on model performance**.

---

### 🧠 **Step-by-Step Process:**

1. **Start with all features** included in the model.
    
2. Fit the model (e.g., linear regression).
    
3. Identify the **least significant feature** — this could be based on:
    
    - **P-values** (for linear models — highest p-value above a threshold like 0.05).
        
    - **Feature importance** (for tree-based models).
        
    - **Minimal change in performance** when a feature is removed (e.g., R² or accuracy stays the same or improves).
        
4. **Remove that feature**.
    
5. Refit the model and repeat the process until all remaining features significantly contribute to the output.
    

---

### 🧾 Key Notes:

- It's the **opposite of forward selection**, which **adds** features one by one.
    
- In **backward elimination**, the **goal is to simplify** the model without losing predictive power.
    
- Works best when you start with **many features**, and some are likely redundant or irrelevant.
    

---

### ✅ Exam-Ready Statement:

> "Backward elimination is a stepwise feature selection technique where we start with all features and iteratively remove the least significant ones — typically those with the highest p-values or those whose removal does not significantly reduce model performance. This process continues until only significant predictors remain."

---

### ⚙️ Practical Tip:

If you're ever asked to do this manually or semi-manually:

- Be ready to **look at a table of p-values or accuracy scores** and **remove the feature with the least effect**.
    
- You might be given a situation like:
    
    - "Removing Feature X results in a drop in accuracy from 91.2% to 91.1% — should you remove it?"
        
    - Your answer should be: **Yes**, since the change is **very minimal**.
        

---

---
Tags: #math #statistics


#Models_and_Techniques
