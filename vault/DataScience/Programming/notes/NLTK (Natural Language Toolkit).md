| Module / Function               | What it does (in 5-8 words)              | Most Used Classes / Functions                                    |
| ------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| **nltk.tokenize**               | Split text into words/sentences          | word_tokenize, sent_tokenize, wordpunct_tokenize, TweetTokenizer |
| **nltk.stem**                   | Reduce words to root form                | PorterStemmer(), LancasterStemmer(), SnowballStemmer('language') |
| **nltk.stem.WordNetLemmatizer** | Proper lemmatization (needs POS)         | lemmatize(word, pos='n')                                         |
| **nltk.corpus**                 | Built-in datasets & resources            | stopwords, wordnet, brown, reuters, gutenberg, cmudict           |
| **nltk.corpus.stopwords**       | Common useless words                     | words('english') → list of 179 words                             |
| **nltk.tag**                    | Part-of-Speech tagging                   | pos_tag(tokens), perceptron_tagger                               |
| **nltk.chunk**                  | Shallow parsing & NER                    | ne_chunk(tagged_tokens)                                          |
| **nltk.sentiment.vader**        | Best rule-based sentiment (social media) | SentimentIntensityAnalyzer() → polarity_scores()                 |
| **nltk.wordnet**                | Synonyms, antonyms, hypernyms etc.       | synsets('dog'), lemma.synset().hypernyms()                       |
| **nltk.FreqDist**               | Word frequency counter (very fast)       | FreqDist(tokens).most_common(20)                                 |
| **nltk.collocations**           | Find bigrams/trigrams that appear often  | BigramCollocationFinder, TrigramCollocationFinder                |
| **nltk.classify**               | Classic ML classifiers                   | NaiveBayesClassifier, MaxentClassifier                           |
| **nltk.metrics**                | Evaluation scores                        | accuracy(), precision(), recall(), bleu_score()                  |
| **nltk.translate.bleu_score**   | Calculate BLEU for machine translation   | sentence_bleu(ref, hyp)                                          |
| **nltk.parse**                  | Constituency & dependency parsing        | ChartParser, RecursiveDescentParser                              |
| **nltk.tree**                   | Work with parse trees                    | Tree.fromstring("(S (NP I) (VP run))")                           |

### Top 10 One-Liners You Use Daily

```python
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk import pos_tag, ne_chunk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

tokens     = word_tokenize(text.lower())
clean      = [w for w in tokens if w.isalpha() and w not in stopwords.words('english')]
stemmed    = [PorterStemmer().stem(w) for w in clean]
lemmatized = [WordNetLemmatizer().lemmatize(w, pos='v') for w in clean]
tagged     = pos_tag(tokens)
entities   = ne_chunk(tagged)
sentiment  = SentimentIntensityAnalyzer().polarity_scores(text)['compound']
```

### Must Download Once (Best Command 2025)
```python
import nltk
nltk.download('popular')          # 11 packages, ~150 MB
# OR minimal (fastest)
nltk.download(['punkt','averaged_perceptron_tagger','wordnet','stopwords','vader_lexicon','omw-1.4'])
```

**Bottom Line (2025)**  
NLTK = The ultimate teaching & quick-experiment library  
Still unbeatable for WordNet, corpora, and readable code  
For speed/production → switch to spaCy / Transformers later 

---
Tags: #nlp #text-processing


#Machine_Learning_Concepts_In_Programming
