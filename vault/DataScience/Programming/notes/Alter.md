In SQL, the **`ALTER` query** is used to modify an existing table structure — without dropping/recreating it.

Here are the main uses:

1. **Add a new column**
    

```sql
ALTER TABLE employees
ADD COLUMN salary DECIMAL(10,2);
```

2. **Modify a column (datatype, size, etc.)**
    

```sql
ALTER TABLE employees
MODIFY COLUMN name VARCHAR(100);
```

3. **Rename a column** (syntax depends on DBMS)
    

- MySQL:
    

```sql
ALTER TABLE employees
CHANGE COLUMN old_name new_name VARCHAR(50);
```

- PostgreSQL:
    

```sql
ALTER TABLE employees
RENAME COLUMN old_name TO new_name;
```

4. **Drop (delete) a column**
    

```sql
ALTER TABLE employees
DROP COLUMN salary;
```

5. **Rename a table**
    

```sql
ALTER TABLE employees
RENAME TO staff;
```

---

⚡ In short:  
`ALTER TABLE` = change the **structure** of a table (columns, names, constraints), not the data itself.

Do you want me to make you a **side-by-side MySQL vs PostgreSQL cheat sheet** for `ALTER` (since syntax differs a bit)?

---
Tags: #data-engineering #sql
