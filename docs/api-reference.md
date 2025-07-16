# DataMaster API Reference

This document provides a detailed reference for all public classes and methods in the DataMaster library.

## Table of Contents

- [The DataMaster Class](#the-datamaster-class)
  - [Static Factory Methods (Creation)](#static-factory-methods-creation)
  - [Instance Methods: Mutators](#instance-methods-mutators)
  - [Instance Methods: Accessors & Selectors](#instance-methods-accessors--selectors)
  - [Instance Methods: Data Extraction](#instance-methods-data-extraction)
  - [Instance Methods: Utility & Debug](#instance-methods-utility--debug)
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


### Instance Methods: Mutators

These methods modify the DataMaster instance in-place and always return `this` to allow for fluent chaining.

#### `.addRow(data, location)`

Adds a row to the DataMaster.

**Parameters:**
- `data` (Array|Object): The row data as array or object.
- `location` (Number, optional): The index at which to place the new row, shifting existing rows.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.addRow({ name: 'John', age: 30 });
dm.addRow(['Jane', 25], 0); // Insert at beginning
```

#### `.removeRow(index)`

Removes a row from the DataMaster.

**Parameters:**
- `index` (Number): Index of the row to remove.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.removeRow(0); // Removes the first row
```

#### `.addColumn(name, data, location)`

Adds a new column to the DataMaster.

**Parameters:**
- `name` (String): The column/field name.
- `data` (Array, optional): The data to add. If undefined, nulls will be added.
- `location` (String|Number, optional): Index or fieldname to place the column.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.addColumn('fullName', ['John Doe', 'Jane Smith']);
dm.addColumn('total', null, 'after:sales'); // Add after sales column
```

#### `.removeColumn(column)`

Removes a column from the DataMaster.

**Parameters:**
- `column` (String|Number): The column name or index to remove.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.removeColumn('oldField');
dm.removeColumn(2); // Remove third column
```

#### `.modifyCell(row, column, value)`

Modifies a cell value.

**Parameters:**
- `row` (Number): The row index.
- `column` (String|Number): The column name or index.
- `value` (*): The new value for the cell.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.modifyCell(0, 'status', 'inactive');
```

#### `.formatColumn(column, formatFn)`

Formats the cells in a column based on a formatting function. This is an in-place replacement of the original data.

**Parameters:**
- `column` (String|Number): The column name or index to format.
- `formatFn` (Function): Function to modify/format the data.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.formatColumn('price', value => '$' + value.toFixed(2));
```

#### `.formatRow(row, formatFn)`

Formats the cells in a row based on a formatting function. This is an in-place replacement of the original data.

**Parameters:**
- `row` (Number): The row index to format.
- `formatFn` (Function): Function to modify/format the data.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.formatRow(0, value => String(value).toUpperCase());
```

#### `.sort(fields, directions, primers)`

Sorts the DataMaster by one or more fields.

**Parameters:**
- `fields` (String|Number|Array<String|Number>): Field name(s) or index(es) to sort by.
- `directions` (Boolean|Array<Boolean>, optional): Sort direction(s): true = descending, false = ascending. Defaults to false.
- `primers` (Function|Array<Function>, optional): Optional transformation function(s) for sorting.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.sort('age', true); // Sort by age, descending
dm.sort(['department', 'lastName']); // Sort by department, then by last name
```

#### `.sumColumns(options)`

Sums column values and adds a summary row.

**Parameters:**
- `options` (Object, optional): Configuration options.
  - `label` (String): Label for the summary row (placed in first column).
  - `columns` (Array<String|Number>): Columns to sum (default: all numeric columns).
  - `isAverage` (Boolean): Calculate averages instead of sums. Defaults to false.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.sumColumns({ label: 'Total', columns: ['sales', 'profit'] });
```

#### `.sumRows(options)`

Sums row values and adds a summary column.

**Parameters:**
- `options` (Object, optional): Configuration options.
  - `label` (String): Label for the summary column. Defaults to 'Total'.
  - `rows` (Array<Number>): Row indexes to sum (default: all rows).
  - `isAverage` (Boolean): Calculate averages instead of sums. Defaults to false.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.sumRows({ label: 'Total', rows: [0, 1, 2] });
```

#### `.reorder(fields)`

Reorders the DataMaster columns and removes unwanted fields.

**Parameters:**
- `fields` (Array<String|Number>): The fields to keep and their order.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.reorder(['name', 'age', 'email']); // Keep only these fields in this order
```

#### `.modifyFieldNames(fieldMap, reorderAfter)`

Modifies existing field names using a mapping object.

**Parameters:**
- `fieldMap` (Object): Object mapping old field names to new field names.
- `reorderAfter` (Boolean, optional): Whether to reorder data to match the mapping order. Defaults to false.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.modifyFieldNames({ firstName: 'first_name', lastName: 'last_name' });
```

#### `.setFieldNames(fields)`

Sets the field names to new values.

**Parameters:**
- `fields` (Array<String>): The new field names.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.setFieldNames(['id', 'name', 'email', 'age']);
```

#### `.replace(query, newValue, fields)`

Replaces values in specified fields using a query pattern.

**Parameters:**
- `query` (String|RegExp): The pattern to search for (string will be converted to case-insensitive global RegExp).
- `newValue` (*): The value to replace matches with.
- `fields` (Array<String|Number>|String|Number, optional): Fields to search in (defaults to all fields).

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.replace('N/A', 0, 'sales');
dm.replace(/\d{3}-\d{3}-\d{4}/, '[PHONE]', 'phone'); // Replace phone numbers
```

#### `.limit(filter)`

Limits the DataMaster to only rows that match the filter criteria (destructive operation).

**Parameters:**
- `filter` (Object|Function): Object with field-value pairs for AND filtering, or function that receives row object.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.limit({ status: 'active' }); // Keep only active rows
dm.limit(row => row.age > 30); // Keep rows where age > 30
```

#### `.limitWhere(clauseString, queryFunctions)`

Executes a WHERE clause and removes non-matching rows (destructive operation).

**Parameters:**
- `clauseString` (String): The WHERE clause to execute (supports field names, =, !=, AND, OR, parentheses, wildcards, custom functions).
- `queryFunctions` (Object, optional): Custom query functions for advanced filtering.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.limitWhere("status = 'active' AND age > '30'");
```

#### `.removeDuplicates(fields)`

Removes duplicate entries from the table based on the specified fields.

**Parameters:**
- `fields` (Array|String|Number, optional): The fields to match on for duplicate detection.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.removeDuplicates(['name', 'email']); // Remove rows with duplicate name+email
```

#### `.pivot()`

Pivots the table (transposes rows and columns). This function assumes that your table data has row headers, because that's what the new columns will be called.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.pivot(); // Transpose the table
```

#### `.splice(start, deleteCount, ...items)`

Changes the contents of the DataMaster's internal table by removing/replacing/adding rows.

**Parameters:**
- `start` (Number): The start index.
- `deleteCount` (Number): The number of rows to remove.
- `...items` (Array): The new rows to add.

**Returns:** `this` - The modified DataMaster instance.

**Example:**
```javascript
dm.splice(1, 2); // Remove 2 rows starting at index 1
dm.splice(2, 0, ['John', 25], ['Jane', 30]); // Insert 2 rows at index 2
dm.splice(0, 1, { name: 'Bob', age: 35 }); // Replace first row
```

### Instance Methods: Accessors & Selectors

These methods leave the instance untouched and return a new value (a new DataMaster, a primitive, or a plain object/array).

#### `.search(filter)`

Searches and returns a new DataMaster instance with filtered data.

**Parameters:**
- `filter` (Object|Function): Object with field-value pairs for AND filtering, or function that receives row object.

**Returns:** `DataMaster` - A new DataMaster instance containing only the matching rows.

**Example:**
```javascript
const activeUsers = dm.search({ status: 'active' });
const seniorUsers = dm.search(row => row.age > 50);
```

#### `.where(clauseString, queryFunctions)`

Executes a WHERE clause and returns a new DataMaster instance with matching rows.

**Parameters:**
- `clauseString` (String): The WHERE clause to execute (supports field names, =, !=, AND, OR, parentheses, wildcards, custom functions).
- `queryFunctions` (Object, optional): Custom query functions for advanced filtering.

**Returns:** `DataMaster` - A new DataMaster instance containing only the matching rows.

**Example:**
```javascript
const highValueSales = dm.where("status = 'active' AND sales > '1000'");
```

#### `.getIndices(filter)`

Returns the positional indices of rows that match the filter criteria.

**Parameters:**
- `filter` (Object|Function): Object with field-value pairs for AND filtering, or function that receives row object.

**Returns:** `Array<Number>` - An array of zero-based row indices.

**Example:**
```javascript
const activeIndices = dm.getIndices({ status: 'active' });
```

#### `.getIndicesWhere(clauseString, queryFunctions)`

Returns the positional indices of rows that match the WHERE clause.

**Parameters:**
- `clauseString` (String): The WHERE clause to execute (supports field names, =, !=, AND, OR, parentheses, wildcards, custom functions).
- `queryFunctions` (Object, optional): Custom query functions for advanced filtering.

**Returns:** `Array<Number>` - An array of zero-based row indices.

**Example:**
```javascript
const salesIndices = dm.getIndicesWhere("sales > '1000'");
```

#### `.query(verb, options)`

Unified query engine for declarative data manipulation. Adheres to the mutability contract: 'select' returns a new instance, while 'update' and 'delete' modify the instance in-place and return `this`.

**Parameters:**
- `verb` (String): The action to perform: 'select', 'update', or 'delete'.
- `options` (Object): Configuration object for the query.

**Returns:** `DataMaster|this` - For 'select', returns a new DataMaster instance. For 'update' or 'delete', mutates the instance and returns this.

**Example:**
```javascript
// Select with conditions
const filtered = dm.query('select', { 
  fields: ['name', 'age'], 
  where: "age > '25'" 
});

// Update records
dm.query('update', { 
  set: { status: 'verified' }, 
  where: "age >= '18'" 
});

// Delete records
dm.query('delete', { 
  where: "status = 'inactive'" 
});
```

#### `.clone()`

Creates a deep copy of this DataMaster instance.

**Returns:** `DataMaster` - A new DataMaster instance with identical data.

**Example:**
```javascript
const backupDM = dm.clone();
```

#### `.slice(begin, end)`

Extracts a section of the DataMaster's rows (non-destructive).

**Parameters:**
- `begin` (Number): The start index (inclusive).
- `end` (Number): The end index (exclusive).

**Returns:** `DataMaster` - New DataMaster instance with the extracted rows.

**Example:**
```javascript
const page2 = dm.slice(10, 20); // Get rows 10-19 for pagination
const lastTwoRows = dm.slice(-2); // Get last 2 rows
```

#### `.toRecordset()`

Converts DataMaster to recordset format.

**Returns:** `Array<Object>` - Array of objects.

**Example:**
```javascript
const recordset = dm.toRecordset();
```

#### `.toTable(options)`

Converts DataMaster to table format.

**Parameters:**
- `options` (Object, optional): Export options.
  - `includeHeaders` (Boolean): If true, the first row will be the field names.

**Returns:** `Array<Array>` - 2D array with optional headers.

**Example:**
```javascript
const table = dm.toTable({ includeHeaders: true });
```

#### `.toCsv(options)`

Converts DataMaster to CSV string.

**Parameters:**
- `options` (Object, optional): Export options.
  - `includeHeaders` (Boolean): If true, the first line will be the field names.
  - `newLineString` (String): The character(s) to use for new lines.

**Returns:** `String` - CSV formatted string.

**Example:**
```javascript
const csv = dm.toCsv({ includeHeaders: true });
```

> **Note:** DataMaster provides three pairs of methods for filtering data:
> - `.search()` / `.where()` - Return new DataMaster instances with filtered data
> - `.limit()` / `.limitWhere()` - Modify current instance by removing non-matching rows
> - `.getIndices()` / `.getIndicesWhere()` - Return arrays of matching row indices
> 
> Each pair follows the same pattern: the first method accepts objects/functions, the second accepts WHERE clause strings.

### Instance Methods: Data Extraction

These methods extract specific data from the DataMaster instance without modifying it.

#### `.length()`

Returns the number of rows in the DataMaster.

**Returns:** `Number` - Number of rows.

**Example:**
```javascript
const rowCount = dm.length();
```

#### `.fields()`

Returns a copy of the field names.

**Returns:** `Array<String>` - Array of field names.

**Example:**
```javascript
const fieldNames = dm.fields();
```

#### `.getColumn(column, distinct)`

Returns a single column from the DataMaster.

**Parameters:**
- `column` (String|Number): The column name or index to return.
- `distinct` (Boolean, optional): Whether to return only unique values. Defaults to false.

**Returns:** `Array` - Array of column values.

**Example:**
```javascript
const ages = dm.getColumn('age');
const uniqueStatuses = dm.getColumn('status', true);
```

#### `.getRow(rowIndex, style, idField)`

Returns a single row from the DataMaster.

**Parameters:**
- `rowIndex` (Number): The row index to return.
- `style` (String, optional): The return format: 'array', 'object', 'recordset', or 'recordtable'. Defaults to 'array'.
- `idField` (String|Number, optional): If provided, search for row by ID instead of index.

**Returns:** `Array|Object|Array<Object>|Object` - Row data in specified format.

**Example:**
```javascript
const row = dm.getRow(0); // Returns array
const rowObj = dm.getRow(0, 'object'); // Returns object
const userById = dm.getRow(123, 'object', 'userId'); // Find by ID
```

#### `.getCell(row, column)`

Gets the value of a single cell.

**Parameters:**
- `row` (Number): The row index.
- `column` (String|Number): The column name or index.

**Returns:** `*` - The cell value.

**Example:**
```javascript
const name = dm.getCell(0, 'name');
const firstValue = dm.getCell(0, 0);
```

### Instance Methods: Utility & Debug

These methods provide utilities for debugging and displaying data.

#### `.debug(consoleMode)`

Exports a string representation of the DataMaster.

**Parameters:**
- `consoleMode` (Boolean, optional): true for console output, false for HTML. Defaults to false.

**Returns:** `String` - String representation of the DataMaster.

**Example:**
```javascript
console.log(dm.debug(true)); // Console-friendly output
document.body.innerHTML = dm.debug(false); // HTML output
```

#### `.print(consoleMode)`

Exports a string representation of the DataMaster (alias for debug).

**Parameters:**
- `consoleMode` (Boolean, optional): true for console output, false for HTML. Defaults to false.

**Returns:** `String` - String representation of the DataMaster.

**Example:**
```javascript
console.log(dm.print(true));
```

## Top-Level Utility Functions

Convenience functions available on the main DataMaster object.

### `DataMaster.converters`

An object containing stateless utility functions for converting between data formats.

#### `DataMaster.converters.recordsetToTable(recordset)`

Converts a recordset to a table format.

**Parameters:**
- `recordset` (Array<Object>): Array of objects.

**Returns:** `Object` - An object with fields and table properties.

**Example:**
```javascript
const result = DataMaster.converters.recordsetToTable([
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
]);
// Returns: { fields: ['name', 'age'], table: [['John', 30], ['Jane', 25]] }
```

#### `DataMaster.converters.tableToRecordset(table, fields)`

Converts a table to a recordset format.

**Parameters:**
- `table` (Array<Array>): 2D array of data.
- `fields` (Array<String>): Field names.

**Returns:** `Array<Object>` - Array of objects.

**Example:**
```javascript
const recordset = DataMaster.converters.tableToRecordset(
  [['John', 30], ['Jane', 25]], 
  ['name', 'age']
);
// Returns: [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }]
```

#### `DataMaster.converters.csvToTable(csvString, options)`

Converts CSV string to table format.

**Parameters:**
- `csvString` (String): CSV data as string.
- `options` (Object, optional): Parsing options.
  - `headersInFirstRow` (Boolean): If true, the first row contains headers.
  - `isTSV` (Boolean): If true, parses tab-separated values.

**Returns:** `Object` - An object with fields and table properties.

**Example:**
```javascript
const result = DataMaster.converters.csvToTable(
  'name,age\nJohn,30\nJane,25',
  { headersInFirstRow: true }
);
// Returns: { fields: ['name', 'age'], table: [['John', '30'], ['Jane', '25']] }
```

#### `DataMaster.converters.tableToCsv(table, fields, options)`

Converts table data to CSV string.

**Parameters:**
- `table` (Array<Array>): 2D array of data.
- `fields` (Array<String>): Field names.
- `options` (Object, optional): Export options.
  - `includeHeaders` (Boolean): If true, include headers in output.
  - `newLineString` (String): Line ending character(s).

**Returns:** `String` - CSV formatted string.

**Example:**
```javascript
const csv = DataMaster.converters.tableToCsv(
  [['John', 30], ['Jane', 25]], 
  ['name', 'age'],
  { includeHeaders: true }
);
// Returns: "name,age\nJohn,30\nJane,25\n"
```