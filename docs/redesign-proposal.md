# DataMaster Library: Architectural Redesign v2.0 - Revised

## 1. Design Philosophy: The Swiss Army Knife Principle

The primary goal of this redesign is to transform the library from a complex, single-purpose machine into a versatile and intuitive Swiss Army Knife. The original design, while powerful, suffered from a rigid, process-oriented feel that made it difficult to use for both simple and complex tasks.

This new architecture prioritizes flexibility, clarity, and developer experience. A user should be able to seamlessly switch between broad, declarative commands and fine-grained, imperative modifications. There is no prescribed "workflow"; there is only a collection of sharp, reliable tools, ready for the task at hand.

### Core Design Principles

1. **Clear Mutability Contract**: Every method's effect on the DataMaster instance must be unambiguous to the user
2. **Pure Serialization**: Strict separation between data transformation and data serialization
3. **Error as Data**: Predictable error handling that doesn't force try-catch blocks
4. **Tool Clarity**: Each method has a single, unambiguous responsibility

## 2. The Architectural Foundation

### 2.1 The DataMaster Class: The Central Workshop

The library will be built around a central, powerful `DataMaster` class. This class is the "chassis" of the knife, holding the data and providing all the tools. All other top-level convenience functions are simply wrappers around this core engine.

#### Explicit Factory Methods

The confusing, overloaded constructor will be replaced by a set of explicit static factory methods. This makes instantiation self-documenting.

```javascript
// The primary, user-facing way to create a DataMaster instance.
const dm = DataMaster.fromRecordset(myRecordset);
const dmFromTable = DataMaster.fromTable(myTable, { headers: myHeaders });
const dmFromCsv = DataMaster.fromCsv(csvString, { headersInFirstRow: true });

// A new, powerful factory for integrated testing and generation.
const dmFromGenerator = DataMaster.fromGenerator(myTemplate);

class DataMaster {
    // Constructor is simple, meant for internal use by the factories.
    constructor(table, fields, options = {}) {
        this._table = table || [];
        this._fields = fields || [];
        this._options = this._validateOptions(options);
    }

    // --- Static Factory Methods ---
    static fromRecordset(recordset, options = {}) { /* ... */ }
    static fromTable(table, options = {}) { /* ... */ }
    static fromCsv(csvString, options = {}) { /* ... */ }
    static fromGenerator(template, options = {}) { /* ... */ }
    
    // ... all instance methods
}
```

#### Configuration Options

The DataMaster constructor accepts an options object to configure behavior:

```javascript
const options = {
    errorMode: 'standard', // 'standard' | 'strict' | 'silent'
    onError: (errorObject) => { 
        // Optional user-provided callback for logging or side-effects
        myExternalLogger.log(errorObject);
    }
};

const dm = DataMaster.fromRecordset(data, options);
```

### 2.2 The Mutability Contract: Two Categories of Methods

The instance methods are divided into two clear categories based on their behavior, creating a predictable and intuitive API.

#### Category 1: Mutating Methods (The Workshop Tools)

These methods modify the instance in-place and **always return `this`** for fluent chaining. They are the tools you use to shape, build, and clean the data you are working on.

**Fine-Grained "Tweezers":**
- `.modifyCell(rowIndex, field, newValue)` → `{this}`
- `.addRow(rowData, location)` → `{this}`
- `.removeRow(rowIndex)` → `{this}`
- `.addColumn(name, data, location)` → `{this}`
- `.removeColumn(field)` → `{this}`
- `.formatColumn(field, formatFn)` → `{this}`
- `.formatRow(rowIndex, formatFn)` → `{this}`

**Broad-Stroke "Shapers":**
- `.limit(filter)` → `{this}` - Removes all rows that do *not* match the filter
- `.sort(fieldOrFields, directionOrDirections)` → `{this}`
- `.pivot()` → `{this}`
- `.sumColumns(options = {})` → `{this}`
- `.sumRows(options = {})` → `{this}`
- `.replace(query, newValue, fields)` → `{this}`
- `.removeDuplicates(fields)` → `{this}`
- `.setFieldNames(fields)` → `{this}`

#### Category 2: Non-Mutating Methods (The Inspection Tools)

These methods leave the instance untouched and **return a new object** (either a new DataMaster or a primitive/plain object). They are the tools you use to ask questions and extract data.

**Data Extraction "Getters":**
- `.getCell(rowIndex, field)` → `{any}`
- `.getRow(rowIndex)` → `{Object}`
- `.getColumn(field)` → `{Array}`
- `.length()` → `{Number}`
- `.fields()` → `{Array<String>}`

**Data Selection & Cloning:**
- `.search(filter)` → `{DataMaster}` - Finds all rows that match the filter (non-destructive version of `.limit()`)
- `.clone()` → `{DataMaster}` - A new, deep copy of the instance
- `.select(queryString = "*")` → `{DataMaster}` - Convenient wrapper for `.query("SELECT ...")`

**Pure Serialization Methods:**
- `.toRecordset()` → `{Array<Object>}`
- `.toTable(options = {})` → `{Array<Array>}`
- `.toCsv(options = {})` → `{String}`

### 2.3 The .query() Method: The Master Control Panel

The SQL-like query engine is the most powerful tool in the knife. It is an instance method, `.query()`, that is fully integrated into the DataMaster class. It acts as a "smart controller," intelligently adhering to the Mutability Contract.

#### The "Clone on Select" Mechanism

This is the key architectural pattern that allows for this unified interface.

- **For SELECT statements**: The `.query()` method will perform its work on an internal, temporary clone of the DataMaster instance. It returns this fully-transformed clone as a new DataMaster instance, leaving the original untouched.
- **For INSERT, UPDATE, DELETE statements**: The `.query()` method will operate directly on the instance's own data, mutating it in-place and returning `this`.

#### Architectural Implementation of .query()

```javascript
// Inside the DataMaster class...
query(sqlString) {
    const verb = this._getSqlVerb(sqlString).toUpperCase(); // Helper to parse the verb

    switch (verb) {
        case 'SELECT':
            // 1. Create an in-memory clone of this instance.
            const tempDM = this.clone();
            // 2. Execute the select logic (filtering, sorting, etc.) on the clone.
            tempDM._executeSelect(sqlString); 
            // 3. Return the modified clone.
            return tempDM;

        case 'UPDATE':
        case 'DELETE':
        case 'INSERT':
            // 1. Execute the mutating logic directly on this instance.
            this._executeMutation(sqlString, verb);
            // 2. Return self for continued chaining.
            return this;

        default:
            throw new Error(`Unsupported SQL verb: ${verb}`);
    }
}
```

#### Convenient Query Wrappers

For common operations, the library provides convenient wrapper methods:

- `.update(setClause, whereClause)` → `{this}` - Safe wrapper for `.query("UPDATE ...")`
- `.delete(whereClause)` → `{this}` - Safe wrapper for `.query("DELETE ...")` that requires a whereClause to prevent accidental full-table deletion

This design allows for incredibly fluid and expressive data manipulation:

```javascript
// A single, elegant, and powerful chain.
const report = dm.query("DELETE WHERE Status='Archived'") // Mutates dm
                 .addColumn('Profit', row => row.revenue - row.cost) // Mutates dm
                 .query("SELECT Name, Profit WHERE Profit > 1000") // Returns a new dm
                 .sort('Profit') // Mutates the new dm
                 .toCsv(); // Exports from the new dm
```

## 3. Pure Serialization Architecture

A core goal of this redesign is to create an API where each tool has a single, unambiguous responsibility. To achieve this, a strict separation is enforced between **data transformation** and **data serialization**.

### The Problem with "Magic" Methods

The original `exportAs()` method violated this principle by conflating two distinct jobs:

1. **Shaping:** Selecting a subset of columns (e.g., `{ fields: ['Name', 'Profit'] }`)
2. **Serializing:** Converting the data to a specific format (e.g., CSV)

This "magic" convenience created an opaque, error-prone function whose full behavior was hidden within an options object.

### The Pure Serialization Solution

Under the new architecture, the export methods' **sole responsibility is to serialize**. They will purely represent the *current state* of the DataMaster instance. All data shaping, including column selection and reordering, **must** be performed beforehand using the appropriate tools, primarily the `.query()` method.

This leads to a far more explicit and readable process:

```javascript
// AVOID: The old, ambiguous "magic spell"
const report = dm.exportAs('csv', { fields: ['Name', 'Profit'] });

// PREFER: The new, explicit, and unambiguous process
// Step 1: Shape the data using the right tool.
const subsetDM = dm.query("SELECT Name, Profit");

// Step 2: Serialize the result using a pure export tool.
const report = subsetDM.toCsv();
```

### The New Serialization API

The `exportAs()` method is replaced by a suite of clear, purpose-built serialization methods:

- `dm.toRecordset()` - Returns an array of objects
- `dm.toTable()` - Returns a 2D array with optional headers
- `dm.toCsv(options)` - Returns a CSV string
- And so on...

These methods have a simple contract: they serialize the data as-is. Any options they accept are strictly for configuring the *format* of the output (e.g., `newLineString` for CSV), not for transforming the data itself.

## 4. Error Handling Architecture

The library implements a robust, configurable error handling system that prioritizes user experience and flexibility.

### Guiding Principle: "Error as Data"

The library will not force users to wrap standard method calls in try-catch blocks. Instead, the primary strategy for handling predictable errors (e.g., invalid user input) is to **return a value that represents the error in the same shape as the expected success value.**

### The Central Error Handler

All error handling logic is centralized in a single, internal method: `_handleError(errorMessage, errorType)`. Every public method that can encounter a predictable failure calls this handler, ensuring consistent behavior across the entire API.

### Configurable Error Modes

The library's behavior upon encountering an error is configurable during DataMaster instantiation:

#### **standard (Default)**
Implements the "Error as Data" principle.

- Methods that return a DataMaster instance will return a new, special "Error DataMaster" with internal data clearly indicating the error:
  - **Fields:** `['ErrorType', 'Message']`
  - **Data:** `[['Invalid Parameter', 'Field "ID" not found.']]`
- Methods that return a primitive (e.g., a string from `.toCsv()`) will return a formatted error string.

#### **strict**
For environments where failures should be exceptions (e.g., unit tests, server-side logic). In this mode, `_handleError` will **throw new Error(...)**, halting execution and forcing a try-catch.

#### **silent**
For cases where errors should be noted but not disrupt the data flow. `_handleError` will `console.error(...)` the message and the original method will return a graceful failure value.

### Error Type Differentiation

The system distinguishes between two types of errors:

**User Errors** (predictable): Invalid parameters, malformed queries
- Handled gracefully according to the configured errorMode
- Considered normal part of API interaction

**Internal/Catastrophic Errors** (unexpected): Null references, infinite loops
- Indicate bugs within the library itself
- Always throw a new, detailed Error, bypassing the configured errorMode
- Ensures fundamental library bugs are surfaced immediately

### onError Callback

An optional function provides a universal hook for every predictable error:

```javascript
const options = {
    onError: (errorObject) => { 
        // Called with: { message, type, timestamp }
        myExternalLogger.log(errorObject);
    }
};
```

## 5. The Public API: Layered Access

The library exposes its tools in layers, providing clear entry points for users of all skill levels.

### Layer 1: The Core DataMaster Class

The primary export for serious data work:

```javascript
const { DataMaster } = require('datamaster-lib');
```

### Layer 2: Stateless Utility Functions

For convenience, the library provides stateless wrappers for common tasks:

#### Format Converters

Essential utilities for translating between data formats:

```javascript
jwdm.converters = {
    recordsetToTable: function(recordset) { /* returns { fields, table } */ },
    csvToTable: function(csvString, options) { /* returns { fields, table } */ },
};
```

#### TableGenerator

Exposed as both a class for advanced use and a simple function for common use:

```javascript
// Simple, stateless generation
const data = jwdm.generate(myTemplate);

// Full class access for power users
const generator = new jwdm.TableGenerator();
```

## 6. Implementation Standards

### Modern JavaScript Baseline

The entire codebase uses ECMAScript 2015 (ES6) as the baseline:

- **Class Definitions**: DataMaster and TableGenerator use class syntax
- **Variable Declarations**: `const` by default, `let` only when reassignment is needed
- **No `var`**: Eliminated to enforce block-scoping and prevent common errors

### Naming Conventions

- **Camel Case**: All variables and functions use camelCase (e.g., `multiFieldSort`)
- **Pascal Case**: Classes use PascalCase (e.g., `DataMaster`)
- **Descriptive Names**: Prefer clarity over brevity (`rowIndex` over `r`)
- **Internal Prefix**: Internal properties and methods use single underscore prefix (`_table`, `_fields`)

### Module Structure: IIFE Wrapper

The entire codebase is wrapped in an Immediately Invoked Function Expression (IIFE) to ensure safe, conflict-free distribution:

```javascript
(function(global) {
    'use strict';

    // --- All library code (helpers, classes) goes here ---
    // This code is private to the IIFE's scope.

    function multiFieldSort(...) { /* ... */ } // NOT global

    class DataMaster { /* ... */ } // NOT global

    // --- The Public API is explicitly assembled ---
    const jwdm = { DataMaster, /* ... */ };

    // --- Universal export logic ---
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = jwdm; // Node.js
    } else {
        global.jwdm = jwdm; // Browser
    }

}(this || window));
```

### Helper Function Organization

- **Stateless Helpers**: Pure utility functions defined at the top of the IIFE, outside of any class
- **Stateful Helpers**: Functions tied to DataMaster instance state defined as underscore-prefixed methods within the class

## 7. Complete Public API Reference

### Static Factory Methods (Creation)

- `DataMaster.fromRecordset(recordset, options = {})` → `{DataMaster}`
- `DataMaster.fromTable(table, options = {})` → `{DataMaster}`
- `DataMaster.fromCsv(csvString, options = {})` → `{DataMaster}`
- `DataMaster.fromGenerator(template, options = {})` → `{DataMaster}`

### Instance Methods: Mutators (return `this`)

**Fine-Grained Operations:**
- `.modifyCell(rowIndex, field, newValue)`
- `.addRow(rowData, location)`
- `.removeRow(rowIndex)`
- `.addColumn(name, data, location)`
- `.removeColumn(field)`
- `.formatColumn(field, formatFn)`
- `.formatRow(rowIndex, formatFn)`
- `.setFieldNames(fields)`

**Broad Operations:**
- `.limit(filter)` - Removes all rows that do *not* match the filter
- `.sort(fieldOrFields, directionOrDirections)`
- `.pivot()`
- `.sumColumns(options = {})`
- `.sumRows(options = {})`
- `.replace(query, newValue, fields)`
- `.removeDuplicates(fields)`

**SQL-like Operations:**
- `.query(sqlString)` - Returns `{DataMaster}` for SELECT, `{this}` for INSERT/UPDATE/DELETE
- `.update(setClause, whereClause)`
- `.delete(whereClause)`

### Instance Methods: Accessors (return new values)

**Data Extraction:**
- `.getCell(rowIndex, field)` → `{any}`
- `.getRow(rowIndex)` → `{Object}`
- `.getColumn(field)` → `{Array}`
- `.length()` → `{Number}`
- `.fields()` → `{Array<String>}`

**Data Selection:**
- `.search(filter)` → `{DataMaster}` - Non-destructive version of `.limit()`
- `.clone()` → `{DataMaster}` - Deep copy of the instance
- `.select(queryString = "*")` → `{DataMaster}` - Wrapper for `.query("SELECT ...")`

**Pure Serialization:**
- `.toRecordset()` → `{Array<Object>}`
- `.toTable(options = {})` → `{Array<Array>}`
- `.toCsv(options = {})` → `{String}`

This architecture creates a powerful, intuitive, and maintainable data manipulation library that serves as a true Swiss Army Knife for JavaScript data work.