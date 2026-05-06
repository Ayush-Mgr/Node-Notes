it removes the rows of existing TABLE  


The basic syntax is:

```sql
DELETE FROM table_name
WHERE condition;
```

Without a `WHERE` clause, it deletes **all** rows — so be careful.

---

### **Example 1 – Delete specific rows**

```sql
DELETE FROM product_Avilable
WHERE avilable = 'N';
```

Removes all products that are not available.

---

### **Example 2 – Delete using a subquery**

```sql
DELETE FROM product_Avilable
WHERE products IN (
    SELECT product
    FROM Sales_Table
    WHERE price < 2
);
```

Deletes products whose price is less than 2 in `Sales_Table`.

---

### **Example 3 – Delete using a JOIN**

This is often faster and works in safe update mode.

```sql
DELETE p
FROM product_Avilable AS p
JOIN Sales_Table AS s
ON p.products = s.product
WHERE s.price < 2;
```

---

⚠ **In MySQL Workbench safe mode**, `DELETE` follows the same rules as `UPDATE` — you need a key column in `WHERE`, or disable safe mode with:

```sql
SET SQL_SAFE_UPDATES = 0;
```

---

---
Tags: #data-engineering #sql


#SQL_and_Databases
