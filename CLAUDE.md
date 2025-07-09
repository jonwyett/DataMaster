# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DataMaster is a JavaScript library for database-style data manipulation. It provides a Swiss Army Knife approach to data processing, supporting various input formats (recordsets, tables, CSV) and offering tools for sorting, searching, filtering, pivoting, and exporting data.

## Core Architecture

### Current Implementation (v3.2.1)
The main library is in `datamaster.js` and implements a factory pattern with static methods:

- **Static Factory Methods**: `DataMaster.fromRecordset()`, `DataMaster.fromTable()`, `DataMaster.fromCsv()`, `DataMaster.fromGenerator()`
- **Data Formats**: Supports recordsets (array of objects), tables (2D arrays), and CSV strings
- **Error Handling**: Configurable error modes (`standard`, `strict`, `silent`) with centralized error handling
- **Method Categories**:
  - Mutating methods (return `this` for chaining): `modifyCell()`, `addRow()`, `removeRow()`, `addColumn()`, `removeColumn()`, `sort()`, `pivot()`, etc.
  - Non-mutating methods (return new values): `getCell()`, `getRow()`, `getColumn()`, `length()`, `fields()`, `toRecordset()`, `toTable()`, `toCsv()`

### Key Constructor Options
When using factory methods, you can pass an options object with:
- `headersInFirstRow`: boolean - treat first row as headers
- `headers`: array - explicit header names
- `errorMode`: 'standard' | 'strict' | 'silent'
- `onError`: function - custom error callback

## Development Environment

### No Build Process
This project has no build step or bundling. The main file `datamaster.js` is a standalone JavaScript file using an IIFE wrapper for universal compatibility (Node.js and browser).

### Testing
- No formal test framework is configured (`package.json` shows "no test specified")
- Test files are in `/test/` directory using simple Node.js scripts
- Run tests manually: `node test/test.js`

### Current State
The project is in active redesign according to `docs/redesign-proposal.md`. The current implementation is v3.2.1 but there are backup files suggesting work toward v5.0.0.

## Code Structure

### Main Files
- `datamaster.js` - Core library implementation
- `test/test.js` - Basic test file demonstrating usage
- `docs/README.md` - Comprehensive API documentation
- `docs/redesign-proposal.md` - Architectural redesign plan

### Helper Functions (Outside Class)
- `deepCopy()` - Deep cloning using JSON serialization
- `recordsetToTable()` - Convert array of objects to table format
- `tableToRecordset()` - Convert table to array of objects
- `csvToTable()` - Parse CSV strings to table format
- `tableToCsv()` - Convert table to CSV string

### Class Structure
The DataMaster class uses private properties (`_table`, `_fields`, `_options`) and implements:
- Constructor for internal use only
- Static factory methods for instantiation
- Instance methods following mutating/non-mutating contract
- Centralized error handling via `_handleError()`

## Query Language
The library supports SQL-like queries through the DataQuery system (documented in `docs/DataQuery.md`):
- WHERE clauses with AND/OR operators
- Custom functions for complex filtering
- Wildcards (% and _) for pattern matching
- Case-sensitive field names, case-insensitive values

## Common Development Patterns

### Creating DataMaster Instances
```javascript
// From table with headers in first row
const dm = DataMaster.fromTable(table, { headersInFirstRow: true });

// From recordset
const dm = DataMaster.fromRecordset(arrayOfObjects);

// From CSV
const dm = DataMaster.fromCsv(csvString, { headersInFirstRow: true });
```

### Error Handling
The library uses a centralized error handling system. Errors are handled based on the configured `errorMode`:
- `standard`: Returns error DataMaster instances or error strings
- `strict`: Throws exceptions
- `silent`: Logs to console and returns graceful failure values

### Method Chaining
Mutating methods return `this` for fluent chaining:
```javascript
dm.addColumn('newCol', data)
  .sort('fieldName')
  .pivot();
```

## File Organization
- Root level: Main library file and package.json
- `/test/` - Test files and debugging scripts
- `/docs/` - Documentation and design proposals
- `/backup/` - Previous versions and experimental code

## Important Notes
- The library is designed to work without external dependencies
- Uses ES6+ features (classes, const/let, arrow functions)
- Wrapped in IIFE for universal module compatibility
- No transpilation or build process required
- Current version uses JSON.stringify/parse for deep copying (limitations with functions, dates, etc.)