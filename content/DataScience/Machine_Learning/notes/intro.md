
 The **Model Context Protocol (MCP)** is an **open standard** that defines how AI models (like ChatGPT or Claude) can safely and consistently connect to external **tools, data sources, or applications**.

Basically it enables the AI to get information or the  _**context**_ outside of the prompt automatically
 
Think of it like a “universal adapter” between AI and the outside world.

![[Pasted image 20250818182757.png]]

- we use this MCP in order to prevent defining each in every API call before running the AI

These are the MCP server functions that could be done

Tools
This are MCP tools, which allow us to do functions like read a file and others

Resources

- ﻿﻿Allow the MCP Server to expose data to the client
- ﻿﻿Similar to GET request handlers in a typical  
    HTTP server
- ﻿﻿Can return any type of data - strings, JSON, binary, etc.
- ﻿﻿We set the 'mime_type' to give the client a hint as to what data we are returning
- ﻿﻿Two types: direct and templated

prompts
These are the well optimized and planned prompts stored at the MCP server that could be used by the client or user to generate a good results rather than using a plane prompt 


(in a nutshell MP client helps your CLI to understand what the hell MCP server is doing and MCP servers mix your MCP client to understand what the hell API or data is doing 

AI (like ChatGPT)  ←→  MCP Client  ←→  MCP Server  ←→  Data/API

)

---
Tags: #math #statistics


#Concepts_and_Fundamentals
