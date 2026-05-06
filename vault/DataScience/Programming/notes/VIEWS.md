

```SQL
create view sales_Avilable  AS
select  a.product,a.quantity,b.avilable,a.price from Sales_Table as a 
	inner join product_Avilable as b
	on a.product = b.product;
    
    
    
    
select * from sales_Avilable;
```

---
Tags: #data-engineering #sql


#SQL_and_Databases
