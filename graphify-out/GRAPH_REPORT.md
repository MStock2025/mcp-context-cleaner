# Graph Report - 043_mcp-context-cleaner  (2026-11-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 26 nodes · 27 edges · 5 communities (3 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- package.json
- test.js
- index.js
- engines
- scripts

## God Nodes (most connected - your core abstractions)
1. `cleanValue()` - 4 edges
2. `cleanMcpPayload()` - 3 edges
3. `engines` - 2 edges
4. `scripts` - 2 edges
5. `author` - 1 edges
6. `keywords` - 1 edges
7. `license` - 1 edges
8. `main` - 1 edges
9. `cleaned` - 1 edges
10. `cleanedString` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (5 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.22
Nodes (8): author, description, keywords, license, main, name, type, version

### Community 1 - "test.js"
Cohesion: 0.22
Nodes (7): cleaned, cleanedString, emptyObjResult, emptyStringResult, heavyPayload, parsedCleanedString, stringPayload

### Community 2 - "index.js"
Cohesion: 0.67
Nodes (3): cleanMcpPayload(), cleanValue(), defaultOptions

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `engines` connect `engines` to `package.json`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `cleanMcpPayload()` connect `index.js` to `test.js`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._