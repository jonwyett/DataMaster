# DataMaster Library Redesign Proposal

## 1. Introduction: Solving for Developer Experience

The current library is powerful and feature-rich, but its complexity creates a high cognitive load, making it difficult to remember and clunky to use even for simple tasks. This is because its design is exclusively a stateful, mutable object, while many common use-cases call for a stateless, functional toolkit.

This proposal outlines a redesign that embraces this distinction. The goal is to create a more intuitive, self-documenting, and enjoyable developer experience without sacrificing the library's power. We will achieve this by creating clear, purpose-driven interfaces for different tasks.

## 2. The New Design Philosophy: Three Clear Roles

The new library will be structured around three distinct roles, each with a clear purpose and interface:

- **The Creator (TableGenerator)**: Its sole job is to generate new data from scratch. It's the starting point, the factory for raw materials.
- **The Shaper (DataMaster)**: This is the power-user tool for stateful, multi-step transformations. It's the workshop where you take data and fundamentally rebuild it (add/remove columns, pivot, aggregate, etc.).
- **The Questioner (jwdm.query())**: This is the primary interface for stateless, read-only analysis. It's the inspection station where you ask questions of your data (filter, select, sort).

This separation makes the library's purpose immediately clear to a new user.

## 3. Key Design Changes

### Change 1: Clear Initialization via Static Factory Methods

The overloaded `new DataMaster(data, fields, options)` constructor will be replaced with explicit static factory methods. This eliminates ambiguity and makes the code self-documenting.

**Before:**
```javascript
// What does 'true' mean here? I have to remember.
const dm = new DataMaster(myTableWithHeaders, true);
```

**After (The New Way):**
```javascript
// No ambiguity. The method name says it all.
const dm = DataMaster.fromTable(myTableWithHeaders, { headersInFirstRow: true });

// Other examples:
const dmFromRecords = DataMaster.fromRecordset(myRecordset);
const dmFromCsv = DataMaster.fromCsv(myCsvString);
```

### Change 2: The query() Function as the Front Door

The powerful DataQuery engine will be exposed through a single, top-level, stateless function. This becomes the go-to method for all simple filtering, selecting, and sorting.

**Before:**
```javascript
const dq = new DataQuery(myData);
const results = dq.query({ where: "country='Canada'" });
```

**After (The New Way):**
```javascript
// One function. Data in, query in, results out. Simple and stateless.
const results = jwdm.query(myData, { where: "country='Canada'" });
```

### Change 3: First-Class TableGenerator Integration

The TableGenerator will be seamlessly integrated into the ecosystem with its own top-level function and a DataMaster factory.

**New Top-Level Function:**
```javascript
// Simple, stateless data generation.
const newUsers = jwdm.generate(userTemplate);
```

**New DataMaster Factory:**
```javascript
// Generate data and load it directly into the "workshop" in one step.
const dm = DataMaster.fromGenerator(userTemplate);
```

## 4. The New Proposed Workflow

This example illustrates how the different roles work together in a complex scenario, moving from creation to shaping to analysis.

```javascript
// --- Step 1: CREATE ---
// Use the TableGenerator to create our raw dataset.
const rawData = jwdm.generate(salesTemplate);

// --- Step 2: SHAPE ---
// The raw data is messy. Use the DataMaster "workshop" to build
// a clean dataset for reporting. The chainable API is perfect for this.
const dm = DataMaster.fromRecordset(rawData)
    .removeColumn('internal_id')
    .replace('N/A', 0, 'revenue')
    .addColumn('Profit', (row) => row.revenue - row.cost)
    .sort('Date');

// We're done building. Get the final, clean dataset.
const cleanDataForReporting = dm.exportAs('recordset');

// --- Step 3: QUESTION ---
// Now use the simple, stateless `query()` function to ask questions
// of our clean, well-structured data.
const canadianReports = jwdm.query(cleanDataForReporting, { 
    where: "Country='Canada'" 
});

const highValueReports = jwdm.query(cleanDataForReporting, { 
    where: "Profit > 5000",
    orderBy: "Profit DESC"
});
```

This workflow is logical, readable, and clearly separates the concerns of data transformation from data analysis.

## 5. Bare-Bones Code Scaffold

This shows the high-level structure of the new library file. It focuses on the public API and class structure, not the implementation details.

```javascript
// filename: jwdm.js

/**
 * The TableGenerator class. Can be used directly for advanced configuration,
 * but most users will use the top-level jwdm.generate() function.
 */
class TableGenerator {
    constructor(options = {}) { /* ... */ }
    generate(template, library) { /* ... implementation ... */ }
}

/**
 * The DataMaster class. The main "workshop" for stateful data shaping.
 * Should be instantiated via its static factory methods.
 */
class DataMaster {
    // Constructor is simple, assumes data is pre-formatted.
    constructor(table, fields) {
        this._table = table || [];
        this._fields = fields || [];
    }

    // --- Static Factory Methods for Initialization ---
    static fromRecordset(recordset) { /* ... implementation ... */ }
    static fromTable(table, options = {}) { /* ... implementation ... */ }
    static fromCsv(csvString, options = {}) { /* ... implementation ... */ }
    static fromGenerator(template, library) { /* ... implementation ... */ }

    // --- Instance Methods for Shaping Data ---
    addColumn(name, data, location) { /* ... */ return this; }
    removeColumn(column) { /* ... */ return this; }
    replace(query, newValue, fields) { /* ... */ return this; }
    pivot() { /* ... */ return this; }
    sumColumns(label, columns) { /* ... */ return this; }
    sort(field, direction) { /* ... */ return this; }
    exportAs(style) { /* ... implementation ... */ }
}

/**
 * The main exported object, providing the public API.
 */
const jwdm = {
    /**
     * Statelessly queries data using SQL-like syntax. The primary
     * interface for filtering, selecting, and sorting.
     */
    query: function(data, queryOptions) {
        // Internally, this will create a temporary DataMaster or DataQuery
        // instance to run the query and return the result.
        const dm = new DataMaster.fromRecordset(data);
        // ... run query logic ...
        return dm.exportAs('recordset'); // or similar
    },

    /**
     * Statelessly generates a new table of data from a template.
     */
    generate: function(template, library) {
        const generator = new TableGenerator();
        return generator.generate(template, library);
    },
    
    // Expose the classes for power users who need direct access.
    DataMaster,
    TableGenerator,
};

// --- Universal Module Definition (for Node and Web) ---
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // Node.js environment
    module.exports = jwdm;
} else {
    // Browser environment
    window.jwdm = jwdm;
}
```

## 6. Usage: Node.js vs. The Web

**In Node.js:**
```javascript
const jwdm = require('./jwdm.js');
// or with ES Modules: import jwdm from './jwdm.js';

const results = jwdm.query(myData, { where: "status='active'" });
```

**In the Browser:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>DataMaster Test</title>
    <script src="jwdm.js"></script>
</head>
<body>
    <script>
        const myData = [
            {'Name':'Alice','Age':23,'Happy':true},
            {'Name':'Bob','Age':43,'Happy':true}
        ];

        const happyPeople = jwdm.query(myData, { where: "Happy='true'" });
        console.log(happyPeople);
    </script>
</body>
</html>
```