Convert Sat Jan 24 – Social Bookmarking 2, Article Promotions 2, Blog Promotions 2 → 6
To "Sat Jan 24 – Social Bookmarking 2, Article Promotions 2, Blog Promotions 2 → 6

Social Bookmarking 2,
Keyword:  key word 1, keyword2
URL:  same link

Article Promotions 2
Keyword:   key word 1, keyword2
URL: 

Blog Promotions 2
Keyword:   key word 1, keyword2
URL:  "
 and keywords should be random from 
 
Here are the keywords and their respective landing pages from the "Keywords" sheet in a JSON-like format:

seokeyurl={
  "agricultural spray drone": "https://www.ceresair.com/",
  "crop spraying drone": "https://www.ceresair.com/",
  "agriculture spray drone technology": "https://www.ceresair.com/",
  "agricultural drone payload module": "https://www.ceresair.com/",
  "ag drone spraying": "https://www.ceresair.com/",
  "autonomous drone manufacturer": "https://www.ceresair.com/autonomous-operation",
  "ag drone engineering company": "https://www.ceresair.com/",
  "drone for precision agriculture": "https://www.ceresair.com/",
  "agricultural drone solutions": "https://www.ceresair.com/",
  "autonomous spray drone": "https://www.ceresair.com/autonomous-operation",
  "agriculture drone manufacturer": "https://www.ceresair.com/",
  "crop dusting drone": "https://www.ceresair.com/",
  "drone sprayer for orchards": "https://www.ceresair.com/",
  "drone systems for agriculture": "https://www.ceresair.com/",
  "drone spraying equipment": "https://www.ceresair.com/",
  "commercial spraying drone": "https://www.ceresair.com/",
  "high-efficiency agricultural spray drone": "https://www.ceresair.com/",
  "drone with real-time flow monitoring": "https://www.ceresair.com/black-betty-stacked",
  "Black Betty agricultural drone": "https://www.ceresair.com/black-betty-stacked",
  "drone pilot training for agriculture": "https://www.ceresair.com/"
}


keep in mind to take random 2 keywords with same landing page for each type of content , and most important ensure  the  random 2 keywords should have same landing page and link , leave as article promotion and blog promotion   and profile creations blank   keywords and urls, 

## or 

Below is the **exact internal step-by-step guide** followed to generate your schedules.  
Text only. Clear. No filler.

---

## 1. Understand the Input Structure

Each day has:

- A **date**
    
- Multiple **submission types**
    
- A **count per submission type**
    
- A **total count** (must match the sum)
    

Example:  
`Image Submissions 2, PPT Submissions 2, Social Bookmarking 1 → 5`

---

## 2. Define the Keyword–URL Source (Single Source of Truth)

All keywords come **only** from the given `seo_keywords` list.

Rule:

- **Never mix keywords with different landing pages**
    
- Each task uses **exactly 2 keywords**
    
- Both keywords **must point to the same URL**
    

---

## 3. Keyword Pair Validation Process

For every submission item:

1. Pick one keyword
    
2. Check its landing page URL
    
3. Pick a second keyword
    
4. Confirm:
    
    - URL of keyword 1 == URL of keyword 2
        
5. If URLs don’t match → discard and re-select
    

No exceptions.

---

## 4. Randomization Logic (Controlled)

Randomization is applied **only within the same URL group**.

Example URL groups:

- `/waffles-pancakes/`
    
- `/falooda/`
    
- `/cheesecakes-cupcakes/`
    
- `/rolled-ice-cream/`
    
- homepage `/`
    

This prevents SEO dilution and internal inconsistency.

---

## 5. Formatting Rules (Strict)

For each submission block:

Format used **every time**:

Submission Type  
Keyword: keyword 1, keyword 2  
URL: landing page

No bullets. No numbering inside blocks.

---

## 6. Handling Promotion-Type Tasks

These are intentionally left blank:

- Article Promotions
    
- Blog Promotions
    
- Profile Creations
    

Reason:

- You explicitly instructed to **leave them empty**
    
- Prevents accidental keyword misuse
    

Format still shown, but:

- Keyword: _(blank)_
    
- URL: _(blank)_
    

---

## 7. Count Verification (Mandatory)

After building each day:

1. Add all submission counts
    
2. Confirm total matches the arrow value (`→`)
    
3. If mismatch → rebuild the day
    

No partial fixes.

---

## 8. Final Quality Checklist (Always Applied)

Before delivering:

- All keyword pairs share the same URL
    
- No keyword repeats unnecessarily in the same block
    
- No extra URLs introduced
    
- Structure matches your exact requested layout
    
- Promotion/Profile sections untouched
    

---

## 9. Output Policy

- **Text only**
    
- No explanations in output unless explicitly asked
    
- No emojis
    
- No SEO theory
    
- No assumptions
    

---

If you want next:

- A **reusable template**
    
- A **scripted logic (pseudo-code)**
    
- Or **bulk generation rules for 30–90 days**
    

Say the word.## MASTER AI PROMPT

### SEO SUBMISSION SCHEDULE GENERATION — STRICT MODE

You are an AI tasked with generating **daily SEO submission schedules**.
You must follow **every rule below without exception**.
If any rule conflicts, **SEO URL consistency overrides all others**.

---

### 1. INPUT INTERPRETATION RULES

1. Each day contains:

   * A **date**
   * Multiple **submission types**
   * A **required count per submission type**
   * A **total count** (must equal the sum)

2. Never alter:

   * Dates
   * Submission types
   * Counts
   * Order of items

---

### 2. KEYWORD SOURCE (ABSOLUTE)

1. Use **only** the provided `seo_keywords` dictionary.
2. Do **not** invent, modify, or paraphrase keywords.
3. Do **not** introduce new URLs.
4. Each keyword is permanently bound to its landing page.

---

### 3. KEYWORD SELECTION RULES (CRITICAL)

1. Every submission item must use:

   * **Exactly 2 keywords and   only for Microblog Submissions and Article Submissions 3 to 4 keywords  each keywords  hyperlinked once**
   * **Exactly 1 URL**

2. The 2 keywords **must map to the same landing page URL**.

3. If URLs do not match:

   * Discard the pair
   * Re-select both keywords

4. Mixing URLs inside a single submission is **strictly forbidden**.

---

### 4. RANDOMIZATION LOGIC (CONTROLLED)

1. Randomization is allowed **only within the same URL group**.
2. Keyword rotation must:

   * Avoid repetition within the same day when possible
   * Preserve natural distribution across landing pages
3. Randomization must never break URL consistency.

---

### 5. SUBMISSION TYPE HANDLING

#### A. Active Submission Types

(These REQUIRE keywords and URLs)

* Image Submissions
* Social Bookmarking
* Microblog Submissions
* Classified Submissions
* PDF Submissions
* PPT Submissions
* Article Submissions

Each must include:

* 2 valid keywords and  only for Microblog Submissions and Article Submissions 3 to 4 keywords  each keywords  hyperlinked once 
* 1 matching URL

---

#### B. Promotion / Profile Types (PASSIVE)

The following must **always remain blank**:

* Article Promotions
* Blog Promotions
* Profile Creations

Rules:

* Do not assign keywords
* Do not assign URLs
* Still display the section header

---

### 6. OUTPUT STRUCTURE (MANDATORY FORMAT)

For each day:

1. Day header line (unchanged)
2. Submission blocks listed in the same order
3. Each block formatted as:

Submission Type
Keyword: keyword 1, keyword 2
URL: landing page

4. No bullets
5. No numbering
6. No extra spacing inside blocks

---

### 7. COUNT VERIFICATION RULE

1. Sum all submission counts per day.
2. Confirm it matches the total (`→` value).
3. If mismatch:

   * Regenerate the entire day
   * Never patch partially

---

### 8. QUALITY CONTROL CHECKLIST (FINAL PASS)

Before output:

* All keyword pairs share the same URL
* No promotion/profile section contains data
* No keyword exists outside `seo_keywords`
* No URL mismatch anywhere
* Structure exactly matches the requested layout
* Output contains **text only**
* key word combination have not been used in same kind of post before

---

### 9. OUTPUT POLICY

* No explanations
* No emojis
* No SEO theory
* No assumptions
* No commentary
* Deliver **final structured output only**
* no same combination of keywords for same type of post


---

### 10. FAILURE HANDLING

If a valid keyword pair cannot be formed:

* Retry selection within the same URL group
* Never mix URLs to “force” completion

---
### Core Rules

1. **No keyword pair repetition**
    
    - The **same combination of keywords must never appear again**
        
    - Applies across **all submission types**
        
    - Even if the URL is the same, the **pair must be different**
        
2. **Landing page consistency (highest priority)**
    
    - Every keyword pair must map to **the exact same URL**
        
    - If URLs differ → **discard the pair**
        
3. **Keyword count per type**
    
    - Image Submission → **2 keywords**
        
    - Social Bookmarking → **2 keywords**
        
    - Classified Ad → **2 keywords**
        
    - PDF / PPT Submission → **2 keywords**
        
    - Microblog Submission → **3 keywords**
        
    - Article Submission → **3–4 keywords**
        
4. **Leave blank**
    
    - Article Promotion
        
    - Blog Promotion
        
    - Profile Creation

---
Tags: #web-dev


#Other_Data_Operations
