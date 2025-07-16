# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.1.0] - 2024-07-10

### Added
- **Array-like methods**: Added `.slice()` and `.splice()` methods for enhanced data manipulation
  - `.slice(begin, end)` - Extract a section of rows (non-destructive)
  - `.splice(start, deleteCount, ...items)` - Remove/replace/add rows in place
- Both methods follow JavaScript Array patterns for familiar behavior

### Changed
- Enhanced API documentation with comprehensive method coverage
- Updated documentation examples to use proper DQL syntax (all values quoted)

### Fixed
- Corrected DQL syntax errors in documentation where numeric values weren't properly quoted

## [5.0.0] - 2024-07-10

### Added
- **Complete API redesign** - New Swiss Army Knife architecture
- **Factory methods** for clear instantiation:
  - `DataMaster.fromRecordset()` - Create from array of objects
  - `DataMaster.fromTable()` - Create from 2D arrays  
  - `DataMaster.fromCsv()` - Create from CSV strings
- **Powerful query engine** with SQL-like syntax:
  - `SELECT` queries with field selection, WHERE clauses, ORDER BY, LIMIT, OFFSET
  - `UPDATE` queries with conditional modifications
  - `DELETE` queries with filtering
  - Custom functions support with `@functionName()` syntax
  - Wildcard pattern matching with `%` and `_`
  - Global field search with `*` operator
- **Mutability contract**: Clear distinction between mutating and non-mutating methods
- **Comprehensive error handling** with configurable modes (standard, strict, silent)
- **Enhanced data manipulation**:
  - Advanced sorting with multiple fields and custom primers
  - Duplicate removal with field-specific matching
  - Column/row formatting with custom functions
  - Pivot/transpose operations
  - Summary calculations (sum/average columns and rows)
  - Field reordering and renaming
- **Flexible filtering**:
  - Object-based filtering for AND conditions
  - Function-based filtering for custom logic
  - WHERE clause string parsing with complex expressions
  - Logical operators (AND, OR) with parentheses support
- **Export capabilities**:
  - Convert to recordsets, tables, or CSV with options
  - Configurable headers and formatting
- **Utility methods**:
  - Deep cloning with `.clone()`
  - Debug output with `.debug()` and `.print()`
  - Cell, row, and column access methods

### Changed
- **⚠️ BREAKING CHANGES**: Complete API overhaul - not backward compatible
- Constructor now private - use factory methods instead
- Method signatures updated across the board
- Error handling system redesigned

### Removed
- Direct constructor access (use factory methods)
- Legacy method signatures and return patterns
- Previous error handling approach

---

## Migration from Pre-5.0.0

**⚠️ Important**: Version 5.0.0 introduces breaking changes and requires migration.

### Quick Migration Steps:
1. Replace direct constructor calls with factory methods:
   ```javascript
   // Old
   const dm = new DataMaster(data);
   
   // New  
   const dm = DataMaster.fromRecordset(data);
   ```
3. Review method signatures - many have changed
4. Update error handling to use new configurable system
5. Test thoroughly due to extensive API changes

For detailed migration instructions, see the [Migration Guide](docs/migration-guide.md).

---

## Version Support

- **5.1.x**: Current stable version with active development
- **5.0.x**: Supported for critical bug fixes
- **< 5.0.0**: Legacy versions - no longer supported

## Links

- [API Documentation](docs/api-reference.md)
- [Query Language Guide](docs/query-syntax.md)
- [Migration Guide](docs/migration-guide.md)
- [GitHub Repository](https://github.com/jonwyett/DataMaster)
- [Issue Tracker](https://github.com/jonwyett/DataMaster/issues)