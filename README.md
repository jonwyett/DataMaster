# DataMaster
Class for managing database-style data within JS

## Types of things you can do
- sort the data
- search the data
- modify cells
- add/remove rows/columns
- retrieve an individual column or row
- convert between various data styles (see below)
- convert to csv
- import from csv (Excel with Windows formatting only)
- reorder, rename and limit the columns
- sum rows/columns
- pivot the data, rows become columns

## Example scenario:

1) Import data from a mySQL server in JSON format
2) Search/limit the data to have only rows that contain clientID=123
3) Search/update the data, changing the cells that contain the value "special_order" to say "Special Order" instead
3) Reorder/limit/rename the data to only include the columns that are needed and to have human friendly field names ("clientName" --> "Client Name"), don't include the "clientID" column.
4) Sort the data by the "date" column
5) Sum the cost column to show the total
6) Add the value "Total" next to the summed column
6) Export the data to a CSV file

``` Javascript
//create the original DataMaster from the mySql JSON data
var myDM = new jwdm.DataMaster(sqlData);

// Limit the data in the datamaster based on a search
myDM.limit({
    query: 123,
    searchField: 'clientID'
}));

//replace cell values
myDm.replace({
    query: 'special_order', //search for this text
    newValue: 'Special Order', //replace with this text
    searchField: 'orderType', //in this column only    
});

//Or do it manually
myDM.search({
    query: 'special_order', //search for this text
    searchField: 'orderType', //in this column
    style: 'index' //return an array of the row indexes that match
}).forEach(function(index) { //loop over the array 
    myDM.modifyCell(index, 'orderType', 'Special Order'); //modify the cell
});

//Or do the same thing with the 

//reorder, limit and rename the columns
myDM.modifyFieldNames([
    ['date', 'Date'],
    ['clientName', 'Client Name'],
    ['orderType', 'Order Type']
    ['cost', 'Cost']
], true);

//sort the columns
myDM.sort('Date');

//sum the columns
myDM.sumColumns(null, ['Cost']); //this sums only the 'Cost' column

//add the text 'Total' next to the sum of the 'Cost' column
myDM..modifyCell(myDM.length()-1, 'orderType', 'Total');

//export to a CSV file
var csv = myDM.exportAs('csv');

```


## Data Styles
This class uses the following data styles and naming conventions:

1. Recordset
``` Javascript
var recordset = [
    {"title":"Thing one", "silly":false, "value":7},
    {"title":"Foo Bar", "silly":true, "value":11},
    {"title":"Another one", "silly":false, "value":3.5},
]
```

2. Table
``` Javascript
var table = [
    ["Thing one", false, 7],
    ["Foo Bar", true, 11],
    ["Another thing", false, 3.5]
]
```

3. RecordTable
``` Javascript
var recordTable = {
    "fields": ["title","silly","value":7],
    "table": [
        ["Thing one", false, 7],
        ["Foo Bar", true, 11],
        ["Another thing", false, 3.5]
    ]
}
```

## List of Functions:
- ### debug()

   Spits out a textual representation of the data in either a console or html style. 

- ### copy()

   Returns a copy of the data in RecordTable format.

- ### exportAs()

   Exports the data in various styles.

- ### length()

   Returns the length of the table.

- ### table()

   Returns a copy of the table data (no fieldnames).

- ### fields()

   Returns an array of fieldnames.

- ### getColumn()

   Returns a column as an array.

- ### getRow()

    Returns a row as an array.

- ### sort()

    Sorts the data.

- ### reorder()

   Reorders the columns. If you omit column names that will be stripped.

- ### search()

    Searches the data. You can search the whole table or just a particular field. You can also get the results in a variety of formats from just an array of matching row indexes to a full RecordTable that only includes the row data from where matches were found. You may also pass a function that returns true for the results you want.

- ### replace()  

    Replaces cell values based on a query. This is just a convenience wrapper for search() and modifyCellValues()

- ### limit()

   Same as the search() function but limits the datamaster based on the result instead of returning the results.

- ### setFieldNames()

    Change the existing field names.

- ### modifyFieldNames()

   Change/reorder/limit the field names (the column names). This requires a "field-map" where you specify which fields are renamed to what values. You can set a flag to true that will also reorder and limit the fields based on your map. Doing this makes this function a combination of setFieldNames() and reorder() in a single call.

- ### addColumn()

    Add a new column at a particular location in the table. You can include the column data.

- ### removeColumn()

    Removes a column.

- ### addRow()

    Add a row at a particular location. You can include the row data.

- ### removeRow()

    Remove a row.

- ### modifyCel()

    Modify the data of a particular cell.

- ### getCell()

    Get the value of a particular cell.

- ### sumColumns()

    Sum 1 or more columns, putting the results into a new column at the end.

- ### sumRows()

    Sum 1 or more rows, putting the results into a new row at the end.

- ### pivot()

    Pivots the RecordTable so that rows become columns.






