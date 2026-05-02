Conditions of WHERE clause
```SQL
-- Equality
WHERE column = value

-- Inequality
WHERE column != value
WHERE column <> value

-- Greater / Less Than
WHERE column > value
WHERE column < value
WHERE column >= value
WHERE column <= value

-- BETWEEN Range
WHERE column BETWEEN value1 AND value2

-- IN List
WHERE column IN (value1, value2, value3)

-- NOT IN List
WHERE column NOT IN (value1, value2)

-- LIKE Pattern (for strings)
WHERE column LIKE 'A%'     -- starts with A
WHERE column LIKE '%A'     -- ends with A
WHERE column LIKE '%A%'    -- contains A

-- NOT LIKE
WHERE column NOT LIKE '%A%'

-- IS NULL / IS NOT NULL
WHERE column IS NULL
WHERE column IS NOT NULL

-- Multiple Conditions
WHERE column1 = value1 AND column2 > value2
WHERE column1 = value1 OR column2 = value2
WHERE (column1 = value1 AND column2 > value2) OR column3 < value3

-- Boolean/Bit column
WHERE is_active = TRUE
WHERE is_deleted = 0
```

---
Tags: #data-engineering #sql


#Python_Basics
