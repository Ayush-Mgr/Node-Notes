
# 📈 Growth Stock Valuation Formula (Graham)

### 💡 Formula:

$Value=Earnings×(8.5+2g)$

Where:

- **Earnings** = current or “normal” earnings per share (EPS).
    
- **8.5** = base P/E for zero-growth companies, this is constant and different from companies actual P/E ratio
    
- **g** = expected annual growth rate (in %, e.g., 5 for 5%).
    

---

## 📊 Table 11–4: Graham's Fair P/E for Different Growth Rates

|Expected Growth Rate|Growth in 10 Years|Fair P/E (Multiplier)|
|---|---|---|
|0.0%|0%|8.5|
|2.5%|28%|13.5|
|5.0%|63%|18.5|
|7.2%|100%|22.9|
|10.0%|159%|28.5|
|14.3%|280%|37.1|
|20.0%|519%|48.5|

### 🔍 What it means:

- **More growth = higher fair P/E.**
    
- **Zero growth = 8.5 P/E.**
    
- 10-year growth just shows compounding effect (not needed for the valuation formula).
    

---

## 🤔 Example: What if a stock trades at P/E = 48.5?

Use Graham’s formula:

$48.5=8.5+2g⇒g=20\%$ 

So, the market expects the company to grow earnings **20% per year** for 10 years — which is very hard to maintain.

### 🔥 If you think:

- **20% growth is unrealistic** → Stock is **overvalued** ❌
    
- **20% growth is likely** → Stock is **fairly valued** ✅
    
- **Growth will exceed 20%** → Stock is **undervalued** 🔥
    

---

# 📘 Table 11–5: Real Stocks (1963–1969)

|Company|P/E (1963)|EPS (1963→1969)|Actual Growth|P/E (1969)|Implied Growth (1969)|
|---|---|---|---|---|---|
|AT&T|23.0|3.03 → 4.00|4.75%|12.2|1.8%|
|GE|29.0|3.00 → 3.79|4.0%|20.4|6.0%|
|GM|14.1|5.55 → 5.95|1.17%|11.6|1.6%|
|IBM|38.5|3.48 → 8.21|16.0%|44.4|17.9%|
|Int. Harvester|13.2|2.29 → 2.30|0.1%|10.8|1.1%|
|Xerox|25.0|0.38 → 2.08|29.2%|50.8|21.2%|
|**DJIA**|18.6|41.11 → 57.02|5.5%|14.0|2.8%|

---

### 🧠 Column Meanings:

|Column|Meaning|
|---|---|
|P/E (1963)|How expensive the stock was in 1963|
|EPS Growth|How much earnings increased from 1963 to 1969|
|P/E (1969)|How expensive the stock was in 1969|
|Implied Growth|What future growth the 1969 P/E expects (from Graham's formula)|

---

## ✅ Let's Walk Through a Sample 
### 🔹 **American Telephone & Telegraph (AT&T)**
| Data                    | Value                               |
| ----------------------- | ----------------------------------- |
| 1963 P/E                | 23.0                                |
| EPS 1963 → 1969         | 3.03 → 4.00                         |
| Actual growth           | 4.75% annually                      |
| 1969 P/E                | 12.2                                |
| Implied growth from P/E | 1.8% (calculated from: 12.2=8.5+2g) |
So: 
- Past growth: **4.75%**
- But 1969 P/E only prices in **1.8%** 
- growth → **Conservative** valuation 

✅ **Conclusion**: AT&T in 1969 was **likely undervalued or fairly priced**, assuming it could continue growing even modestly. 

--- 
### 🔹 **Xerox** 
| Data                    | Value                            |
| ----------------------- | -------------------------------- |
| 1963 P/E                | 25.0                             |
| EPS 1963 → 1969         | 0.38 → 2.08                      |
| Actual growth           | 29.2% annually (!)               |
| 1969 P/E                | 50.8 (!!)                        |
| Implied growth from P/E | 21.2% (from 8.5+2g=50.8⇒g=21.2%) |
So: 
- It **did** grow massively in the past.
- But 1969 investors were paying **50× earnings**, betting it will keep growing **20%+ annually**. 
- **Conclusion**: This is risky. **No margin of safety.** If growth slows even a little, the stock price could crash. ❌

---

# 🧠 Graham’s Lesson:

> Always ask:  
> "What is the **market expecting** in terms of growth?"  
> If it’s too optimistic → **No margin of safety.**  
> If it’s reasonable or pessimistic → Might be **undervalued.**

---

# 🛠️ How You Can Use This

1. **Find a stock’s current P/E**
    
2. **Estimate expected growth rate (g)**
    
3. **Calculate Graham's justified P/E**:
    
    8.5+2g
4. **Compare**:
    
    - If **market P/E > justified P/E** → overvalued ❌
        
    - If **market P/E < justified P/E** → undervalued ✅
        

---
# caution

It has a setback if the growth of the company is very high (overhyped companies), it will sometimes keep us very high growth rate, and sometimes infinite growth rate

---
Tags: #data-engineering #sql


#Market_Analysis_and_Valuation
