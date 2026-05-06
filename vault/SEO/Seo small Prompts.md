 from
@
give me only B,O and P column values, where P column values are < O col. values if not or NA skip the values of B,O and P col. where O(02.03.2026) and P(09.03.2026)

#Computer_Science_and_Programming

---

could you do =COUNTIFS( G cell where B cell has APRIL Month Backlinks :end of G cell , "https*") for this sheets (Social Bookmarking Image Submission Microblog Submission 
Classified ads Submission Article submission Article Promotion Profile Creation )

use these internal logic steps:

1. **Cross-Sheet Scope:** I identified that the data wasn't just on the active sheet but spread across seven specific tabs.
2. **Column Mapping:** I looked for the structure of your tables. I determined that **Column B** usually contains the "Month" and **Column G** contains the "Live Link" or URL.
3. **Condition 1 (Month):** I filtered the rows to only look at those where Column B contained the text "April" (case-insensitive).
4. **Condition 2 (Pattern):** I scanned Column G in those specific rows for any text starting with "https".
5. **Aggregation:** I calculated the count for each sheet individually and then summed them up for the "Grand Total."
6. **Verification:** I extracted a few sample links from each sheet to ensure the data I was counting was actually what you were looking for.



**Task: Multi-Sheet Backlink Analysis**

  

**Objective:** Count the number of live backlinks generated in a specific month across multiple spreadsheet tabs.

  

**Data Scope:** Please analyze the following tabs in this spreadsheet:

- Social Bookmarking
- Image Submission
- Microblog Submission
- Classified ads Submission
- Article submission
- Article Promotion
- Profile Creation

**Specific Criteria:**

1. **Identify Columns:** In each tab, locate the column for **Month** (usually Column B) and the column for **Live Links/URLs** (usually Column G).
2. **Filter by Month:** Only consider rows where the Month column is **"April"**.
3. **Count Links:** Within those filtered rows, count how many cells in the Live Link column start with **"https"**.

**Output Format:**

- Provide a summary table showing the **Sheet Name** and the **Backlink Count** for April.
- Provide a **Grand Total** of all April backlinks.
- List the **first 3-5 example URLs** from each sheet so I can verify the data.

---