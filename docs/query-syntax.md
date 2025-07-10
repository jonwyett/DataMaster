# DataMaster Query Language Reference

The DataMaster Query Language (DQL) provides a powerful SQL-like interface for data manipulation within JavaScript applications. This reference covers both the API specifications and practical usage patterns.

## Quick Start

```javascript
// Basic selection
dm.query('select', { where: "age > '25'" })

// Update with conditions
dm.query('update', { set: { status: 'active' }, where: "role = 'user'" })

// Delete with filtering
dm.query('delete', { where: "last_login < '2023-01-01'" })
```

## Core Concepts

### The Query Method
All DQL operations use the `.query()` method with two parameters:

```javascript
datamaster.query(verb, options)
```

- **verb**: The operation type (`'select'`, `'update'`, or `'delete'`)
- **options**: Configuration object containing clauses and parameters

### Data Flow
- **select**: Returns a new DataMaster instance (immutable)
- **update/delete**: Modifies the current instance and returns `this` (mutable, chainable)

---

## SELECT: Retrieving Data

### Basic Syntax
```javascript
dm.query('select', {
    fields: string | array | "*",      // Optional, defaults to "*"
    where: string | object | function, // Optional filter
    orderBy: string,                   // Optional sorting
    limit: number,                     // Optional row limit
    offset: number,                    // Optional row offset
    queryFunctions: object             // Optional custom functions
})
```

### Field Selection

**All fields (default):**
```javascript
dm.query('select', { where: "status = 'active'" })
```

**Specific fields as string:**
```javascript
dm.query('select', { 
    fields: "name, email, age",
    where: "department = 'engineering'" 
})
```

**Specific fields as array (controls column order):**
```javascript
dm.query('select', { 
    fields: ["id", "name", "created_at"],
    where: "role = 'admin'" 
})
```

### Sorting Results

**Single field:**
```javascript
dm.query('select', { 
    orderBy: "age DESC",
    where: "city = 'New York'" 
})
```

**Multiple fields:**
```javascript
dm.query('select', { 
    orderBy: "department ASC, salary DESC",
    where: "status = 'active'" 
})
```

### Pagination (Limit and Offset)

Control the number of results returned and implement pagination using `limit` and `offset`.

**Basic limit (first N records):**
```javascript
// Get first 10 employees
dm.query('select', { 
    limit: 10,
    orderBy: "hire_date ASC" 
})
```

**Skip records with offset:**
```javascript
// Skip first 20 records, get all remaining
dm.query('select', { 
    offset: 20,
    orderBy: "id ASC" 
})
```

**Pagination (limit + offset):**
```javascript
// Page 3 with 10 records per page (skip first 20, get next 10)
dm.query('select', { 
    offset: 20,
    limit: 10,
    orderBy: "created_at DESC" 
})

// Generic pagination formula
const page = 2; // 0-based page number  
const pageSize = 25;
dm.query('select', {
    offset: page * pageSize,
    limit: pageSize,
    orderBy: "id ASC"
})
```

**Combined with filtering:**
```javascript
// Get second page of active users
dm.query('select', {
    where: "status = 'active'",
    orderBy: "last_login DESC",
    offset: 50,
    limit: 25
})
```

**⚠️ Important Notes:**
- Both `limit` and `offset` must be non-negative integers
- `offset` defaults to 0 if not specified
- Pagination is applied after WHERE filtering and ORDER BY sorting
- An `offset` beyond the dataset returns an empty result

### Complete Example
```javascript
const employees = DataMaster.fromRecordset([
    { id: 1, name: 'Alice Johnson', dept: 'Engineering', salary: 85000, hire_date: '2022-03-15' },
    { id: 2, name: 'Bob Smith', dept: 'Marketing', salary: 65000, hire_date: '2021-07-20' },
    { id: 3, name: 'Carol Davis', dept: 'Engineering', salary: 92000, hire_date: '2020-01-10' }
]);

// Get engineering team sorted by salary
const engineeringTeam = employees.query('select', {
    fields: "name, salary",
    where: "dept = 'Engineering'",
    orderBy: "salary DESC"
});
// Result: [['Carol Davis', 92000], ['Alice Johnson', 85000]]

// Get first page of employees (2 per page)
const firstPage = employees.query('select', {
    fields: "name, dept, salary",
    orderBy: "hire_date ASC",
    limit: 2
});
// Result: [['Carol Davis', 'Engineering', 92000], ['Bob Smith', 'Marketing', 65000]]

// Get second page
const secondPage = employees.query('select', {
    fields: "name, dept, salary", 
    orderBy: "hire_date ASC",
    offset: 2,
    limit: 2
});
// Result: [['Alice Johnson', 'Engineering', 85000]]
```

---

## UPDATE: Modifying Data

### Basic Syntax
```javascript
dm.query('update', {
    set: object,                       // Required: fields to update
    where: string | object | function, // Required: filter criteria
    queryFunctions: object             // Optional custom functions
})
```

### Simple Updates
```javascript
// Give all engineers a 5% raise
dm.query('update', {
    set: { salary: 89250 },
    where: "name = 'Alice Johnson'"
});

// Update multiple fields
dm.query('update', {
    set: { status: 'senior', level: 'L5' },
    where: "years_experience >= '5'"
});
```

### Conditional Updates
```javascript
// Update based on complex conditions
dm.query('update', {
    set: { bonus_eligible: true },
    where: "(dept = 'Sales' AND performance = 'excellent') OR (dept = 'Engineering' AND projects_completed > '3')"
});
```

### Chaining Updates
```javascript
// Multiple updates in sequence
dm.query('update', { set: { reviewed: true }, where: "hire_date < '2023-01-01'" })
  .query('update', { set: { status: 'probation' }, where: "performance = 'poor'" })
  .query('select', { where: "status = 'active'" });
```

---

## DELETE: Removing Data

### Basic Syntax
```javascript
dm.query('delete', {
    where: string | object | function, // Required: filter criteria
    queryFunctions: object             // Optional custom functions
})
```

### Simple Deletion
```javascript
// Remove inactive users
dm.query('delete', { where: "status = 'inactive'" });

// Remove old records
dm.query('delete', { where: "created_at < '2022-01-01'" });
```

### Conditional Deletion
```javascript
// Remove users who haven't logged in for 6 months and aren't premium
dm.query('delete', { 
    where: "last_login < '2023-01-01' AND subscription_type != 'premium'" 
});
```

---

## WHERE Clause Language

The WHERE clause is a powerful string-based query language that forms the heart of DQL.

### Basic Conditions

**Syntax:** `field OPERATOR 'value'`

```javascript
// Comparison operators
"age > '25'"           // Greater than
"age >= '25'"          // Greater than or equal
"age < '65'"           // Less than
"age <= '65'"          // Less than or equal
"status = 'active'"    // Equals
"status != 'inactive'" // Not equals
```

**⚠️ Important:** Values must always be quoted, even numbers. The parser converts quoted numbers automatically for numeric comparisons.

### Logical Operators

**Combine conditions with AND/OR:**
```javascript
// AND - both conditions must be true
"age >= '25' AND department = 'engineering'"

// OR - either condition can be true
"role = 'admin' OR role = 'manager'"

// Mixed logic with parentheses
"(role = 'admin' OR role = 'manager') AND status = 'active'"
```

**⚠️ Important:** Logical operators must be UPPERCASE and space-separated.

### Pattern Matching with Wildcards

**Use `%` and `_` for flexible string matching:**
```javascript
// % matches zero or more characters
"name = 'John%'"      // Names starting with "John"
"name = '%son'"       // Names ending with "son"  
"name = '%smith%'"    // Names containing "smith"

// _ matches exactly one character
"code = 'A_1'"        // Matches "A01", "A11", "AB1", etc.
"phone = '555-___-____'" // Matches any 555 number
```

### Global Field Search

**Search across all fields using `*`:**
```javascript
// Find records containing "urgent" in any field
"priority = 'high' OR * = 'urgent'"

// Find records with specific ID or containing "admin"
"id = '123' OR * = 'admin'"
```

**⚠️ Limitations:** 
- Cannot be the first condition
- Only works with `=` and `!=`

### Complex Logic Examples

```javascript
// Multi-level conditions
"((dept = 'Sales' OR dept = 'Marketing') AND quota_met = 'true') OR (dept = 'Engineering' AND projects > '5')"

// Date ranges with wildcards
"hire_date = '2023-%' AND status = 'active'"

// Exclusion patterns
"email != '%@contractor.com' AND role != 'temp'"
```

---

## Custom Functions (queryFunctions)

Extend DQL with custom logic using the `@` function syntax. DataMaster doesn't include any built-in functions - you define them all yourself based on your needs.

### Function Definition Structure

```javascript
const myQueryFunctions = {
    functionName: (options) => {
        // options.value  - the cell value being tested
        // options.field  - the field name
        // options.params - array of parameters from the query
        // options.row    - the complete row object
        return boolean; // true if condition matches
    }
};
```

### Common Function Patterns

These are popular patterns that users often implement to simulate familiar SQL functionality:

**IN-style function (membership testing):**
```javascript
const queryFunctions = {
    in: (options) => {
        return options.params.some(p => p == options.value);
    }
};

// Usage
dm.query('select', {
    where: "status = '@in(\"active\", \"pending\", \"review\")'",
    queryFunctions
});

// With numbers
dm.query('select', {
    where: "priority = '@in(1, 2, 3)'",
    queryFunctions
});
```

**BETWEEN-style function (range testing):**
```javascript
const queryFunctions = {
    between: (options) => {
        const [min, max] = options.params;
        return options.value >= min && options.value <= max;
    }
};

// Usage
dm.query('select', {
    where: "age = '@between(25, 65)'",
    queryFunctions
});

// Date ranges
dm.query('select', {
    where: "hire_date = '@between(\"2022-01-01\", \"2023-12-31\")'",
    queryFunctions
});
```

### Advanced Multi-Field Functions

**Cross-field validation:**
```javascript
const queryFunctions = {
    salaryMatchesLevel: (options) => {
        const { row } = options;
        const levelSalaries = {
            'L1': [40000, 60000],
            'L2': [55000, 75000],
            'L3': [70000, 95000]
        };
        
        const range = levelSalaries[row.level];
        return range && row.salary >= range[0] && row.salary <= range[1];
    }
};

// Find employees whose salary matches their level
dm.query('select', {
    where: "id = '@salaryMatchesLevel()'", // field is just a trigger
    queryFunctions
});
```

**Pattern matching across fields:**
```javascript
const queryFunctions = {
    emailMatchesDomain: (options) => {
        const { row } = options;
        const companyDomains = {
            'Engineering': 'tech.company.com',
            'Sales': 'sales.company.com',
            'Marketing': 'marketing.company.com'
        };
        
        const expectedDomain = companyDomains[row.department];
        return expectedDomain && row.email.endsWith(`@${expectedDomain}`);
    }
};

// Find employees with correct email domains for their department
dm.query('select', {
    where: "id = '@emailMatchesDomain()'",
    queryFunctions
});
```

### Function Usage Patterns

**Parameter passing:**
```javascript
// String parameters need inner quotes
"field = '@myFunction(\"param1\", \"param2\")'"

// Numbers don't need quotes
"field = '@myFunction(1, 2, 3)'"

// Mixed parameters
"field = '@myFunction(\"text\", 42, \"more text\")'"
```

**No parameters needed:**
```javascript
"field = '@myFunction()'"
```

---

## Practical Examples

### User Management System

```javascript
const users = DataMaster.fromRecordset([
    { id: 1, username: 'alice', email: 'alice@company.com', role: 'admin', last_login: '2024-01-15', status: 'active' },
    { id: 2, username: 'bob', email: 'bob@company.com', role: 'user', last_login: '2023-12-20', status: 'active' },
    { id: 3, username: 'carol', email: 'carol@contractor.com', role: 'user', last_login: '2023-11-10', status: 'inactive' }
]);

// Get active admins
const activeAdmins = users.query('select', {
    where: "role = 'admin' AND status = 'active'"
});

// Get users in batches of 10 for processing
const batch1 = users.query('select', {
    where: "status = 'active'",
    orderBy: "last_login DESC",
    limit: 10
});

const batch2 = users.query('select', {
    where: "status = 'active'", 
    orderBy: "last_login DESC",
    offset: 10,
    limit: 10
});

// Deactivate users who haven't logged in since 2024
users.query('update', {
    set: { status: 'inactive' },
    where: "last_login < '2024-01-01'"
});

// Remove contractor accounts
users.query('delete', {
    where: "email = '%@contractor.com'"
});
```

### Sales Analytics

```javascript
const sales = DataMaster.fromRecordset([
    { rep: 'John', region: 'North', quarter: 'Q1', amount: 50000, deals: 12 },
    { rep: 'Jane', region: 'South', quarter: 'Q1', amount: 75000, deals: 8 },
    { rep: 'Mike', region: 'North', quarter: 'Q2', amount: 60000, deals: 15 }
]);

const queryFunctions = {
    topPerformer: (options) => {
        const { row } = options;
        const efficiency = row.amount / row.deals;
        return efficiency > 5000; // $5k+ per deal
    }
};

// Find top performers (first 5 only)
const topReps = sales.query('select', {
    fields: "rep, region, amount, deals",
    where: "id = '@topPerformer()'",
    orderBy: "amount DESC",
    limit: 5,
    queryFunctions
});

// Update bonus eligibility for high performers
sales.query('update', {
    set: { bonus_eligible: true },
    where: "amount > '60000' AND deals >= '10'"
});
```

### Inventory Management

```javascript
const inventory = DataMaster.fromRecordset([
    { sku: 'WIDGET-001', category: 'electronics', stock: 5, reorder_point: 10, price: 29.99 },
    { sku: 'GADGET-002', category: 'electronics', stock: 25, reorder_point: 15, price: 49.99 },
    { sku: 'TOOL-003', category: 'hardware', stock: 2, reorder_point: 8, price: 19.99 }
]);

const queryFunctions = {
    needsReorder: (options) => {
        const { row } = options;
        return row.stock <= row.reorder_point;
    },
    
    highValue: (options) => {
        const { row } = options;
        return (row.stock * row.price) > 500;
    }
};

// Find items needing reorder
const reorderList = inventory.query('select', {
    fields: "sku, category, stock, reorder_point",
    where: "sku = '@needsReorder()'",
    orderBy: "category ASC, sku ASC",
    queryFunctions
});

// Mark high-value items for special handling
inventory.query('update', {
    set: { special_handling: true },
    where: "sku = '@highValue()'",
    queryFunctions
});
```

---

## Best Practices

### Performance Tips
- Use specific field conditions before broad searches
- Limit wildcard usage in large datasets
- Consider field order in complex WHERE clauses

### Safety Guidelines
- Always test WHERE clauses with SELECT before UPDATE/DELETE
- Use parentheses to make complex logic explicit
- Validate custom function logic thoroughly

### Code Organization
- Group related queryFunctions in logical modules
- Use descriptive function names
- Document complex custom functions

### Example: Safe Data Modification
```javascript
// Always test your conditions first
const testResults = dm.query('select', { 
    where: "status = 'pending' AND created_at < '2023-01-01'" 
});
console.log(`Will affect ${testResults.length} records`);

// Then perform the actual update
if (testResults.length > 0 && testResults.length < 1000) {
    dm.query('update', {
        set: { status: 'expired' },
        where: "status = 'pending' AND created_at < '2023-01-01'"
    });
}
```

---

## API Reference Summary

### query(verb, options)

**SELECT Options:**
- `fields`: `string | array | "*"` - Columns to include
- `where`: `string | object | function` - Filter criteria
- `orderBy`: `string` - Sort specification
- `limit`: `number` - Maximum number of rows to return
- `offset`: `number` - Number of rows to skip from the beginning
- `queryFunctions`: `object` - Custom functions

**UPDATE Options:**
- `set`: `object` - Fields to update (required)
- `where`: `string | object | function` - Filter criteria (required)
- `queryFunctions`: `object` - Custom functions

**DELETE Options:**
- `where`: `string | object | function` - Filter criteria (required)
- `queryFunctions`: `object` - Custom functions

**WHERE Clause Operators:**
- Comparison: `=`, `!=`, `>`, `<`, `>=`, `<=`
- Logical: `AND`, `OR` (must be uppercase)
- Wildcards: `%` (zero or more), `_` (exactly one)
- Global: `*` (all fields, with restrictions)
- Functions: `@functionName(params)`

**Custom Function Context:**
```javascript
function(options) {
    // options.value  - cell value
    // options.field  - field name  
    // options.params - function parameters
    // options.row    - complete row object
    return boolean;
}
```