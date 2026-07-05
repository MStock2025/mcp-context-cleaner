/**
 * mcp-context-cleaner
 *
 * A lightweight, zero-dependency Node.js middleware/utility to optimize, 
 * clean, and minify MCP (Model Context Protocol) payloads before they 
 * are injected into LLM context windows.
 */

const defaultOptions = {
  maxStringLength: 1024,
  removeEmptyHtmlTags: true,
  removeEmptyKeys: true,
  superfluousKeys: ['metadata', 'debug', 'verbose'],
  trimStrings: true,
  collapseWhitespace: true
};

/**
 * Clean, minify, and optimize an MCP payload.
 * Can handle both JavaScript objects and JSON strings.
 *
 * @param {Object|Array|string} payload - The MCP payload to clean.
 * @param {Object} [options] - Optimization settings.
 * @returns {Object|Array|string} The optimized payload in the same format.
 */
export function cleanMcpPayload(payload, options = {}) {
  const opts = { ...defaultOptions, ...options };
  let isJsonString = false;
  let parsedPayload = payload;

  if (typeof payload === 'string') {
    try {
      parsedPayload = JSON.parse(payload);
      isJsonString = true;
    } catch (e) {
      // It's a raw string, clean it directly
      const result = cleanValue(payload, opts);
      return result === undefined ? '' : result;
    }
  }

  const cleaned = cleanValue(parsedPayload, opts);
  
  if (isJsonString) {
    return cleaned === undefined ? '{}' : JSON.stringify(cleaned);
  }
  return cleaned === undefined ? {} : cleaned;
}

/**
 * Recursively clean and optimize values.
 *
 * @param {*} val - The value to clean.
 * @param {Object} opts - The resolved options.
 * @returns {*} The cleaned value, or undefined if it should be removed.
 */
function cleanValue(val, opts) {
  if (val === null || val === undefined) {
    return undefined;
  }

  const type = typeof val;

  // 1. Strings
  if (type === 'string') {
    let s = val;

    if (opts.trimStrings) {
      s = s.trim();
    }

    if (opts.collapseWhitespace) {
      s = s.replace(/[ \t]+/g, ' ')
           .replace(/[ \t]*\r?\n[ \t]*/g, '\n')
           .replace(/\n{2,}/g, '\n');
    }

    if (opts.removeEmptyHtmlTags) {
      let prev;
      do {
        prev = s;
        s = s.replace(/<([a-zA-Z0-9:-]+)(?:\s+[^>]*)?>\s*<\/\1>/gi, '');
      } while (s !== prev);
    }

    if (opts.maxStringLength && s.length > opts.maxStringLength) {
      const truncatedCount = s.length - opts.maxStringLength;
      s = s.slice(0, opts.maxStringLength) + `... [truncated ${truncatedCount} chars]`;
    }

    if (s === '' && opts.removeEmptyKeys) {
      return undefined;
    }

    return s;
  }

  // 2. Arrays
  if (Array.isArray(val)) {
    const cleanedArr = val
      .map(item => cleanValue(item, opts))
      .filter(item => {
        if (item === undefined || item === null) return false;
        if (opts.removeEmptyKeys) {
          if (item === '') return false;
          if (Array.isArray(item) && item.length === 0) return false;
          if (typeof item === 'object' && Object.keys(item).length === 0) return false;
        }
        return true;
      });

    if (cleanedArr.length === 0 && opts.removeEmptyKeys) {
      return undefined;
    }
    return cleanedArr;
  }

  // 3. Objects (excluding special built-ins like Date and RegExp)
  if (type === 'object') {
    if (val instanceof Date || val instanceof RegExp) {
      return val;
    }

    const cleanedObj = {};
    const keys = Object.keys(val);

    for (const key of keys) {
      // Skip superfluous metadata/debug keys
      if (opts.superfluousKeys && opts.superfluousKeys.includes(key)) {
        continue;
      }

      const cleanedVal = cleanValue(val[key], opts);

      let isEmpty = false;
      if (opts.removeEmptyKeys) {
        if (cleanedVal === undefined || cleanedVal === null || cleanedVal === '') {
          isEmpty = true;
        } else if (Array.isArray(cleanedVal) && cleanedVal.length === 0) {
          isEmpty = true;
        } else if (typeof cleanedVal === 'object' && Object.keys(cleanedVal).length === 0) {
          isEmpty = true;
        }
      } else {
        if (cleanedVal === undefined) {
          isEmpty = true;
        }
      }

      if (!isEmpty) {
        cleanedObj[key] = cleanedVal;
      }
    }

    if (Object.keys(cleanedObj).length === 0 && opts.removeEmptyKeys) {
      return undefined;
    }
    return cleanedObj;
  }

  // 4. Numbers, booleans, and other primitives
  return val;
}
