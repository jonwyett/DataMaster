# Table of Contents
- [UnnamedFunction()](#unnamedfunction--)
- [deepCopy(data)](#deepcopy-data-)
- [recordsetToTable(recordset)](#recordsettotable-recordset-)
- [tableToRecordset(table, fields)](#tabletorecordset-table--fields-)
- [csvToTable(csvString, options = {})](#csvtotable-csvstring--options-=-{}-)
- [tableToCsv(table, fields, options = {})](#tabletocsv-table--fields--options-=-{}-)
- [itemInList(list, item)](#iteminlist-list--item-)
- [getTableColumn(table, column, distinct = false)](#gettablecolumn-table--column--distinct-=-false-)
- [getTableRow(table, rowIndex)](#gettablerow-table--rowindex-)
- [isRowDuplicate(rowData, existingTable, columnIndexes)](#isrowduplicate-rowdata--existingtable--columnindexes-)
- [multiFieldSort(fields, directions, primers)](#multifieldsort-fields--directions--primers-)
- [validateAndConvertFields(fieldNames, fields)](#validateandconvertfields-fieldnames--fields-)
- [reorderTableData(table, fields, order)](#reordertabledata-table--fields--order-)
- [looseCaseInsensitiveCompare(value, query, forceCaseSensitivity = false)](#loosecaseinsensitivecompare-value--query--forcecasesensitivity-=-false-)
- [parseFunctionString(functionString)](#parsefunctionstring-functionstring-)
- [evaluateSingleOperation(data, fields, operation, queryFunctions = {})](#evaluatesingleoperation-data--fields--operation--queryfunctions-=-{}-)
- [replaceAndEvaluateExpressions(data, fields, query, queryFunctions = {})](#replaceandevaluateexpressions-data--fields--query--queryfunctions-=-{}-)
- [evaluateLogicalExpression(expression)](#evaluatelogicalexpression-expression-)
- [evaluateNestedExpression(expression)](#evaluatenestedexpression-expression-)
- [expandAllFields(query, fields)](#expandallfields-query--fields-)
- [parseOrderByClause(orderByClause)](#parseorderbyclause-orderbyclause-)
- [constructor(table, fields, options = {})](#constructor-table--fields--options-=-{}-)
- [_validateOptions(options)](#_validateoptions-options-)
- [_executeProgrammaticFilter(filter)](#_executeprogrammaticfilter-filter-)
- [_executeWhere(clauseString, queryFunctions = {})](#_executewhere-clausestring--queryfunctions-=-{}-)
- [_handleError(errorMessage, errorType = 'UserError', returnTypeHint = 'DataMaster')](#_handleerror-errormessage--errortype-=-'usererror'--returntypehint-=-'datamaster'-)
- [_createErrorValueByType(errorType, errorMessage, returnTypeHint)](#_createerrorvaluebytype-errortype--errormessage--returntypehint-)
- [fromRecordset(recordset, options = {})](#fromrecordset-recordset--options-=-{}-)
- [fromTable(table, options = {})](#fromtable-table--options-=-{}-)
- [fromCsv(csvString, options = {})](#fromcsv-csvstring--options-=-{}-)
- [toRecordset()](#torecordset--)
- [toTable(options = {})](#totable-options-=-{}-)
- [toCsv(options = {})](#tocsv-options-=-{}-)
- [length()](#length--)
- [fields()](#fields--)
- [getColumn(column, distinct = false)](#getcolumn-column--distinct-=-false-)
- [getRow(rowIndex, style = 'array', idField = null)](#getrow-rowindex--style-=-'array'--idfield-=-null-)
- [getCell(row, column)](#getcell-row--column-)
- [clone()](#clone--)
- [debug(consoleMode = false)](#debug-consolemode-=-false-)
- [lPad(value, length)](#lpad-value--length-)
- [print(consoleMode = false)](#print-consolemode-=-false-)
- [pivot()](#pivot--)
- [addRow(data, location)](#addrow-data--location-)
- [removeRow(index)](#removerow-index-)
- [addColumn(name, data, location)](#addcolumn-name--data--location-)
- [removeColumn(column)](#removecolumn-column-)
- [modifyCell(row, column, value)](#modifycell-row--column--value-)
- [formatColumn(column, formatFn)](#formatcolumn-column--formatfn-)
- [formatRow(row, formatFn)](#formatrow-row--formatfn-)
- [sort(fields, directions, primers)](#sort-fields--directions--primers-)
- [sumColumns(options = {})](#sumcolumns-options-=-{}-)
- [sumRows(options = {})](#sumrows-options-=-{}-)
- [reorder(fields)](#reorder-fields-)
- [modifyFieldNames(fieldMap, reorderAfter = false)](#modifyfieldnames-fieldmap--reorderafter-=-false-)
- [setFieldNames(fields)](#setfieldnames-fields-)
- [replace(query, newValue, fields)](#replace-query--newvalue--fields-)
- [limit(filter)](#limit-filter-)
- [limitWhere(clauseString, queryFunctions = {})](#limitwhere-clausestring--queryfunctions-=-{}-)
- [removeDuplicates(fields)](#removeduplicates-fields-)
- [search(filter)](#search-filter-)
- [where(clauseString, queryFunctions = {})](#where-clausestring--queryfunctions-=-{}-)
- [getIndices(filter)](#getindices-filter-)
- [getIndicesWhere(clauseString, queryFunctions = {})](#getindiceswhere-clausestring--queryfunctions-=-{}-)
- [query(verb, options = {})](#query-verb--options-=-{}-)
- [_executeQuerySelect(options)](#_executequeryselect-options-)
- [_executeQueryUpdate(options)](#_executequeryupdate-options-)
- [_executeQueryDelete(options)](#_executequerydelete-options-)
- [slice(begin, end)](#slice-begin--end-)
- [splice(start, deleteCount, ...items)](#splice-start--deletecount--...items-)

# UnnamedFunction()
### Description
- ver 5.0.1 25/07/10

### Notes
- remove refreces to table generator
ver 5.0.0 25/07/10
- total refactor and major upgrade

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# deepCopy(data)
### Description
- Creates a deep copy of data using JSON serialization

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# recordsetToTable(recordset)
### Description
- Converts a recordset to a table format

### Parameters
- **recordset** `Array<Object>` - Array of objects

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# tableToRecordset(table, fields)
### Description
- Converts a table to a recordset format

### Parameters
- **table** `Array<Array>` - 2D array of data
- **fields** `Array<string>` - Field names

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# csvToTable(csvString, options = {})
### Description
- Converts CSV string to table format

### Parameters
- **csvString** `string` - CSV data as string
- **options** `Object` - Parsing options

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# tableToCsv(table, fields, options = {})
### Description
- Converts table data to CSV string

### Parameters
- **table** `Array<Array>` - 2D array of data
- **fields** `Array<string>` - Field names
- **options** `Object` - Export options

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# itemInList(list, item)
### Description
- Checks if an item is in a list using soft equivalence (1 == '1')

### Parameters
- **list** `Array` - The list to check against

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# getTableColumn(table, column, distinct = false)
### Description
- Returns a single column from a table

### Parameters
- **table** `Array<Array>` - 2D array of data
- **column** `number` - The index of the column to return
- **[distinct=false]** `boolean` - Whether to return only unique values

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# getTableRow(table, rowIndex)
### Description
- Returns a single row from a table

### Parameters
- **table** `Array<Array>` - 2D array of data
- **rowIndex** `number` - The index of the row to return

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# isRowDuplicate(rowData, existingTable, columnIndexes)
### Description
- Tests if a row is a duplicate based on specified column indexes

### Parameters
- **rowData** `Array` - The row to test
- **existingTable** `Array<Array>` - The table to check against
- **columnIndexes** `Array<number>` - The column indexes to compare

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# multiFieldSort(fields, directions, primers)
### Description
- Generates a comparator function for sorting an array of arrays based on

### Parameters
- **fields** `Array<number>` - Array of column indices to sort by
- **directions** `Array<boolean>` - Array of booleans where true = descending, false = ascending
- **[primers]** `Array<Function>` - Optional array of functions to transform each field before comparison

### Notes
multiple fields and corresponding sort orders.

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# validateAndConvertFields(fieldNames, fields)
### Description
- Validates and converts field references to column indexes

### Parameters
- **fieldNames** `Array<string>` - The field names array
- **fields** `Array<string|number>` - Fields to validate and convert

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# reorderTableData(table, fields, order)
### Description
- Reorders table data and fields based on the specified field order

### Parameters
- **table** `Array<Array>` - The table data to reorder
- **fields** `Array<string>` - The current field names
- **order** `Array<string|number>` - The fields/indexes to keep and their order

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# looseCaseInsensitiveCompare(value, query, forceCaseSensitivity = false)
### Description
- Performs case-insensitive string comparison with wildcard support

### Parameters
- **[forceCaseSensitivity=false]** `boolean` - Whether to force case sensitivity

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# parseFunctionString(functionString)
### Description
- Parses a function string into name and parameters

### Parameters
- **functionString** `string` - The function string to parse

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# evaluateSingleOperation(data, fields, operation, queryFunctions = {})
### Description
- Evaluates a single operation (e.g., "1='smith'")

### Parameters
- **data** `Array` - The row data to evaluate against
- **fields** `Array` - The field names
- **operation** `string` - The operation string
- **[queryFunctions={}]** `Object` - Custom query functions

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# replaceAndEvaluateExpressions(data, fields, query, queryFunctions = {})
### Description
- Replaces field expressions with boolean results

### Parameters
- **data** `Array` - The row data to evaluate against
- **fields** `Array` - The field names
- **query** `string` - The query string with field expressions
- **[queryFunctions={}]** `Object` - Custom query functions

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# evaluateLogicalExpression(expression)
### Description
- Evaluates a logical expression with AND/OR operators

### Parameters
- **expression** `string` - The boolean expression to evaluate

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# evaluateNestedExpression(expression)
### Description
- Evaluates nested expressions with parentheses

### Parameters
- **expression** `string` - The expression to evaluate

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# expandAllFields(query, fields)
### Description
- Expands the  operator to match all fields

### Parameters
- **query** `string` - The query string with potential  operators
- **fields** `Array<string>` - The field names to expand against

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# parseOrderByClause(orderByClause)
### Description
- Parses ORDER BY clause string into fields and order directions

### Parameters
- **orderByClause** `string` - String like "field1 ASC, field2 DESC" or "ORDER BY field1 ASC, field2 DESC"

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# constructor(table, fields, options = {})
### Description
- Constructor is simple, meant for internal use by the factories

### Parameters
- **table** `Array<Array>` - 2D array of data
- **fields** `Array<string>` - Field names
- **options** `Object` - Configuration options

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# _validateOptions(options)
### Description
- Validates and normalizes options

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# _executeProgrammaticFilter(filter)
### Description
- Executes a programmatic filter (object or function) against the DataMaster data

### Parameters
- **filter** `Object|Function` - Object with field-value pairs for AND filtering, or function that receives row object

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# _executeWhere(clauseString, queryFunctions = {})
### Description
- Executes a WHERE clause against the DataMaster data

### Parameters
- **clauseString** `string` - The WHERE clause to execute
- **[queryFunctions={}]** `Object` - Custom query functions

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# _handleError(errorMessage, errorType = 'UserError', returnTypeHint = 'DataMaster')
### Description
- Central error handler - THE ONLY PLACE WHERE ERRORS ARE THROWN

### Parameters
- **errorMessage** `string` - The error message
- **errorType** `string` - The type of error ('UserError', 'InternalError', etc.)
- **returnTypeHint** `string` - Hint for return type ('DataMaster', 'Array', 'String', 'Primitive')

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# _createErrorValueByType(errorType, errorMessage, returnTypeHint)
### Description
- Creates an error value based on the expected return type

### Parameters
- **errorType** `string` - The type of error
- **errorMessage** `string` - The error message
- **returnTypeHint** `string` - The expected return type

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# fromRecordset(recordset, options = {})
### Description
- Creates a DataMaster from a recordset (array of objects)

### Parameters
- **recordset** `Array<Object>` - Array of objects
- **options** `Object` - Configuration options

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# fromTable(table, options = {})
### Description
- Creates a DataMaster from a table (2D array)

### Parameters
- **table** `Array<Array>` - 2D array of data
- **options** `Object` - Configuration options including headers

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# fromCsv(csvString, options = {})
### Description
- Creates a DataMaster from CSV string

### Parameters
- **csvString** `string` - CSV data as string
- **options** `Object` - Configuration options

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# toRecordset()
### Description
- Converts DataMaster to recordset format

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# toTable(options = {})
### Description
- Converts DataMaster to table format

### Parameters
- **options** `Object` - Export options

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# toCsv(options = {})
### Description
- Converts DataMaster to CSV string

### Parameters
- **options** `Object` - Export options

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# length()
### Description
- Returns the number of rows in the DataMaster

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# fields()
### Description
- Returns a copy of the field names

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# getColumn(column, distinct = false)
### Description
- Returns a single column from the DataMaster

### Parameters
- **column** `string|number` - The column name or index to return
- **[distinct=false]** `boolean` - Whether to return only unique values

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# getRow(rowIndex, style = 'array', idField = null)
### Description
- Returns a single row from the DataMaster

### Parameters
- **rowIndex** `number` - The row index to return
- **[style='array']** `('array'|'object'|'recordset'|'recordtable')` - The return format
- **[idField]** `string|number` - If provided, search for row by ID instead of index

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# getCell(row, column)
### Description
- Gets the value of a single cell

### Parameters
- **row** `number` - The row index
- **column** `string|number` - The column name or index

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# clone()
### Description
- Creates a deep copy of this DataMaster instance

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# debug(consoleMode = false)
### Description
- Exports a string representation of the DataMaster

### Parameters
- **[consoleMode=false]** `boolean` - true is meant for console output false is meant for html

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# lPad(value, length)
### Description
- Left-pads a value to a specified length

### Parameters
- **length** `number` - Target length

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# print(consoleMode = false)
### Description
- Exports a string representation of the DataMaster (alias for debug)

### Parameters
- **[consoleMode=false]** `boolean` - true is meant for console output false is meant for html

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# pivot()
### Description
- Pivots the table (transposes rows and columns)

### Notes
NOTE: This function assumes that your table data has row headers, because that's what the new
columns will be called. Add row headers using addColumn if necessary before running this.

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# addRow(data, location)
### Description
- Adds a row to the DataMaster

### Parameters
- **data** `Array|Object` - The row data as array or object
- **[location]** `number` - The index at which to place the new row, shifting existing rows

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# removeRow(index)
### Description
- Removes a row from the DataMaster

### Parameters
- **index** `number` - Index of the row to remove

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# addColumn(name, data, location)
### Description
- Adds a new column to the DataMaster

### Parameters
- **name** `string` - The column/field name
- **[data]** `Array` - The data to add. If undefined, nulls will be added
- **[location]** `string|number` - Index or fieldname to place the column

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# removeColumn(column)
### Description
- Removes a column from the DataMaster

### Parameters
- **column** `string|number` - The column name or index to remove

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# modifyCell(row, column, value)
### Description
- Modifies a cell value

### Parameters
- **row** `number` - The row index
- **column** `string|number` - The column name or index

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# formatColumn(column, formatFn)
### Description
- Formats the cells in a column based on a formatting function

### Parameters
- **column** `string|number` - The column name or index to format
- **formatFn** `function` - Function to modify/format the data

### Notes
This is an in-place replacement of the original data

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# formatRow(row, formatFn)
### Description
- Formats the cells in a row based on a formatting function

### Parameters
- **row** `number` - The row index to format
- **formatFn** `function` - Function to modify/format the data

### Notes
This is an in-place replacement of the original data

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# sort(fields, directions, primers)
### Description
- Sorts the DataMaster by one or more fields

### Parameters
- **fields** `string|number|Array<string|number>` - Field name(s) or index(es) to sort by
- **[directions=false]** `boolean|Array<boolean>` - Sort direction(s): true = descending, false = ascending
- **[primers]** `Function|Array<Function>` - Optional transformation function(s) for sorting

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# sumColumns(options = {})
### Description
- Sums column values and adds a summary row

### Parameters
- **[options]** `Object` - Configuration options
- **[options.label]** `string` - Label for the summary row (placed in first column)
- **[options.columns]** `Array<string|number>` - Columns to sum (default: all numeric columns)
- **[options.isAverage=false]** `boolean` - Calculate averages instead of sums

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# sumRows(options = {})
### Description
- Sums row values and adds a summary column

### Parameters
- **[options]** `Object` - Configuration options
- **[options.label='Total']** `string` - Label for the summary column
- **[options.rows]** `Array<number>` - Row indexes to sum (default: all rows)
- **[options.isAverage=false]** `boolean` - Calculate averages instead of sums

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# reorder(fields)
### Description
- Reorders the DataMaster columns and removes unwanted fields

### Parameters
- **fields** `Array<string|number>` - The fields to keep and their order

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# modifyFieldNames(fieldMap, reorderAfter = false)
### Description
- Modifies existing field names using a mapping object

### Parameters
- **fieldMap** `Object` - Object mapping old field names to new field names
- **[reorderAfter=false]** `boolean` - Whether to reorder data to match the mapping order

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# setFieldNames(fields)
### Description
- Sets the field names to new values

### Parameters
- **fields** `Array<string>` - The new field names

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# replace(query, newValue, fields)
### Description
- Replaces values in specified fields using a query pattern

### Parameters
- **query** `string|RegExp` - The pattern to search for (string will be converted to case-insensitive global RegExp)
- **[fields]** `Array<string|number>|string|number` - Fields to search in (defaults to all fields)

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# limit(filter)
### Description
- Limits the DataMaster to only rows that match the filter criteria (destructive operation)

### Parameters
- **filter** `Object|Function` - Object with field-value pairs for AND filtering, or function that receives row object

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# limitWhere(clauseString, queryFunctions = {})
### Description
- Executes a WHERE clause and removes non-matching rows (destructive operation)

### Parameters
- **clauseString** `string` - The WHERE clause to execute (supports field names, =, !=, AND, OR, parentheses, wildcards, custom functions)
- **[queryFunctions={}]** `Object` - Custom query functions for advanced filtering

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# removeDuplicates(fields)
### Description
- Removes duplicate entries from the table based on the specified fields

### Parameters
- **[fields]** `Array|string|number` - The fields to match on for duplicate detection

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# search(filter)
### Description
- Searches and returns a new DataMaster instance with filtered data

### Parameters
- **filter** `Object|Function` - Object with field-value pairs for AND filtering, or function that receives row object

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# where(clauseString, queryFunctions = {})
### Description
- Executes a WHERE clause and returns a new DataMaster instance with matching rows

### Parameters
- **clauseString** `string` - The WHERE clause to execute (supports field names, =, !=, AND, OR, parentheses, wildcards, custom functions)
- **[queryFunctions={}]** `Object` - Custom query functions for advanced filtering

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# getIndices(filter)
### Description
- Returns the positional indices of rows that match the filter criteria

### Parameters
- **filter** `Object|Function` - Object with field-value pairs for AND filtering, or function that receives row object

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# getIndicesWhere(clauseString, queryFunctions = {})
### Description
- Returns the positional indices of rows that match the WHERE clause

### Parameters
- **clauseString** `string` - The WHERE clause to execute (supports field names, =, !=, AND, OR, parentheses, wildcards, custom functions)
- **[queryFunctions={}]** `Object` - Custom query functions for advanced filtering

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# query(verb, options = {})
### Description
- Unified query engine for declarative data manipulation.

### Parameters
- **verb** `string` - The action to perform: 'select', 'update', or 'delete'.
- **options** `Object` - Configuration object for the query.

### Notes
Adheres to the mutability contract: 'select' returns a new instance,
while 'update' and 'delete' modify the instance in-place and return `this`.

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# _executeQuerySelect(options)
### Description
- Internal handler for 'select' queries.

### Parameters
- **options** `Object` - Query options.

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# _executeQueryUpdate(options)
### Description
- Internal handler for 'update' queries.

### Parameters
- **options** `Object` - Query options.

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# _executeQueryDelete(options)
### Description
- Internal handler for 'delete' queries.

### Parameters
- **options** `Object` - Query options.

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# slice(begin, end)
### Description
- Extracts a section of the DataMaster's rows (non-destructive)

### Parameters
- **begin** `number` - The start index (inclusive)
- **end** `number` - The end index (exclusive)

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

# splice(start, deleteCount, ...items)
### Description
- Changes the contents of the DataMaster's internal table by removing/replacing/adding rows

### Parameters
- **start** `number` - The start index
- **deleteCount** `number` - The number of rows to remove
- **items** `...Array` - The new rows to add

### Code Examples
```javascript
// Example usage
```

### Comments
- Additional comments or observations.

