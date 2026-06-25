## [[12. Semantic Analysis in NLP|NLP]]
Key Tasks in Natural Language Processing :

NLP involves several fundamental tasks used to analyze textual data.

**Tokenization**

Breaking text into smaller units such as words or sentences.

**Stop Word Removal**

Removing common words such as "the", "is", and "and" that do not carry significant meaning.

**Stemming and Lemmatization**

Reducing words to their base or root forms.

**Named Entity Recognition**

Identifying important entities such as names of people, organizations, and locations.

**Text Classification**
assigning text to pre defined catagories 

helps to find the information for analysis



### Tokenization

```text
"I love machine learning"
```

↓

```text
["I", "love", "machine", "learning"]
```

Helps the computer understand individual words.

---

### Stop Word Removal

```text
["I", "love", "machine", "learning"]
```

↓

```text
["love", "machine", "learning"]
```

Removes noise.

---

### Stemming / Lemmatization

```text
running
runs
ran
```

↓

```text
run
```

Groups similar words together.

---

### Named Entity Recognition (NER)

```text
Elon Musk founded SpaceX in California.
```

↓

```text
Elon Musk  → Person
SpaceX     → Organization
California → Location
```

Extracts important information.

---

### Text Classification

```text
"This movie is amazing!"
```

↓

```text
Positive Review
```

or

```text
Email → Spam
News → Sports
Tweet → Politics
```

Assigns text to predefined categories.

---

### One-line exam answer

> NLP tasks such as tokenization, stop word removal, stemming, lemmatization, named entity recognition, and text classification help transform unstructured text into meaningful information that can be analyzed, categorized, and used for decision-making.

## TextMining


**1. What is it?**

It is the process of taking massive amounts of messy, **unstructured text** (tweets, Amazon reviews, emails) and turning it into structured data that a computer can actually analyze. it sue the NLP to userstand the texts

**2. The 5-Step Process (How it works):**

1. **Collect:** Gather the text (e.g., scrape Twitter).
    
2. **Preprocess:** Clean it up (remove punctuation, numbers, and useless words like "the").
    
3. **Feature Extraction:** Turn the remaining words into numbers (like using TF-IDF) because computers only understand math.
    
4. **Pattern Discovery:** Run Machine Learning algorithms to find trends.
    
5. **Interpretation:** Use the results to make business decisions.
    

**3. What do we use it for?**

- **Sentiment Analysis:** Figuring out if a review or tweet is positive, negative, or neutral.
    
- **Document Classification:** Automatically sorting text into categories (like deciding if an email is "Spam" or "Inbox").
    
- **Topic Modeling:** Quickly discovering the hidden themes inside a giant pile of thousands of documents.