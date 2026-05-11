
 "Access the Google Sheet tab named 'Profile creation'. Starting specifically from **Row 271** and moving downwards, extract all text from **Column B** and **Column G**.

**Filter Rules:**

1. Only include cells that begin with '**http**'.
2. Skip all header rows (e.g., rows containing 'Websites' or 'Backlink').
3. Ignore all empty or blank cells.

**Output Format:**

Present the results as two separate bulleted lists: one for 'Column B (Websites)' and one for 'Column G (Backlinks)'. Ensure the URLs are presented in their full, original format."

---

Part 3: The Sheets Formula Method (Doing it automatically)

If you want the spreadsheet to generate this list for you automatically in a new cell, you can use the `FILTER` formula.

**For Column B (Place in a cell below Row number):**

```
=FILTER(B give row number:B, LEFT(B give row number:B, 4) = "http")
```

**Formula Result:**

|   |
|---|
|NULL|
|NULL|
|NULL|
|NULL|
|NULL|
|NULL|
|NULL|
|NULL|

**For Column G (Place in a cell below Row 120):**

```
=FILTER(G give row number:G, LEFT(G give row number:G, 4) = "http")
```

**Formula Result:**

|      |
| ---- |
| NULL |
| NULL |
| NULL |
| NULL |
| NULL |
| NULL |
| NULL |
| NULL |
#Untitled 
