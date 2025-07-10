# DataMaster API Reference

This document provides a detailed reference for all public classes and methods in the DataMaster library.

## Table of Contents

- [The DataMaster Class](#the-datamaster-class)
  - [Static Factory Methods (Creation)](#static-factory-methods-creation)
  - [Instance Methods: Mutators](#instance-methods-mutators)
  - [Instance Methods: Accessors & Selectors](#instance-methods-accessors--selectors)
- [The TableGenerator Class](#the-tablegenerator-class)
- [Top-Level Utility Functions](#top-level-utility-functions)

## The DataMaster Class

The central class for all data manipulation. An instance of DataMaster holds your data and provides the tools to shape and analyze it.

### Static Factory Methods (Creation)

These methods are the correct way to create a new DataMaster instance. They are called directly on the class, e.g., `DataMaster.fromRecordset(...)`.

#### `DataMaster.fromRecordset(recordset, options)`

Creates a DataMaster instance from an array of objects.

**Parameters:**
- `recordset` (Array<Object>): An array where each object represents a row. The keys of the first object will be used as field names.
- `options` (Object, optional): Configuration object for error handling (errorMode, onError).

**Returns:** `DataMaster` - A new DataMaster instance.

**Example:**
```javascript
const data = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}];
const dm = DataMaster.fromRecordset(data);
```

#### `DataMaster.fromTable(table, options)`

Creates a DataMaster instance from an array of arrays.

**Parameters:**
- `table` (Array<Array>): An array where each inner array represents a row.
- `options` (Object, optional): Configuration object.
  - `headers` (Array<String>): An array of strings to use as field names.
  - `headersInFirstRow` (Boolean): If true, the first row of the table will be used as field names.
  - `errorMode`, `onError`: Error handling options.

**Returns:** `DataMaster` - A new DataMaster instance.

**Example:**
```javascript
const data = [['Name', 'Age'], ['Alice', 23], ['Bob', 42]];
const dm = DataMaster.fromTable(data, { headersInFirstRow: true });
```

#### `DataMaster.fromCsv(csvString, options)`

Creates a DataMaster instance from a CSV formatted string.

**Parameters:**
- `csvString` (String): The string of data to parse.
- `options` (Object, optional): Configuration object.
  - `headersInFirstRow` (Boolean): If true, the first parsed row is used as field names.
  - `isTSV` (Boolean): If true, parses tab-separated values instead of comma-separated.
  - `errorMode`, `onError`: Error handling options.

**Returns:** `DataMaster` - A new DataMaster instance.

**Example:**
```javascript
const csv = "Name,Age\nAlice,23\nBob,42";
const dm = DataMaster.fromCsv(csv, { headersInFirstRow: true });
```

#### `DataMaster.fromGenerator(template, options)`

Creates a DataMaster instance with mock data using the built-in TableGenerator.

**Parameters:**
- `template` (Object): The generator template object.
- `options` (Object, optional): Configuration object.
  - `library` (Object): A custom data library to merge with the default.
  - `errorMode`, `onError`: Error handling options.

**Returns:** `DataMaster` - A new DataMaster instance.

**Example:**
```javascript
const template = { 
  settings: { rows: 5 }, 
  template: { 
    name: { 
      autoGenerate: { 
        type: 'library', 
        value: 'firstName' 
      } 
    } 
  } 
};
const dm = DataMaster.fromGenerator(template);
```

### Instance Methods: Mutators

These methods modify the DataMaster instance in-place and always return `this` to allow for fluent chaining.

#### `.limit(filter)`

Removes all rows that do not match the filter. Destructive version of `.search()`.

**Parameters:**
- `filter` (Object|Function|String): An object of key-value pairs, a filter function, or a WHERE-clause string.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.limit({ status: 'active' }); // Keep only active rows
dm.limit(row => row.age > 30); // Keep rows where age > 30
```

#### `.limitWhere(clauseString, queryFunctions)`

Removes all rows that do not match a SQL-like WHERE clause string. Destructive version of `.where()`.

**Parameters:**
- `clauseString` (String): The WHERE clause logic.
- `queryFunctions` (Object, optional): Custom query functions for advanced filtering.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.limitWhere("status = 'active' AND age > 30"); // Keep rows matching the query
```

#### `.sort(fieldOrFields, isDescending)`

Sorts the data in-place.

**Parameters:**
- `fieldOrFields` (String|Array<String>): The field name(s) to sort by.
- `isDescending` (Boolean|Array<Boolean>, optional): The sort direction(s). Defaults to false.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.sort('age', true); // Sort by age, descending
dm.sort(['department', 'lastName']); // Sort by department, then by last name
```

#### `.replace(query, newValue, fields)`

Finds and replaces values within specified fields.

**Parameters:**
- `query` (String|RegExp): The value or pattern to find.
- `newValue` (*): The value to replace matches with.
- `fields` (String|Array<String>, optional): The field(s) to perform the replacement in. Defaults to all fields.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.replace('N/A', 0, 'sales');
```

#### `.removeRow(rowIndex)`

Removes a single row by its index.

**Parameters:**
- `rowIndex` (Number): The zero-based index of the row to remove.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.removeRow(0); // Removes the first row
```

#### `.modifyCell(rowIndex, field, newValue)`

Changes the value of a single cell.

**Parameters:**
- `rowIndex` (Number): The index of the row.
- `field` (String|Number): The name or index of the column.
- `newValue` (*): The new value for the cell.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.modifyCell(0, 'status', 'inactive');
```

#### `.addColumn(name, data, location)`

Adds a new column to the table.

**Parameters:**
- `name` (String): The name of the new column.
- `data` (Array, optional): An array of values for the new column. If omitted, cells will be null.
- `location` (String|Number, optional): The field name or index to insert the new column after. If omitted, adds to the end.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.addColumn('initials', row => `${row.firstName[0]}${row.lastName[0]}`);
```

### Instance Methods: Accessors & Selectors

These methods leave the instance untouched and return a new value (a new DataMaster, a primitive, or a plain object/array).

#### `.search(filter)`

Finds all rows that match the filter and returns them in a new DataMaster instance. Non-destructive version of `.limit()`.

**Parameters:**
- `filter` (Object|Function): An object of key-value pairs or a filter function.

**Returns:** `DataMaster` - A new DataMaster instance containing only the matching rows.

**Example:**
```javascript
const activeUsers = dm.search({ status: 'active' });
const seniorUsers = dm.search(row => row.age > 50);
```

#### `.where(clauseString, queryFunctions)`

Finds all rows that match a SQL-like WHERE clause string and returns them in a new DataMaster instance.

**Parameters:**
- `clauseString` (String): The WHERE clause logic.
- `queryFunctions` (Object, optional): Custom query functions for advanced filtering.

**Returns:** `DataMaster` - A new DataMaster instance containing only the matching rows.

**Example:**
```javascript
const highValueSales = dm.where("status = 'active' AND sales > 1000");
```

> **Note:** DataMaster provides three pairs of methods for filtering data:
> - `.search()` / `.where()` - Return new DataMaster instances with filtered data
> - `.limit()` / `.limitWhere()` - Modify current instance by removing non-matching rows
> - `.getIndices()` / `.getIndicesWhere()` - Return arrays of matching row indices
> 
> Each pair follows the same pattern: the first method accepts objects/functions, the second accepts WHERE clause strings.

#### `.query(verb, options)`

The master engine for all SQL-like operations.

**Parameters:**
- `verb` (String): The operation to perform: 'select', 'update', or 'delete'.
- `options` (Object): An object containing the clauses for the operation (e.g., fields, where, orderBy, set).

**Returns:** `DataMaster|this` - For 'select', returns a new DataMaster instance. For 'update' or 'delete', mutates the instance and returns this.

**Example:**
For detailed usage and examples, please see the Query Guide.

#### `.getIndices(filter)`

Gets the current, positional indices of rows matching a programmatic filter.

**Parameters:**
- `filter` (Object|Function): An object of key-value pairs or a filter function.

**Returns:** `Array<Number>` - An array of zero-based row indices.

**Example:**
```javascript
const activeIndices = dm.getIndices({ status: 'active' });
```

#### `.getIndicesWhere(clauseString, queryFunctions)`

Gets the current, positional indices of rows matching a SQL-like WHERE clause.

**Parameters:**
- `clauseString` (String): The WHERE clause logic.
- `queryFunctions` (Object, optional): Custom query functions for advanced filtering.

**Returns:** `Array<Number>` - An array of zero-based row indices.

**Example:**
```javascript
const salesIndices = dm.getIndicesWhere("sales > 1000");
```

#### `.clone()`

Creates a deep copy of the DataMaster instance.

**Returns:** `DataMaster` - A new DataMaster instance with identical data.

**Example:**
```javascript
const backupDM = dm.clone();
```

#### `.toRecordset()`

Exports the data as an array of objects.

**Returns:** `Array<Object>`

**Example:**
```javascript
const recordset = dm.toRecordset();
```

#### `.toTable(options)`

Exports the data as an array of arrays.

**Parameters:**
- `options` (Object, optional):
  - `includeHeaders` (Boolean): If true, the first row will be the field names.

**Returns:** `Array<Array>`

**Example:**
```javascript
const table = dm.toTable({ includeHeaders: true });
```

#### `.toCsv(options)`

Exports the data as a CSV formatted string.

**Parameters:**
- `options` (Object, optional):
  - `includeHeaders` (Boolean): If true, the first line will be the field names.
  - `newLineString` (String): The character(s) to use for new lines.

**Returns:** `String`

**Example:**
```javascript
const csv = dm.toCsv();
```

## The TableGenerator Class

A class for generating mock data. Usually used via `DataMaster.fromGenerator()`.

*A brief description of its generate method would go here.*

## Top-Level Utility Functions

Convenience functions available on the main DataMaster object.

### `DataMaster.generate(template)`

A stateless wrapper around the TableGenerator for quick mock data creation.

**Parameters:**
- `template` (Object): The generator template.

**Returns:** `Array<Array>` - The generated data table.

**Example:**
```javascript
const mockData = DataMaster.generate(myTemplate);
```

### `DataMaster.converters`

An object containing stateless utility functions for converting between data formats.

- `DataMaster.converters.recordsetToTable(recordset)`
- `DataMaster.converters.csvToTable(csvString, options)`

**Returns:** `Object` - An object with fields and table properties.