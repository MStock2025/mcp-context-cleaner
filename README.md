# mcp-context-cleaner

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A zero-dependency, ultra-lightweight Node.js middleware to clean, minify, and optimize JSON payloads returned by **Model Context Protocol (MCP)** servers before they are injected into LLM context windows (like Claude's prompt context). 

## ⚡ The Problem: The MCP Token Tax
MCP servers are highly effective tools for extending LLM capabilities, but they often return verbose structures. These contain:
* Unnecessary HTML formatting or empty wrappers.
* Duplicate whitespace, indentation, or newlines.
* Heavy logs, stack traces, and internal debug fields (e.g. `metadata`, `debug`, `verbose`).
* Extremely long unstructured contents that hog the context window.

This verbose information quickly inflates prompt size, leading to **increased token costs**, **slower response times**, and **hallucinations** due to context noise. `mcp-context-cleaner` strips out the garbage and optimizes strings to keep your context window lean, clean, and cheap.

---

## ✨ Features
* **Zero Dependencies**: Pure, modern ES Modules Node.js (JavaScript).
* **Superfluous Key Strip**: Automatically removes debug-heavy metadata structures (e.g., `metadata`, `debug`, `verbose`).
* **Whitespace & Newline Compacting**: Compresses consecutive spaces and redundant newlines into a compact, clean format.
* **Recursive Clean**: Recursively deletes empty arrays, empty objects, `null`, `undefined`, and empty strings.
* **HTML Minification**: Strips out empty HTML tags (e.g., `<div><span></span></div>`) recursively while keeping valuable content intact.
* **Intelligent String Truncation**: Truncates strings over `maxStringLength` and appends a human-readable suffix showing the truncated character count.
* **Dual Format Support**: Works seamlessly on both parsed JavaScript objects/arrays and raw serialized JSON strings.

---

## 📦 Installation

Since this library is ultra-lightweight and dependency-free, you can copy the `index.js` file directly into your codebase, or install it via npm/yarn once published:

```bash
npm install mcp-context-cleaner
```

---

## 🚀 Quick Start

Here is how you can integrate the optimizer into your MCP tool runner:

```javascript
import { cleanMcpPayload } from 'mcp-context-cleaner';

// Simulated raw payload returned by an MCP server
const mcpPayload = {
  status: "success",
  metadata: {
    requestId: "req-123456",
    internalTraceId: "trace-99a8f",
  },
  data: {
    message: "   This text has   excessive whitespace   and \n\n empty tags: <div><span></span><p>Keep Me</p></div>",
    longString: "A".repeat(1500),
    uselessNull: null,
    emptyList: []
  }
};

// Clean the payload
const optimizedPayload = cleanMcpPayload(mcpPayload, {
  maxStringLength: 500, // Truncate strings longer than 500 chars
});

console.log(optimizedPayload);
/*
Output:
{
  status: "success",
  data: {
    message: "This text has excessive whitespace and empty tags: <p>Keep Me</p>",
    longString: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA... [truncated 1000 chars]"
  }
}
*/
```

---

## ⚙️ Configuration Options

You can customize the cleaner's behavior by passing an options object to `cleanMcpPayload(payload, options)`:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxStringLength` | `number` \| `null` | `1024` | Maximum character length for any string. Strings longer than this will be truncated. Set to `null` to disable. |
| `removeEmptyHtmlTags` | `boolean` | `true` | Recursively removes empty HTML tags (e.g. `<span></span>`) from text content. |
| `removeEmptyKeys` | `boolean` | `true` | Recursively removes keys with `null`, `undefined`, `""`, empty objects `{}`, and empty arrays `[]`. |
| `superfluousKeys` | `string[]` | `['metadata', 'debug', 'verbose']` | Keys that should be deleted entirely from the payload. |
| `trimStrings` | `boolean` | `true` | Trims leading and trailing whitespace from string properties. |
| `collapseWhitespace` | `boolean` | `true` | Collapses multiple spaces and redundant newlines into single spaces/newlines. |

---

## 🧪 Running Tests

A lightweight assertion suite is provided to verify correct utility behavior:

```bash
npm test
```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
