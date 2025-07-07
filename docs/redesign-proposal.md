# DataMaster Library: Architectural Redesign v2.0

## 1. Guiding Principle: The Swiss Army Knife

The primary goal of this redesign is to transform the library from a complex, single-purpose machine into a versatile and intuitive Swiss Army Knife. The original design, while powerful, suffered from a rigid, process-oriented feel that made it difficult to use for both simple and complex tasks.

This new architecture prioritizes flexibility, clarity, and developer experience. A user should be able to seamlessly switch between broad, declarative commands and fine-grained, imperative modifications. There is no prescribed "workflow"; there is only a collection of sharp, reliable tools, ready for the task at hand.

The core of this principle is a clear **Mutability Contract**: every method's effect on the DataMaster instance must be unambiguous to the user.

## 2. The Architectural Core: A Unified Engine

The library will be built around a central, powerful `DataMaster` class. This class is the "chassis" of the knife, holding the data and providing all the tools. All other top-level convenience functions are simply wrappers around this core engine.

### 2.1. The DataMaster Class: The Workshop

This class is the stateful "workshop" for all serious data work.

#### Initialization: Clear and Unambiguous Factories

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
    constructor(table, fields) {
        this._table = table || [];
        this._fields = fields || [];
    }

    // --- Static Factory Methods ---
    static fromRecordset(recordset) { /* ... */ }
    static fromTable(table, options = {}) { /* ... */ }
    static fromCsv(csvString, options = {}) { /* ... */ }
    static fromGenerator(template, library) { /* ... */ }
    
    // ... all instance methods
}
```

#### The Mutability Contract: A Tale of Two Method Types

The instance methods are divided into two clear categories based on their behavior.

**Category 1: Mutating Methods (The Workshop Tools)**

These methods modify the instance in-place and always return `this` for fluent chaining. They are the tools you use to shape, build, and clean the data you are working on.

- **Fine-Grained "Tweezers"**: `.modifyCell()`, `.addRow()`, `.removeRow()`, `.formatColumn()`, etc.
- **Broad-Stroke "Shapers"**: `.pivot()`, `.sumColumns()`, `.replace()`, `.sort()`, etc.

**Category 2: Non-Mutating Methods (The Inspection Tools)**

These methods leave the instance untouched and return a new object (either a new DataMaster or a primitive/plain object). They are the tools you use to ask questions and extract data.

- **Data Extraction "Getters"**: `.getRow()`, `.getColumn()`, `.getCell()`, `.exportAs()`
- **Explicit Cloning**: `.clone()`

### 2.2. The .query() Method: The Master Control Panel

The SQL-like query engine is the most powerful tool in the knife. It is an instance method, `.query()`, that is fully integrated into the DataMaster class. It acts as a "smart controller," intelligently adhering to the Mutability Contract.

#### The "Clone on Select" Mechanism

This is the key architectural pattern that allows for this unified interface.

- **For SELECT statements**: The `.query()` method will perform its work on an internal, temporary clone of the DataMaster instance. It returns this fully-transformed clone as a new DataMaster instance, leaving the original untouched.
- **For INSERT, UPDATE, DELETE statements**: The `.query()` method will operate directly on the instance's own data, mutating it in-place and returning `this`.

#### Architectural Sketch of .query()

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

This design allows for incredibly fluid and expressive data manipulation, as a user can chain any combination of methods and queries.

```javascript
// A single, elegant, and powerful chain.
const report = dm.query("DELETE WHERE Status='Archived'") // Mutates dm
                 .addColumn('Profit', row => row.revenue - row.cost) // Mutates dm
                 .query("SELECT Name, Profit WHERE Profit > 1000") // Returns a new dm
                 .sort('Profit') // Mutates the new dm
                 .exportAs('recordset'); // Exports from the new dm
```

## 3. The Public API: Layers of Access

The library will expose its tools in layers, providing clear entry points for users of all skill levels.

### Layer 1: The Core DataMaster Class

The primary export. This is for any user doing serious data work.

```javascript
const { DataMaster } = require('datamaster-lib');
```

### Layer 2: Stateless Utility Functions

For convenience, the library should also provide stateless wrappers for the most common, fundamental tasks.

#### The Format Converters

The most essential utilities. They solve the universal problem of translating between data formats.

```javascript
jwdm.converters = {
    recordsetToTable: function(recordset) { /* returns { fields, table } */ },
    csvToTable: function(csvString, options) { /* returns { fields, table } */ },
};
```

#### The TableGenerator

Exposed as a class for advanced use and a simple top-level function for common use.

```javascript
// Simple, stateless generation
const data = jwdm.generate(myTemplate);

// Full class access for power users
const generator = new jwdm.TableGenerator();
```

## 4. Universal Module Definition (UMD)

To make the library compatible with both Node.js and browser environments, we'll implement a simple UMD pattern at the end of the main file:

```javascript
// At the very end of your single datamaster.js file...
// --- Manual Exporting ---
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // We are in a Node.js environment, so export the library.
    module.exports = jwdm; // Assuming your main object is 'jwdm'
} else {
    // We are in a browser, so attach it to the window object.
    window.jwdm = jwdm;
}
```

This simple pattern ensures that the library can be used seamlessly across different JavaScript environments without requiring additional build tools or bundlers.

## Addendum: The Principle of Pure Serialization

A core goal of this redesign is to create an API where each tool has a single, unambiguous responsibility. To achieve this, a strict separation will be enforced between **data transformation** and **data serialization**.

### The Old Way: A Flawed "Magic" Method

The original `exportAs()` method violated this principle by conflating two distinct jobs:

1. **Shaping:** Selecting a subset of columns (e.g., `{ fields: ['Name', 'Profit'] }`)
2. **Serializing:** Converting the data to a specific format (e.g., CSV)

This "magic" convenience created an opaque, error-prone function whose full behavior was hidden within an options object.

### The New Way: A Pure and Predictable Process

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

### The New toXXX() Export API

To support this principle, `exportAs()` will be replaced by a suite of clear, purpose-built serialization methods:

- `dm.toRecordset()`
- `dm.toTable()`
- `dm.toCsv(options)`
- And so on...

These methods will have a simple contract: they serialize the data as-is. Any options they accept will be strictly for configuring the *format* of the output (e.g., `newLineString` for CSV), not for transforming the data itself.

By removing the "magic" and enforcing this separation, we provide a more robust, predictable, and ultimately more usable library. The process is clear, the tools are sharp, and the user is always in full control.

## Addendum: Finalized Coding and Style Guide

To ensure the library is maintainable, readable, and robust, all new and refactored code will adhere to the following modern JavaScript standards. This guide balances clarity and best practices with the practical constraints of a single-file, highly-compatible library.

### 1. Core Syntax: ES6 Baseline

The entire codebase will be modernized to a baseline of ECMAScript 2015 (ES6).

- **Class Definitions**: The DataMaster and TableGenerator objects will be refactored into class definitions. This provides a clear, standard structure for our core components.
- **Variable Declarations**: All `var` declarations will be replaced. `const` will be used by default for all variables that are not reassigned. `let` will be used only when a variable's value must change within its block. This enforces block-scoping and prevents common errors associated with `var`.

**Rationale**: ES6 is universally supported by all modern browsers and Node.js versions. The clarity, structure, and safety benefits of `class`, `const`, and `let` are significant and represent the current industry standard.

### 2. Naming Conventions: Clarity Over Brevity

Variable and method names should be explicit and self-documenting.

- **Camel Case**: All variables and functions will use camelCase (e.g., `multiFieldSort`). Classes will use PascalCase (e.g., `DataMaster`).
- **Descriptive Naming**: Avoid single-letter loop variables or heavy abbreviations. Prefer `rowIndex` over `r`, and `recordTable` over `rTable`. The goal is for code to be immediately understandable without requiring deep context.
- **Internal Property Prefix**: Internal properties and methods of a class that are not part of the public API will be prefixed with a single underscore (`_`). For example: `this._table`, `this._fields`, `this._findFieldIndex()`.

**Rationale**: While the language has evolved to include true private fields (`#`), the `_` prefix provides the best balance of signaling developer intent ("for internal use") while guaranteeing 100% compatibility across all JavaScript environments without a build step.

### 3. Scoping and Modularity: The IIFE Wrapper

To ensure the library is a good citizen in any environment, the entire codebase will be wrapped in an Immediately Invoked Function Expression (IIFE).

```javascript
(function(global) {
    'use strict';

    // --- All library code (helpers, classes) goes here ---
    // This code is private to the IIFE's scope.

    function multiFieldSort(...) { /* ... */ } // This is NOT global

    class DataMaster { /* ... */ } // This is NOT global

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

**Rationale**: This standard pattern creates a private "module" scope for the entire library. It prevents pollution of the global (`window`) object and eliminates the risk of naming conflicts with other scripts on a user's page. The UMD-style export block at the end ensures the assembled public API (`jwdm`) is correctly exposed in both Node.js and browser environments. This is the professional standard for creating a safe, distributable, single-file library.

### 4. Helper Function Organization

Helper functions will be organized based on their relationship to the DataMaster state.

- **Stateless Helpers**: Pure, general-purpose utility functions that do not rely on `this` (e.g., `copy`, `multiFieldSort`) will be defined at the top of the IIFE, outside of any class. They are private to the library but available to all internal components.
- **Stateful Helpers**: Functions that are intrinsically tied to the state of a DataMaster instance (e.g., `_findFieldIndex`) will be defined as underscore-prefixed methods within the DataMaster class.

**Rationale**: This separation makes the architecture clear. It distinguishes between general utilities and instance-specific logic, improving code organization and reusability within the library.

# Addendum: Error Handling Architecture

This document outlines the library's official strategy for handling errors. The design prioritizes a user experience that is robust, predictable, and flexible, avoiding disruptive exceptions for common failures while ensuring that critical issues are surfaced effectively.

## 1. Guiding Principle: "Error as Data"

The library will not force users to wrap standard method calls in try-catch blocks. Instead, the primary strategy for handling predictable errors (e.g., invalid user input) is to **return a value that represents the error in the same shape as the expected success value.** This makes failure a predictable and manageable part of the data flow, rather than an application-halting event.

## 2. The Central Mechanism: `_handleError()`

All error handling logic will be centralized in a single, internal method: `_handleError(errorMessage, errorType)`. Every public method that can encounter a predictable failure will call this handler. This centralizes control and allows for consistent behavior across the entire API.

## 3. Configurable Error Handling

The library's behavior upon encountering an error will be configurable during the DataMaster instantiation. This provides users with the flexibility to choose the strategy that best suits their environment (e.g., development, production, server-side, client-side).

### Configuration Options

```javascript
// Example of configuration options
const options = {
    errorMode: 'standard', // 'standard' | 'strict' | 'silent'
    onError: (errorObject) => { 
        // Optional user-provided callback for logging or side-effects
        myExternalLogger.log(errorObject);
    }
};

const dm = DataMaster.fromRecordset(data, options);
```

### Error Mode Behaviors

#### **standard (Default)**
This implements the "Error as Data" principle.

- Methods that return a DataMaster instance will return a new, special "Error DataMaster". Its internal data will be a single row clearly indicating the error and message.
  - **Fields:** `['ErrorType', 'Message']`
  - **Data:** `[['Invalid Parameter', 'Field "ID" not found.']]`
- Methods that return a primitive (e.g., a string from `.toCsv()`) will return a formatted error string.

#### **strict**
This mode is for environments where failures should be exceptions (e.g., unit tests, server-side logic). In this mode, `_handleError` will **throw new Error(...)**, halting execution and forcing a try-catch.

#### **silent**
This mode is for cases where errors should be noted but not disrupt the data flow. `_handleError` will `console.error(...)` the message and the original method will return a graceful failure value (e.g., the unchanged DataMaster instance, an empty array, or null).

### onError Callback

This optional function provides a universal hook for every predictable error handled by the library. Before any mode-specific logic is executed, `_handleError` will call this callback with a detailed error object: `{ message, type, timestamp }`. This allows for seamless integration with external logging services, UI notifications, or other custom handlers.

## 4. Differentiating Error Types

A distinction will be made between predictable user errors and true internal bugs.

### User Errors
Examples: invalid parameters, malformed queries

These are handled gracefully according to the configured errorMode. They are considered a normal part of interacting with the API.

### Internal/Catastrophic Errors
Examples: unexpected null reference, infinite loop

These indicate a bug within the library itself. To ensure these are never silenced, core internal logic will be wrapped in a try-catch block. If an unexpected exception is caught, it will **always throw a new, detailed Error**, bypassing the configured errorMode. This ensures that fundamental library bugs are surfaced immediately and loudly.

# Addendum: Finalized Public API Manifest

This document outlines the complete public API for the DataMaster class. The design is guided by a clear **Mutability Contract** and a focus on providing both powerful, low-level tools and convenient, high-level abstractions.

## 1. Static Factory Methods (Creation)

These static methods are the sole entry points for creating a DataMaster instance. They are called on the DataMaster class itself.

- `DataMaster.fromRecordset(recordset, options = {})`
- `DataMaster.fromTable(table, options = {})`
- `DataMaster.fromCsv(csvString, options = {})`
- `DataMaster.fromGenerator(template, options = {})`

**Returns:** `{DataMaster}` A new DataMaster instance.

## 2. Instance Methods: Mutators

These methods modify the DataMaster instance in-place and **always return this** for fluent chaining. They are the tools for shaping and changing data.

### `.limit(filter)`
**Description:** Removes all rows that do *not* match the filter. The destructive version of `.search()`.

**Parameters:**
- `filter {Object | Function}`: An object of key-value pairs (`{ status: 'active' }`) or a filter function (`row => row.age > 30`).

**Returns:** `{this}`

### Other Mutator Methods
- `.modifyCell(rowIndex, field, newValue)`
- `.addRow(rowData, location)`
- `.removeRow(rowIndex)`
- `.addColumn(name, data, location)`
- `.removeColumn(field)`
- `.setFieldNames(fields)`
- `.formatColumn(field, formatFn)`
- `.formatRow(rowIndex, formatFn)`
- `.sort(fieldOrFields, directionOrDirections)`
- `.pivot()`
- `.sumColumns(options = {})`
- `.sumRows(options = {})`
- `.replace(query, newValue, fields)`
- `.removeDuplicates(fields)`

## 3. Instance Methods: Accessors & Selectors

These methods leave the DataMaster instance untouched and **return a new value** (a new DataMaster, a primitive, or a plain object/array). They are the tools for asking questions and extracting data.

### `.search(filter)`
**Description:** Finds all rows that match the filter. The non-destructive version of `.limit()`.

**Parameters:**
- `filter {Object | Function}`: An object of key-value pairs or a filter function.

**Returns:** `{DataMaster}` A **new DataMaster instance** containing only the matching rows.

### `.query(sqlString)`
**Description:** The master engine for all SQL-like operations.

**Returns:**
- **`{DataMaster}`**: For a SELECT statement, returns a **new DataMaster instance**.
- **`{this}`**: For INSERT, UPDATE, DELETE statements, mutates the instance and returns this.

### `.select(queryString = "*")`
**Description:** A convenient wrapper for `.query("SELECT ...")`.

**Returns:** `{DataMaster}` A **new DataMaster instance**.

### `.update(setClause, whereClause)`
**Description:** A convenient, safe wrapper for `.query("UPDATE ...")`.

**Returns:** `{this}`

### `.delete(whereClause)`
**Description:** A convenient, safe wrapper for `.query("DELETE ...")` that requires a whereClause to prevent accidental full-table deletion.

**Returns:** `{this}`

### Other Accessor Methods
- `.clone()` → `{DataMaster}` A new, deep copy of the instance.
- `.getCell(rowIndex, field)` → `{any}`
- `.getRow(rowIndex)` → `{Object}`
- `.getColumn(field)` → `{Array}`
- `.length()` → `{Number}`
- `.fields()` → `{Array<String>}`
- `.toRecordset()` → `{Array<Object>}`
- `.toTable(options = {})` → `{Array<Array>}`
- `.toCsv(options = {})` → `{String}`