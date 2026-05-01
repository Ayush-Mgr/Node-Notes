# Boosting: An Ensemble Technique

**Boosting** is an [[Ensemble Technique]] where models are trained **sequentially**, and each new model learns from the **errors of the previous models**.

### Key Points:
- Models are built **one after another**.
- Each model tries to **correct the mistakes** made by the earlier models.
- This sequential learning forms an **additive process**, where every new model adds improvements to the ensemble.

In simple terms, boosting helps create a **strong model** by combining several **weak learners** that focus on correcting each other's errors.

```mermaid
flowchart LR
    A[Initial Data] --> B[Model 1<br/>Trained on original data]
    B --> C[Model 2<br/>Trained on errors of Model 1]
    C --> D[Model 3<br/>Trained on errors of Model 2]
    D --> E[Final Model<br/>Combination of all models]

    classDef model fill:#fff,stroke:#f9f,stroke-width:2px;
    class B,C,D,E model;

```

---
Tags: #math #statistics


#Models_and_Techniques
