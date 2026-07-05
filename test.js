import { cleanMcpPayload } from './index.js';

console.log('🧪 Starting MCP Context Cleaner Test Suite...\n');

let testsFailed = false;

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    testsFailed = true;
  }
}

// --- Test Case 1: Complex, Heavy MCP Payload ---
const heavyPayload = {
  status: "success",
  metadata: {
    requestId: "req-123456",
    timestamp: "2026-07-05T20:13:21Z",
    internalTrace: {
      spanId: "span-abc",
      debugInfo: "some heavy debug info here that we don't need"
    }
  },
  debug: {
    verboseLog: "verbose logs..."
  },
  data: {
    summary: "  This is a   very long string with   extra spaces. \n\n\nAnd multiple newlines.   ",
    emptyTags: "<div><span></span><p>Hello World</p><span>   </span></div>",
    nestedEmptyTags: "<div><span></span><span>   </span></div>",
    longText: "A".repeat(2000),
    nullField: null,
    undefinedField: undefined,
    emptyString: "",
    emptyArray: [],
    emptyObject: {},
    validArray: [
      { id: 1, name: "Alice", extra: null },
      { id: 2, name: "Bob", notes: "" }
    ],
    nested: {
      keepThis: "Keep",
      removeThis: null
    }
  }
};

const cleaned = cleanMcpPayload(heavyPayload, { maxStringLength: 100 });

// 1. Assert superfluous keys ('metadata', 'debug') are removed
assert(cleaned.metadata === undefined, '❌ Error: metadata key was not removed');
assert(cleaned.debug === undefined, '❌ Error: debug key was not removed');
assert(cleaned.status === "success", '❌ Error: basic status field was lost');

// 2. Assert whitespace cleanup
const expectedSummary = "This is a very long string with extra spaces.\nAnd multiple newlines.";
assert(cleaned.data.summary === expectedSummary, `❌ Error: summary whitespace collapse failed. Got: ${JSON.stringify(cleaned.data.summary)}`);

// 3. Assert empty HTML tag cleanup
assert(cleaned.data.emptyTags === "<div><p>Hello World</p></div>", `❌ Error: HTML tags cleanup failed. Got: ${cleaned.data.emptyTags}`);
assert(cleaned.data.nestedEmptyTags === undefined, `❌ Error: Nested empty HTML tags were not completely stripped`);

// 4. Assert string truncation
const expectedTruncatedText = "A".repeat(100) + "... [truncated 1900 chars]";
assert(cleaned.data.longText === expectedTruncatedText, '❌ Error: longText truncation failed');

// 5. Assert null, empty, and empty object/array keys are removed
assert(cleaned.data.nullField === undefined, '❌ Error: null field was not removed');
assert(cleaned.data.undefinedField === undefined, '❌ Error: undefined field was not removed');
assert(cleaned.data.emptyString === undefined, '❌ Error: empty string field was not removed');
assert(cleaned.data.emptyArray === undefined, '❌ Error: empty array field was not removed');
assert(cleaned.data.emptyObject === undefined, '❌ Error: empty object field was not removed');

// 6. Assert array item cleaning
assert(cleaned.data.validArray.length === 2, '❌ Error: validArray length mismatch');
assert(cleaned.data.validArray[0].extra === undefined, '❌ Error: nested null field in array was not removed');
assert(cleaned.data.validArray[1].notes === undefined, '❌ Error: nested empty string in array was not removed');

// 7. Assert nested object cleaning
assert(cleaned.data.nested.keepThis === "Keep", '❌ Error: valid nested key was removed');
assert(cleaned.data.nested.removeThis === undefined, '❌ Error: empty nested key was not removed');


// --- Test Case 2: JSON String payload ---
const stringPayload = JSON.stringify({
  text: "Hello  World",
  metadata: { secret: "info" }
});

const cleanedString = cleanMcpPayload(stringPayload, { maxStringLength: 50 });
const parsedCleanedString = JSON.parse(cleanedString);

assert(parsedCleanedString.text === "Hello World", '❌ Error: JSON string content was not cleaned');
assert(parsedCleanedString.metadata === undefined, '❌ Error: JSON string metadata was not removed');


// --- Test Case 3: Empty Payload Edge Cases ---
const emptyObjResult = cleanMcpPayload({});
assert(Object.keys(emptyObjResult).length === 0, '❌ Error: Cleaning empty object should return empty object');

const emptyStringResult = cleanMcpPayload('   ');
assert(emptyStringResult === '', '❌ Error: Cleaning whitespace-only raw string should return empty string');


if (testsFailed) {
  console.log('\n❌ Test suite failed. Please check the errors above.');
  process.exit(1);
} else {
  console.log('✅ All assertions passed successfully! The payload optimizer is running flawlessly.');
  console.log('\nBefore optimization size (JSON.stringify):', JSON.stringify(heavyPayload).length, 'characters');
  console.log('After optimization size (JSON.stringify):', JSON.stringify(cleaned).length, 'characters');
  const savingPercent = ((JSON.stringify(heavyPayload).length - JSON.stringify(cleaned).length) / JSON.stringify(heavyPayload).length * 100).toFixed(1);
  console.log(`📉 Space saved: ${savingPercent}%!`);
}

