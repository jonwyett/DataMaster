# DataMaster

> ⚠️ **BREAKING CHANGES:** This is a major version release with significant API changes. This version is **NOT backward compatible** with previous versions. See the [Migration Guide](#migration-guide) for upgrade instructions.

A powerful and intuitive JavaScript library for in-memory data manipulation. Think of it as a Swiss Army Knife for wrangling spreadsheet-style data, combining a fluent programmatic API with a powerful SQL-like query engine.

Whether you're cleaning data from an API, preparing it for a charting library, or performing complex transformations, DataMaster provides the tools you need in a clear and predictable way.

## Key Features

- **Fluent, Chainable API:** Mutator methods return the instance, allowing you to chain operations logically and readably.
- **Intuitive Instantiation:** No more confusing constructors. Create a DataMaster instance explicitly from your data source with clear static methods like `DataMaster.fromRecordset()` and `DataMaster.fromCsv()`.
- **Powerful Query Engine:** Use the `.query()` method with a SQL-like syntax for complex SELECT, UPDATE, and DELETE operations.
- **Simple Programmatic Tools:** Use straightforward methods like `.search()`, `.pivot()`, and `.addColumn()` for common data shaping tasks.
- **Flexible I/O:** Easily load data from recordsets, arrays, and CSVs, and export to them just as easily with methods like `.toRecordset()` and `.toCsv()`.
- **Robust Error Handling:** A configurable error system lets you choose how to handle failures, from silent logging to strict exceptions.

## Quick Start

See the power and clarity of the new API in action. Let's take a raw dataset, clean it up, perform some analysis, and export a final report.

```javascript
// 1. Some raw data, perhaps from an API
const salesData = [
    { product: 'Widget A', region: 'North', sales: 150, status: 'archived' },
    { product: 'Widget B', region: 'South', sales: 250, status: 'active' },
    { product: 'Widget A', region: 'North', sales: 200, status: 'active' },
    { product: 'Widget C', region: 'West', sales: 300, status: 'active' },
    { product: 'Widget B', region: 'South', sales: 450, status: 'active' },
];

// 2. Instantiate from the recordset using a clear factory method
const dm = DataMaster.fromRecordset(salesData);

// 3. Chain operations to clean and shape the data
dm.query('delete', { where: "status = 'archived'" }) // Use query() to remove old data
  .sort('sales', true) // Sort by sales, descending
  .removeDuplicates(['product', 'region']); // Keep the highest sale for each product/region

// 4. Use .search() to get a new DataMaster instance with a subset of data
const southernRegion = dm.search({ region: 'South' });

// 5. Export the final data to a CSV string
const csvReport = southernRegion.toCsv({ includeHeaders: true });

console.log(csvReport);
/*
"product","region","sales","status"
"Widget B","South",450,"active"
"Widget B","South",250,"active"
*/
```

## Installation

### In Node.js

```bash
npm install jw-datamaster
```

```javascript
const DataMaster = require('jw-datamaster');
```

### In the Browser

Download the `datamaster.js` file from the latest release and include it in your HTML. The library will be available as `window.DataMaster`.

```html
<script src="path/to/datamaster.js"></script>
<script>
    // DataMaster is available globally
    const dm = DataMaster.fromRecordset(salesData);
    // ... your code here
</script>
```

## Documentation

- **[API Reference](docs/api-reference.md):** A detailed dictionary of every public class and method.
- **[Query Guide](docs/query-syntax.md):** A deep dive into the powerful `.query()` method and its syntax.
- **[Migration Guide](docs/migration-guide.md):** **REQUIRED READING** for upgrading from previous versions. This version introduces breaking changes.

## Migration Guide

**⚠️ IMPORTANT:** This version contains breaking changes and is not backward compatible with previous versions.

### Major Changes:
- Complete API redesign with new factory methods
- New instantiation patterns (no direct constructor access)
- Updated method signatures and return values
- Enhanced error handling system
- New query engine syntax

### Quick Migration Steps:
1. **Update package name:** Change `datamaster-lib` to `jw-datamaster` in package.json
2. **Update imports:** Use new factory methods like `DataMaster.fromRecordset()`
3. **Review method calls:** Many method signatures have changed
4. **Test thoroughly:** Due to extensive changes, comprehensive testing is recommended

For detailed migration instructions, see the [Migration Guide](docs/migration-guide.md).

## License

MIT License - see LICENSE file for details. 