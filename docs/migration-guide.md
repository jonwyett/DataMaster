# Migration Guide: Upgrading to DataMaster v5

Welcome to the new version of DataMaster! We're excited to introduce a completely redesigned API that is more powerful, predictable, and easier to use.

This new version represents a major breaking change. We've redesigned the library from the ground up based on feedback and best practices to create a more intuitive developer experience. This guide will walk you through the most common changes to help you upgrade your code smoothly.

## The Philosophy Behind the Change

The goal of this redesign was to solve a core problem: the old API was often "magical" and ambiguous. The new API is built on a simple, clear principle called the **Mutability Contract**:

- **Mutator Methods** change the DataMaster object in-place and always return `this` so you can chain them (e.g., `.sort()`, `.limit()`, `.addColumn()`)
- **Accessor/Selector Methods** leave the object untouched and always return a new value like a new DataMaster instance, an array, or a string (e.g., `.search()`, `.where()`, `.toCsv()`)

This makes the behavior of every method completely predictable.

## Key Conversion Recipes

Here are the most common "before and after" patterns for upgrading your code.

### 1. Instantiation: From a "Magic" Constructor to Clear Factories

The single, overloaded `new DataMaster(...)` constructor has been replaced by explicit static factory methods. This makes your code self-documenting.

| Old Way (v4) | New Way (v5) |
|--------------|--------------|
| `new DataMaster(recordset)` | `DataMaster.fromRecordset(recordset)` |
| `new DataMaster(table, ['f1', 'f2'])` | `DataMaster.fromTable(table, { headers: ['f1', 'f2'] })` |
| `new DataMaster(table, true)` | `DataMaster.fromTable(table, { headersInFirstRow: true })` |
| `new DataMaster(csvString, true)` | `DataMaster.fromCsv(csvString, { headersInFirstRow: true })` |

### 2. Searching Data: A Clear Separation of Powers

The old, overloaded `.search()` method has been split into distinct tools for simple programmatic searches and powerful query-based searches.

| Old Way (v4) | New Way (v5) |
|--------------|--------------|
| `dm.search({ query: 'active', searchField: 'status' })` | `dm.search({ status: 'active' })` |
| `dm.search({ query: fn })` | `dm.search(fn)` |
| `dm.search({ query: "...", advanced: true })` | `dm.where("status = 'active' AND ...")` |
| `dm.search({ style: 'index' })` | `dm.getIndices({ status: 'active' })` or `dm.getIndicesWhere("...")` |

**Key Change:** `.search()` and `.where()` now always return a new DataMaster instance. To get just the row indices, use the new, explicit `.getIndices()` or `.getIndicesWhere()` methods.

### 3. Limiting Data (In-Place Filtering)

The `.limit()` method now mirrors the new search methods, accepting a simple object, a function, or a query string.

| Old Way (v4) | New Way (v5) |
|--------------|--------------|
| `dm.limit({ query: 'active', searchField: 'status' })` | `dm.limit({ status: 'active' })` |
| `dm.limit({ query: "...", advanced: true })` | `dm.limitWhere("status = 'active' AND ...")` |

### 4. Exporting Data: From exportAs to toXXX

The `exportAs('style', ...)` method has been replaced by a suite of pure, single-purpose serialization methods. Any data shaping (like selecting columns) must now be done before exporting.

| Old Way (v4) | New Way (v5) |
|--------------|--------------|
| `dm.exportAs('recordset')` | `dm.toRecordset()` |
| `dm.exportAs('table')` | `dm.toTable()` |
| `dm.exportAs('csv')` | `dm.toCsv()` |
| `dm.exportAs('recordset', { fields: ['Name', 'Age'] })` | `dm.query("SELECT Name, Age").toRecordset()` |

### 5. The Query Engine: From DataQuery to .query()

The separate DataQuery class has been fully integrated into DataMaster as the powerful `.query()` method.

| Old Way (v4) | New Way (v5) |
|--------------|--------------|
| `new DataQuery(data).query({ where: "..." })` | `DataMaster.fromRecordset(data).query('select', { where: "..." })` |
| `new DataQuery(data).delete({ where: "..." })` | `DataMaster.fromRecordset(data).query('delete', { where: "..." })` |
| `new DataQuery(data).update({ set: "...", where: "..." })` | `DataMaster.fromRecordset(data).query('update', { set: {...}, where: "..." })` |

**Key Change:** The `.query()` method now takes the verb (`'select'`, `'delete'`, `'update'`) as its first argument, and an options object as its second. This is more explicit and robust than the old "magic" property system.

## Conclusion

We believe these changes, while significant, will lead to cleaner, more readable, and more maintainable code for everyone using the library. If you have any questions, please open an issue on our GitHub repository. Thank you for upgrading!