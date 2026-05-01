### 🔄 Case Modification

These methods change the capitalization of the string.

- **`capitalize()`**: Converts the first character to upper case and the rest to lower case.
    
- **`lower()`**: Converts all characters to lower case.
    
- **`upper()`**: Converts all characters to upper case.
    
- **`swapcase()`**: Swaps the case of all characters (lower becomes upper, upper becomes lower).
    
- **`title()`**: Converts the first character of every word to upper case.
    
- **`casefold()`**: A more aggressive version of `lower()` used for caseless string comparisons (handles more Unicode characters).
    

---

### 🔍 Searching and Replacing

These methods find, count, or replace substrings.

- **`count(substring, start, end)`**: Returns the number of times a substring appears in the string.
    
- **`find(substring, start, end)`**: Searches for a substring and returns the lowest index where it's found. Returns **-1** if not found.
    
- **`index(substring, start, end)`**: Same as `find()`, but raises a **ValueError** if the substring is not found.
    
- **`rfind(substring, start, end)`**: Same as `find()`, but searches from the right side (returns the highest index).
    
- **`rindex(substring, start, end)`**: Same as `index()`, but searches from the right side.
    
- **`startswith(prefix, start, end)`**: Returns `True` if the string starts with the specified prefix.
    
- **`endswith(suffix, start, end)`**: Returns `True` if the string ends with the specified suffix.
    
- **`replace(old, new, count)`**: Replaces all occurrences of the `old` substring with the `new` substring. You can limit the number of replacements with `count`.
    

---

### ✂️ Splitting and Joining

These methods break a string into a list or join a list into a string.

- **`split(separator, maxsplit)`**: Splits the string into a list of substrings. If no separator is specified, it splits by any whitespace.
    
- **`rsplit(separator, maxsplit)`**: Same as `split()`, but splits from the right side.
    
- **`splitlines(keepends)`**: Splits the string at line breaks (`\n`, `\r\n`, etc.) and returns a list.
    
- **`partition(separator)`**: Splits the string at the _first_ occurrence of the separator. It returns a tuple of three parts: (part before, the separator, part after).
    
- **`rpartition(separator)`**: Same as `partition()`, but splits at the _last_ occurrence of the separator.
    
- **`join(iterable)`**: **This is a key one!** It's called on the _delimiter_ string and joins the elements of an iterable (like a list) into a single string.
    
    - _Example:_ `"-".join(["a", "b", "c"])` returns `"a-b-c"`.
        

---

### 🧹 Trimming and Padding (Alignment)

These methods add or remove characters (usually whitespace) from the ends of the string.

- **`strip(chars)`**: Removes any leading and trailing characters specified. If no `chars` are given, it removes whitespace.
    
- **`lstrip(chars)`**: Removes leading characters (from the left).
    
- **`rstrip(chars)`**: Removes trailing characters (from the right).
    
- **`center(width, fillchar)`**: Centers the string within a given `width`, padding with the `fillchar` (default is space).
    
- **`ljust(width, fillchar)`**: Left-justifies the string, padding on the right.
    
- **`rjust(width, fillchar)`**: Right-justifies the string, padding on the left.
    
- **`zfill(width)`**: Pads the string on the left with zeros (`0`) to fill the given width.
    

---

### ✅ Boolean Checks (Validation)

These methods check the characters in the string and return `True` or `False`.

- **`isalnum()`**: Returns `True` if all characters are alphanumeric (letters or numbers) and there is at least one character.
    
- **`isalpha()`**: Returns `True` if all characters are alphabetic (letters).
    
- **`isdecimal()`**: Returns `True` if all characters are decimal characters.
    
- **`isdigit()`**: Returns `True` if all characters are digits.
    
- **`isnumeric()`**: Returns `True` if all characters are numeric characters (includes digits, fractions, etc.).
    
- **`isidentifier()`**: Returns `True` if the string is a valid Python identifier (e.g., variable name).
    
- **`islower()`**: Returns `True` if all cased characters are lowercase.
    
- **`isupper()`**: Returns `True` if all cased characters are uppercase.
    
- **`isspace()`**: Returns `True` if all characters are whitespace (space, tab, newline).
    
- **`istitle()`**: Returns `True` if the string follows the rules of a title (every word capitalized).
    
- **`isprintable()`**: Returns `True` if all characters are printable (or if the string is empty).
    
- **`isascii()`**: Returns `True` if all characters are ASCII.
    

---

### 📝 Formatting and Encoding

- **`format(*args, **kwargs)`**: Formats the string using positional or keyword arguments.
    
    - _Example:_ `"Hello, {}".format("World")`
        
- **`format_map(mapping)`**: Formats the string using a dictionary-like mapping.
    
- **`encode(encoding, errors)`**: Encodes the string into a `bytes` object using the specified encoding (e.g., 'utf-8').
    
- **`maketrans(x, y, z)`**: Creates a translation table used by the `translate()` method.
    
- **`translate(table)`**: Returns a copy of the string where each character has been mapped through the given translation table.
    

> **Note on Formatting:** While `.format()` is listed, the most modern and preferred way to format strings in Python is using **f-strings** (formatted string literals):
> 
> `name = "World"`
> 
> `print(f"Hello, {name}")`

---

### Built-in Functions (Not Methods)

Finally, there are a few built-in **functions** (not methods) that are essential for working with strings:

- **`len(s)`**: Returns the number of characters in the string `s`.
    
- **`str(obj)`**: Converts an object `obj` into its string representation.
    
- **`print(s)`**: Prints the string `s` to the console.
    
- **`input(prompt)`**: Displays a `prompt` and returns the string typed by the user.
    
- **`repr(s)`**: Returns a printable representation of the string, often showing quotes and escape characters.

---
Tags: #data-engineering #sql


#Python_Basics
