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

So your summary:

> **"helps to find the information for analysis"**

is correct. A slightly better wording is:

> **"helps extract meaningful information from text for analysis and prediction."** 👍