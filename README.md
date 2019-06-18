# DataMaster
Class for managing recordset-style data within JS

## Types of things you can do
*sort the data
*search the data
*modify cells
*add/remove rows/columns
*retrive an individual column or row
*convert between various data styles (see below)
*convert to csv
*reorder, rename and limit the columns
*sum rows/columns
*pivot the data, rows become columns

## Data Styles
This class uses the following data styles:

### Recordset
```
var recordset = [
    {"title":"Thing one", "silly":false, "value":7},
    {"title":"Foo Bar", "silly":true, "value":11},
    {"title":"Another one", "silly":false, "value":3.5},
]
```

### Table
```
var table = [
    ["Thing one", false, 7],
    ["Foo Bar", true, 11],
    ["Another thing", false, 3.5]
]
```

### RecordTable
```
var recordTable = {
    "fields": ["title","silly","value":7],
    "table": [
        ["Thing one", false, 7],
        ["Foo Bar", true, 11],
        ["Another thing", false, 3.5]
    ]
}
```
