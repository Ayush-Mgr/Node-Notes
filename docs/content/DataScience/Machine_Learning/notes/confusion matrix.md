import pypandoc

# Markdown explanation with table
markdown_text = """# Confusion Matrix Explained

A **confusion matrix** is a performance measurement tool for classification models.  
It compares the actual target values with the predictions made by the model.

---

## Structure of Confusion Matrix

|                 | Predicted Positive | Predicted Negative |
|-----------------|--------------------|--------------------|
| **Actual Positive** | True Positive (TP)  | False Negative (FN) |
| **Actual Negative** | False Positive (FP) | True Negative (TN)  |

---

## Terminology

- **True Positive (TP):** Correctly predicted positive cases (model predicts positive and it is actually positive).  
- **False Positive (FP):** Incorrectly predicted positive cases (model predicts positive but it is actually negative).  
- **True Negative (TN):** Correctly predicted negative cases (model predicts negative and it is actually negative).  
- **False Negative (FN):** Incorrectly predicted negative cases (model predicts negative but it is actually positive).  

---

## Key Metrics Derived

- **Accuracy** = (TP + TN) / (TP + TN + FP + FN)  
- **Precision** = TP / (TP + FP)  
- **Recall (Sensitivity)** = TP / (TP + FN)  
- **Specificity** = TN / (TN + FP)  
- **F1-Score** = 2 * (Precision * Recall) / (Precision + Recall)  

---

---
Tags: #math #statistics


#Models_and_Techniques
