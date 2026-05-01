> the reason warrant of it never used this method is because the discount should be obvious if  we have to use such formula like NPV to calculate the minute discount of a company then the discount is not big enough for your investment


This is arguably the most important formula in finance because it answers the ultimate business question: _"Will this idea make us richer or poorer?"_

### **The Concept: "Is it worth it?"**

Imagine you buy a machine today for **$100**. It will pay you **$120** next year.

- **Profit:** $20.
    
- **Problem:** You have to wait a whole year to get that money. Since money today is worth more than money tomorrow (due to inflation and opportunity cost), that future $120 isn't _actually_ worth $120 right now.
    

**NPV** fixes this. It translates all that future money into "today's dollars" so you can compare it directly to the price tag.

---

### **The Simple Formula**

NPV=Present Value of Future Cash−Initial Cost

- **If NPV is Positive (+):** The project creates value. **(Do it!)**
    
- **If NPV is Negative (-):** The project destroys value. **(Don't do it!)**
    

---

### **Let's Do an Exercise (Java Corp Returns)**

Let's stick with our coffee shop, **Java Corp**.

**The Scenario:** Java Corp wants to buy a specialized blender.

1. **Cost (Initial Investment):** $1,000 (paid today).
    
2. **Future Cash Flow:** It will earn the shop **$1,100** exactly one year from now.
    
3. **Discount Rate (WACC):** 10% (This is the "hurdle" rate we calculated earlier).
    

**The Calculation:**

**Step 1: Discount the Future Cash** We need to shrink that future $1,100 back to today's value using the 10% rate.

- **Formula:** (1+Rate)tCash Flow​
    
- **Math:** (1+0.10)11,100​
    
- **Result:** 1,100/1.10=$1,000
    

**Step 2: Subtract the Cost** Now we compare the value of the money coming in vs. the money going out.

- **Formula:** PV of Inflow−Initial Cost
    
- **Math:** $1,000(Value)−$1,000(Cost)
    
- **Result:** $0
    

**The Verdict:** The NPV is **0**. This means the project breaks even exactly. It covers the cost of capital but adds no extra wealth. Java Corp would be "indifferent" to this project.

---

### **Your Turn (Quick Test)**

Let's tweak the numbers slightly to see if you can spot a profitable deal.

- **Initial Cost:** $1,000
    
- **Cash Flow (Year 1):** $1,210
    
- **Discount Rate:** 10%
    

**Question:** What is the NPV? (Is it positive or negative?)

_Hint: Discount the $1,210 first, then subtract the $1,000 cost._

[Net Present Value (NPV) explained](https://www.youtube.com/watch?v=N-lN5xORIwc) This video is relevant because it clearly visualizes the "time travel" of money (discounting future values back to the present) which is the core concept needed to solve the exercise above.

[

![](https://www.gstatic.com/images/branding/productlogos/youtube/v9/192px.svg)







](https://www.youtube.com/watch?v=N-lN5xORIwc)

---
Tags: #programming #tools


#Core_Concepts_and_Terminology
