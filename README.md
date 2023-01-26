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

## Creating the DataMaster ##  

You can supply a recordset, a table, text in CSV or TSV format,or an object in the DataMaster format.  

**Example 1, Recordset:**
``` Javascript
var data = [
    {'Name':'Alice','Age':23,'Happy':true},
    {'Name':'Bob','Age':43,'Happy':true},
    {'Name':'Cindy','Age':31,'Happy':false},
];
var myDM = new jwdm.DataMaster(data);
```

**Example 2, Table:**
``` Javascript
//You can supply fieldnames as the second option
//if you don't the fields will just be 1,2,3,4,etc
var data = [
    ['Alice',23,true],
    ['Bob',43,true]
    ['Cindy',31,false]
];
//Automatic fieldnames
var myDM_a = new jwdm.DataMaster(data);
//Supplied fieldnames
var myDM_b = new jwdm.DataMaster(data,['Name','Age','Happy']);

//First row is fieldnames
var data_b = [
    ['Name','Age','Happy'],
    ['Alice',23,true],
    ['Bob',43,true]
    ['Cindy',31,false]  
];

var myDM_c = new jwdm.DataMaster(data, true);

```

**Example 3, RecordTable:**
``` Javascript
//Alternative way of supplying a table and fieldnames seperately
//this can also be used when creating a new DataMaster from an existing one using the export function
var data = [
    ['Alice',23,true],
    ['Bob',43,true]
    ['Cindy',31,false]
];
var fieldNames = ['Name','Age','Happy'];

var dm = new jwdm.DataMaster({
    'fields': fieldNames,
    'data': data
});
```

**Example 4, CSV Data:**
``` Javascript
//passed CSV data is has the same options as passed table data
//so you can pass a fields table, or set fields to true, or pass nothing for auto-fieldnames
var data = `
Name,Age,Happy
Alice,23,true
Bob,43,true
Cindy,31,false
`

//create the table using first row as fieldnames
var dm = new jwdm.DataMaster(data, true);
```


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
    "fields": ["title","silly","value"],
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

   __params:__  
   * consoleMode {boolean}   
        * if false, will render for html output (default)

- ### print()  
    Same as debug()

- ### copy()

   Returns a copy of the data in RecordTable format.

- ### exportAs()

   Exports the data in various styles.  

   __params:__  
   * style {('table'|'recordset'|'recordtable'|'spreadsheet'|'csv')} - what format to export the data in
        * 'spreadsheet' uses the fields as the first row, 'csv' only exports the table itself, both are strings in csv format
    * options:
    ``` javascript
    {
        fields: [] //The column names or indexes to export and the order
        //NOTE: undefined = all columns in the existing order

        //CSV only options:
        startRow: 0 //The row to start export from,
        startCol: 0 //The column to start export from,
        newLineString='\r\n' //The string to use for newlines 

    }

    ```
- ### table()

   Returns a copy of the table data (no fieldnames).

- ### table()

   Returns a copy of the table data (no fieldnames).

- ### getColumn()

   Returns a column as an array.

    __params:__  
    * column {string|number} - The column name or index to return  
    * distinct {boolean} - no duplicates

- ### getRow()

    Returns a row as an array.  
    __params:__  
    * index {number} - the row index
    * style {('array'|'table'|'recordset'|'recordtable'|'object')} - the type of data to return, default=array  
    __ex:__  
    ``` javascript
    dm.getRow(0, 'array');
    //['foo', 'bar']
    dm.getRow(0, 'table');
    //[['foo', 'bar']]
    dm.getRow(0, 'recordset');
    /*
        [
            {col1: 'foo', col2: 'bar'}
        ]
    */
    dm.getRow(0, 'recordTable');
    /*
        {
            fields: ['col1', 'col2'],
            table: [['foo', 'bar']]
        }
    */
    dm.getRow(0, 'object');
    // {col1: 'foo', col2: 'bar'}
    ```
    __NOTE:__  'array' and 'object' are the most logical type of output


- ### sort()

    Sorts the data.  
    __params:__  
    * field {string|number} - The field to sort by, if null all fields will be sorted in order  
            * __NOTE:__ In theory all fields will sort in order, in practice this is not currently guaranteed 

- ### reorder()

   Reorders the columns. If you omit column names that will be stripped.  
   __params:__ 
   * fields {string[]|number[]} - The fields to keep and in what order  
   __ex:__  
   ```javascript
   /* given:
        {
            "fields": ["title","silly","value"],
            "table": [
                ["Thing one", false, 7],
                ["Foo Bar", true, 11],
                ["Another thing", false, 3.5]
            ]
        }
    */
    dm.reorder(['value','title']);
    /* The dm will be modified in place to be:
        {
            "fields": ["value","title"].
            "table": [
                [7, "Thing one"],
                [11, "Foo Bar"],
                [3.5, "Another thing]

            ]
        }
    */
    ```


- ### search()

    Searches the data. You can search the whole table or just a particular field. You can also get the results in a variety of formats from just an array of matching row indexes to a full RecordTable that only includes the row data from where matches were found. You may also pass a function that returns true for the results you want.  

    __params:__  
    ``` javascript
    /*
        {
            query: {string|number|function} //The value to search for,
            searchField: {string|number} //The field to search in, undefined for all,
            return: {string|number} //the field to return
            style: {('table'|'recordset'|'recordtable'|'index'|'array')} // default='index'

        }
    */
    ```
    __NOTE:__  
    * index will always return an array of the indices where the search was true
    * I'm not really sure how table/array differ but it appears this has to do with a scenario when a return field is specified and whether or not the resulting array is 1 or 2 dimensional. Submit a patch!


- ### replace()  

    Replaces cell values based on a query. 

    __params:__  
    * query {string|RegEx} - the value to search for
    * newValue {string|number} - the replacement value
    * fields {string[]|number[]} - the fields to search
            * can be an array or a single field name/number

    __ex:__
    ``` javascript
    /* given:
        {
            "fields": ["title","silly","value"],
            "table": [
                ["Thing one", false, 7],
                ["Foo Bar", true, 11],
                ["Another thing", false, 3.5]
            ]
        }
    */
    dm.replace('Foo Bar', 'fOO bAr!!!', 'title');
    /*
        {
            "fields": ["title","silly","value"],
            "table": [
                ["Thing one", false, 7],
                ["fOO bAr!!!", true, 11],
                ["Another thing", false, 3.5]
            ]
        }
    */


- ### limit()

   Same as the search() function but limits the datamaster based on the result instead of returning the results. i.e. an in-place version of search()

   __params:__  
   ```javascript
   /*
    {
        query: string //the value to search for,
        searchField: string|number //the field to search
    }

- ### setFieldNames()

    Change the existing field names.  
    __params:__  
    * fields {string[]} - the new field names
            * NOTE: if you pass fewer names then already exist in the recordtable the remaining ones wont be updated.

- ### modifyFieldNames()

   Change/reorder/limit the field names (the column names). This requires a "field-map" where you specify which fields are renamed to what values. You can set a flag to true that will also reorder and limit the fields based on your map. Doing this makes this function a combination of setFieldNames() and reorder() in a single call.

   __params:__  
   * fieldmap
   * reorder {boolean}
   __ex:__  

   ``` javascript
   /* given:
        {
            "fields": ["title","silly","value"],
            "table": [
                ["Thing one", false, 7],
                ["Foo Bar", true, 11],
                ["Another thing", false, 3.5]
            ]
        }
    */
    
     dm.modifyFieldNames(
         ['silly', 'serious'],
         ['title', 'phrase']
     ], true);
     /* result:
        {
            "fields": ["serious", "phrase"],
            "table": [
                [false, "Thing one"],
                [true, "Foo Bar"],
                [false, "Another thing"]
            ]
        }
     */
   ```

- ### addColumn()

    Add a new column at a particular location in the table. You can include the column data.  
    __params:__  
    * name {string} - the name of the new column/field
    * data {array} - the data to add (optional)
    * location {string|number} - index or field/column name to place the new column after
            * __NOTE:__ undefined will place the new column at the end  
    __ex:__
    ``` javascript
    /* given:
        {
            "fields": ["title","silly","value"],
            "table": [
                ["Thing one", false, 7],
                ["Foo Bar", true, 11],
                ["Another thing", false, 3.5]
            ]
        }
    */
    dm.addColumn('newCol', ['what?',"who?","when?"], 'silly');
    /* result:
        {
            "fields": ["title","silly","newCol","value"],
            "table": [
                ["Thing one", false, "what?", 7],
                ["Foo Bar", true, "who?", 11],
                ["Another thing", false, "when?", 3.5]
            ]
        }
    */
    ```

- ### removeColumn()

    Removes a column.  
    __params:__  
    * column {string|number} - the column/field to remove

- ### addRow()

    Add a row at a particular location. You can include the row data.  
    __params:__  
    * data - the new data to add
            *__NOTES:__  
                    * array will only add items up to the existing length, extras will be skipped
                    * for object, only matching field names will be added, the rest skipped or set to null
    * location - the index at which to place the new row, shifting existing rows 
            *__NOTES:__ 
                    * undefined: end of table
                    * <=0: beginning of table


- ### removeRow()

    Remove a row.  
    __params:__  
    * index {number} - the row to remove

- ### modifyCell()

    Modify the data of a particular cell.  
   __params:__  
    * row {number} - the row
    * column {string|number} - the column name/index
    * value {string|number} - the new value for the cell

- ### getCell()

    Get the value of a particular cell.  
    __params:__  
    * row {number} - the row
    * column {string|number} - the column name/index
    
- ### length()  

    get the length of the datamaster table (the number of rows)  

- ### sumColumns()

    Sum 1 or more columns, putting the results into a new row at the end.  
    __params:__  
    * label {string} - this will be the label for the column holding the row sums (optional)
    * columns {string[]|number[]} - the columns to sum. Undefined for all.
 
- ### sumRows()

    Sum 1 or more rows, putting the results into a new row at the end.

- ### formatColum()

    Format a column based on a user-supplied formatting function (in-place)
    __params:__  
    * label {string|number} - The column name or number to format
    * format {function} - The formatting function to apply

    ``` javascript
        //Makes the last name column all uppercase
        dm.formatColumn('LastName', function(value) {
            return value.toUpperCase();
        });
    ```

- ### formatRow()

    Format a row based on a user-supplied formatting function (in-place)
    __params:__  
    * row {number} - The row number to format
    * format {function} - The formatting function to apply

    ``` javascript
        //Makes the 3rd row all uppercase (rows are 0-indexed)
        dm.formatRow(2, function(value) {
            return value.toUpperCase();
        });
    ```

- ### pivot()

    Pivots the RecordTable so that rows become columns. Same as the "transpose" function in Excel. See: https://support.microsoft.com/en-us/office/transpose-rotate-data-from-rows-to-columns-or-vice-versa-3419f2e3-beab-4318-aae5-d0f862209744

- ### removeDuplicates()  

    Removes duplicate rows based on matching the supplied fields.
    __params:__  
    * fields {array|string|number} - a single field name or field index to match on or an array of field names/field indices.  

    ``` javascript
    /* given the data
    
        -|first|last |age|
        0|Alice|Smith|23 |
        1|Alice|Jones|34 |
        2|Alice|Jones|63 |
        3|Bob  |Smith|19 |

    */

    dm.removeDuplicates(); //no fields is all fields
    /* result

        -|first|last |age|
        0|Alice|Smith|23 |
        1|Alice|Jones|34 |
        2|Alice|Jones|63 |
        3|Bob  |Smith|19 |

        Since every row has some unique data there are no dupes

    */

    dm.removeDuplicates(['first','last']); 
    /* result
    
        -|first|last |age|
        0|Alice|Smith|23 |
        1|Alice|Jones|34 |
        2|Bob  |Smith|19 |

        The second "Alice Jones" is removed because it's considered a
        dupe even though the ages are different
    */

    dm.removeDuplicates(['last']); 
    /* result

        -|first|last |age|
        0|Alice|Smith|23 |
        1|Alice|Jones|34 |

        Since we're considering only the 'last' field the second
        'Jones' and second 'Smith' are both dupes.
    */
    ```





