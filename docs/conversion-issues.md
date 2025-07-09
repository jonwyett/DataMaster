# DataMaster v4.0.0 to v5.0.0 Migration Guide

## Executive Summary

The transition from v4.0.0 to v5.0.0 is not a simple update; it is a complete architectural rewrite.

### Key Changes

**From Constructor to Class**: The core DataMaster object has been refactored from a classic JavaScript constructor function (`var DataMaster = function(...)`) into a modern ES6 class.

**Removal of DataQuery**: The DataQuery class, which provided a SQL-like interface in v4.0.0, has been completely removed. Some of its functionality (like WHERE/UPDATE/DELETE logic) has been integrated directly into DataMaster via a new `.query()` method, but the separation of concerns is gone. This is the most significant breaking change.

**API Exposure**: v4.0.0 exported two distinct constructors for Node.js. v5.0.0 uses a Universal Module Definition (UMD) pattern, exposing a single namespace object (jwdm) that contains DataMaster and other utilities, making it more robust for both browser and Node.js environments.

**Static Factory Methods**: v5.0.0 introduces static factory methods (`DataMaster.fromRecordset`, `fromCsv`, etc.) to create instances. This is a major improvement over the v4.0.0 constructor, which used complex internal logic to guess the input data type.

**Formalized Error Handling**: v5.0.0 introduces a robust, configurable error-handling system (`_handleError`), a significant improvement over the simple `this.valid` flag in v4.0.0.

**API Cleanup**: Methods like `exportAs` have been replaced with more explicit and intuitive methods like `toRecordset`, `toTable`, and `toCsv`. Many methods that took multiple arguments now take a single options object, which is a more scalable pattern.

## Public Function/Method Analysis

The following table compares the public-facing methods of the libraries:

| Function/Method Name | Version 4.0.0 (Old) | Version 5.0.0 (New) | Notes / Changes |
|---------------------|---------------------|---------------------|----------------|
| DataMaster Constructor | `new DataMaster(data, fields, options)` | Not directly used | **Major Change**: The constructor in v5 is minimal. All data loading is now handled by static factory methods. |
| DataMaster.fromRecordset | N/A | `DataMaster.fromRecordset(recordset, options)` | **New Feature**: Static factory method for cleaner instantiation. |
| DataMaster.fromTable | N/A | `DataMaster.fromTable(table, options)` | **New Feature**: Static factory method. |
| DataMaster.fromCsv | N/A | `DataMaster.fromCsv(csvString, options)` | **New Feature**: Static factory method. |
| DataMaster.fromGenerator | N/A | `DataMaster.fromGenerator(template, options)` | **New Feature**: Static factory method. Replaces the old `createTable` instance method. |
| debug / print | `dm.debug(consoleMode)` | `dm.debug(consoleMode)` | **Matched**: Functionality appears identical. |
| copy | `dm.copy()` | N/A (Replaced by clone) | **Replaced**: v5.0.0 uses the more standard `clone()` to return a new DataMaster instance. `copy()` in v4 returned a plain object. |
| clone | N/A | `dm.clone()` | **New Feature**: Creates a new, deep-copied DataMaster instance. |
| exportAs | `dm.exportAs(style, options)` | N/A (Replaced) | **Replaced**: This has been broken out into more specific `to...()` methods. |
| toRecordset | N/A | `dm.toRecordset()` | **New/Replaced**: Replaces `exportAs('recordset')`. |
| toTable | N/A | `dm.toTable(options)` | **New/Replaced**: Replaces `exportAs('table')`. |
| toCsv | N/A | `dm.toCsv(options)` | **New/Replaced**: Replaces `exportAs('csv')`. |
| table | `dm.table()` | N/A (Replaced) | **Replaced**: Functionality is now covered by `toTable()`. |
| fields | `dm.fields()` | `dm.fields()` | **Matched**: Returns a copy of the fields array. |
| getColumn | `dm.getColumn(column, distinct)` | `dm.getColumn(field)` | **Changed**: The `distinct` option was removed. This would need to be implemented manually in v5. |
| getRow | `dm.getRow(rowID, style, IDField)` | `dm.getRow(rowIndex)` | **Changed**: v5 is simplified. It only takes a row index and always returns a single recordset-style object. ID-based search and different return styles are removed. |
| sort | `dm.sort(fields, desc)` | `dm.sort(fieldOrFields, directionOrDirections)` | **Matched**: Core functionality is the same. |
| reorder | `dm.reorder(fields)` | N/A (Integrated into query) | **Removed/Integrated**: This functionality is now handled by the SELECT part of the new `.query()` method. |
| search | `dm.search(options)` | `dm.search(filter)` | **Changed**: While it exists in both, the v5 version returns a new DataMaster instance with the results, making it non-mutating. The old version returned various data types. |
| replace | `dm.replace(query, newValue, fields)` | `dm.replace(query, newValue, fields)` | **Matched**: Core functionality appears identical. |
| limit | `dm.limit(options)` | `dm.limit(filter)` | **Matched**: Core functionality is the same (mutates the instance). |
| modifyFieldNames | `dm.modifyFieldNames(fieldMap, reorder)` | N/A (Replaced) | **Replaced**: This is now handled by `setFieldNames()`. The reordering aspect is gone. |
| setFieldNames | `dm.setFieldNames(fields)` | `dm.setFieldNames(fields)` | **Matched**: Core functionality is the same. |
| addColumn | `dm.addColumn(name, data, location)` | `dm.addColumn(name, data, location)` | **Matched**: Core functionality is the same. |
| removeColumn | `dm.removeColumn(column)` | `dm.removeColumn(field)` | **Matched**: Core functionality is the same. |
| addRow | `dm.addRow(data, location)` | `dm.addRow(rowData, location)` | **Matched**: Core functionality is the same. |
| removeRow | `dm.removeRow(index)` | `dm.removeRow(rowIndex)` | **Matched**: Core functionality is the same. |
| modifyCell | `dm.modifyCell(row, column, value)` | `dm.modifyCell(rowIndex, field, newValue)` | **Matched**: Core functionality is the same. |
| getCell | `dm.getCell(row, column)` | `dm.getCell(rowIndex, field)` | **Matched**: Core functionality is the same. |
| length | `dm.length(columns)` | `dm.length()` | **Changed**: v5 `length()` only returns the row count. The ability to get column count via `length(true)` is removed (use `dm.fields().length` instead). |
| sumColumns | `dm.sumColumns(label, columns, isAverage, isNaNValue)` | `dm.sumColumns(options)` | **Changed Signature**: v5 uses a single options object, which is an improvement. Functionality is the same. |
| sumRows | `dm.sumRows(label, rows, isAverage, isNaNValue)` | `dm.sumRows(options)` | **Changed Signature**: v5 uses a single options object. Functionality is the same. |
| pivot | `dm.pivot()` | `dm.pivot()` | **Matched**: Core functionality appears identical. |
| removeDuplicates | `dm.removeDuplicates(fields)` | `dm.removeDuplicates(fields)` | **Matched**: Core functionality appears identical. |
| formatColumn | `dm.formatColumn(column, format)` | `dm.formatColumn(field, formatFn)` | **Matched**: Core functionality is the same. |
| formatRow | `dm.formatRow(row, format)` | `dm.formatRow(rowIndex, formatFn)` | **Matched**: Core functionality is the same. |
| createTable | `dm.createTable(template, library)` | N/A (Replaced by `DataMaster.fromGenerator`) | **Replaced**: Replaced by a static factory method. |
| DataQuery Class | `new DataQuery(data, fields, options)` | N/A | **Removed**: The entire class and its methods (query, update, delete, insert) are gone. |
| query | N/A | `dm.query(sqlString)` | **New Feature**: A powerful method added to DataMaster to handle SQL-like SELECT, UPDATE, and DELETE operations, partially replacing DataQuery. |
| update | N/A | `dm.update(setClause, whereClause)` | **New Feature**: A convenience wrapper around `.query('UPDATE...')`. |
| delete | N/A | `dm.delete(whereClause)` | **New Feature**: A convenience wrapper around `.query('DELETE...')`. |

## Private Function Analysis

These functions are not part of the public API but are used internally. The main change is that v5 moves many of them outside the class to be true private helpers within the module scope, or renames them with a leading underscore (`_`) to denote them as private class methods.

| Function Name | Version 4.0.0 (Old) | Version 5.0.0 (New) | Notes / Changes |
|---------------|---------------------|---------------------|----------------|
| csvToTable | Yes (private) | Yes (private helper) | **Matched**: Moved to be a helper function outside the class. |
| multiFieldSort | Yes (private) | Yes (private helper) | **Matched**: Moved to be a helper function outside the class. |
| copy | Yes (private) | Yes (private helper) | **Matched**: Moved to be a helper function outside the class. |
| findFieldIndex | Yes (private) | `_findFieldIndex` | **Matched & Renamed**: Converted to a private-convention class method. |
| createFields | Yes (private) | `_createFields` | **Matched & Renamed**: Converted to a private-convention class method. |
| recordsetToRecordTable | Yes (private) | Yes (private helper) | **Matched**: Moved to be a helper function outside the class. |
| reorderData | Yes (private) | `_reorderData` | **Matched & Renamed**: Converted to a private-convention class method. |
| recordtableToRecordset | Yes (private) | Yes (private helper) | **Matched**: Moved to be a helper function outside the class. |
| createCSV | Yes (private) | Yes (private helper) | **Matched**: Moved to be a helper function outside the class. |
| advancedSearch | Yes (private) | Yes (private helper) | **Matched**: Moved to be a helper function outside the class. |
| sortBy | Yes (private) | N/A | **Removed**: This simpler single-field sort function was absorbed into the more capable multiFieldSort. |
| _handleError | N/A | `_handleError` | **New Feature**: Centralized, configurable error handling. |
| _createErrorDataMaster | N/A | `_createErrorDataMaster` | **New Feature**: Part of the new error handling system. |
| _getSqlVerb | N/A | `_getSqlVerb` | **New Feature**: Helper for the new `.query()` method. |
| _execute... | N/A | `_executeSelect`, `_executeMutation`, etc. | **New Feature**: Private methods to handle the logic for the new `.query()` method. |
| _parse... | N/A | `_parseSetClause`, `_parseOrderByClause` | **New Feature**: Private methods to handle the logic for the new `.query()` method. |

## Problem Areas & Key Inconsistencies

### 1. Massive Breaking Change: Removal of DataQuery

**Problem**: Code written for v4.0.0 that uses `new DataQuery(...)` will completely fail in v5.0.0.

**Impact**: The entire paradigm of separating data storage (DataMaster) from querying (DataQuery) has been abandoned. In v5.0.0, DataMaster is now responsible for its own complex mutation and querying via the `.query()` method. This is a fundamental design shift that requires a complete rewrite of any dependent code.

### 2. Inconsistent Method Replacement

**Problem**: The API has been streamlined, but not always in a 1-to-1 way, which can be confusing for migration.

**Examples**:
- `exportAs()` is cleanly replaced by `toTable()`, `toCsv()`, etc. (Good)
- `getRow(id, style, idField)` is replaced by a much simpler `getRow(index)`. The ability to search by a specific ID field within `getRow` is lost. A user must now perform a `.search()` first to find the index, which is less convenient
- `reorder()` is gone. A user must now use the more complex `.query('SELECT col1, col2...')` to achieve the same result

### 3. Loss of Minor Features

**Problem**: In the process of streamlining, some small but potentially useful features were dropped.

**Examples**:
- `getColumn(column, distinct)` lost its `distinct` parameter
- `length(true)` to get column count is gone. While `dm.fields().length` is an easy replacement, it's still a change in behavior

### 4. Shift from Non-Mutating to Mutating (and vice-versa)

**Problem**: The philosophical approach to mutation has changed for some methods.

**Example**: v4's `search()` returned a plain array/object (non-mutating). v5's `search()` returns a new DataMaster instance, which is an excellent, non-mutating pattern. However, the new `.query()` method can be either non-mutating (for SELECT) or mutating (for UPDATE/DELETE), which could be a source of confusion.

### 5. SQL-like Interface is Less Explicit

**Problem**: The new `.query(sqlString)` method relies on string parsing. This can be more error-prone than the object-based query builder in v4.0.0's DataQuery (`query.where = '...'`, `query.select = '...'`). A typo in the SQL string in v5 might fail silently or produce unexpected results, whereas a typo in a v4 query object property name would be more obvious.