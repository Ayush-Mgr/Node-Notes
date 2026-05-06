[[programing-Lang/SQL/MySql/0. source|0. source]]

`pip install mysql-connector-python`


# conecting
```Python
import mysql.connector

from mysql.connector import Error

import pandas as pd



def serve_connect (host_name,user_name,user_pass,database = None):

	connection = None
	
	try:
	
		connection = mysql.connector.connect(host = host_name, user = user_name , passwd = user_pass )
		
		print('Connected')
	
	except Error as err:
	
		print ('connection unsuccessful reason : ' , err)
	
	return connection

  

serve_connect('localhost','root','09876543') 

```



here:

- `mysql.connector.connect(host = host_name, user = user_name , passwd = user_pass , database = database_name ) `: is the function that actually connects us to the SQL server



#   QUEERING


```Pyhon

connection = serve_connect('localhost','root','09876543')

def Query(query):

cursor = connection.cursor()

try:

cursor.execute(query)

Rows = cursor.fetchall()

for row in Rows:

print(row)

except Error as err:

print('ERROR: ',err)

  

Query("USE practice_base;")

Query("SELECT * FROM Sales_Table;") 
```

Here:
- cursor() : this function allows you to execute and outcome of the curry 
	- Send SQL statements to MySQL (`cursor.execute(...)`)
    
	- Fetch query results (`cursor.fetchall()`, `cursor.fetchone()`, etc.)


# commit &  rollback

In order to change the changes (alter, insert, drop, etc.) in data frame, we use **`commit()`** after each and every change

```SQL
connecion.commit()
```

To commit the changes done until now to  the database permanently

---

If we did some mistake while making some changes , we could roll back to the last commit using rollback()

```SQL
connecion.rollback()
```


---
Tags: #data-engineering #sql


#Miscellaneous
