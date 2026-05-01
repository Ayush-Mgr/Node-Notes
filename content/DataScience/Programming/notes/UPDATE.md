The `UPDATE` clause lets you modify existing rows in a table.


**Basic syntax:**

```sql
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;
```

⚠ Always use a `WHERE` clause unless you want to update **all** rows.

---

**Examples:**

1. **Update a single row**
    

```sql
UPDATE product_Avilable
SET avilable = 'Y'
WHERE products = 'Apple';
```

This will set `avilable` to `'Y'` for Apple only.

---

2. **Update multiple rows at once**
    

```sql
UPDATE product_Avilable
SET avilable = 'Y'
WHERE products IN ('Apple', 'Banana');
```

   ---

3. **Update based on another table** (using subquery)
    

```sql
UPDATE product_Avilable AS pa
SET avilable = 'Y'
WHERE pa.products IN (
    SELECT product
    FROM Sales_Table
    WHERE price > 2
);
```

---

---
Tags: #data-engineering #sql


#SQL_and_Databases
