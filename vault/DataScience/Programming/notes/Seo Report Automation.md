#projects

## reporting.py
1. **Type Hints (`-> str`)**: We learned that Python doesn't strictly enforce these; they are just "blueprints" for developers and code editors to know what a function _should_ receive or return.
2. **String Formatting (`02d`)**: We saw how to force numbers to a specific length (e.g. padding a single-digit month like `7` so it becomes `07`).
3. **Immutability of Dates**: We learned that Python `date` objects are immutable. Calling `.replace(day=1)` doesn't overwrite the original date variable; it safely spits out a brand new date object for us to use., library calender could be used to get the last date of the month
4. **Time Travel (`timedelta`)**: We figured out that dropping back exactly 24 hours by subtracting (`timedelta(days=1)`) from the 1st of the month is the safest way to find the last day of the previous month, avoiding tricky year-end edge cases!
	You can use a **`timedelta`** to "move" forward or backward to **fix a target date** (like finding an expiration date)
5. target_month.strftime("%B") : `strftime` stands for "String Format Time", and it is Python's built-in tool for translating a raw `date` object into a readable string of text.
	By passing it the special code `"%B"`, you are specifically telling it: _"Give me the full written name of the month."_
	So if `target_month` is `2026-07-19`, then `strftime("%B")` spits out the word `"July"`. (If you had used `"%m"` instead, it would have spit out `"07"`).