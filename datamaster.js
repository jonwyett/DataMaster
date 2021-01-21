// ver 2.1.0 2021-01-21
 
 /**
 * Creates a DataMaster object
 * 
 * @param {(object|string)} data - Recordtable, Recordset, Table, CSV, TSV
 * @param {(string[]|boolean)} [fields] - Array of fieldnames or true to use the first row as fieldnames
 * @param {object} [options] - Various advanced options
 * @param {boolean} [options.isTSV] - Tab Separated Values are being provided as the data
 * @param {boolean} [options.noCR] - Newlines are \n only, not \r\n
 * @example
 *  var data = [
 *      ['col1','col2','col3'],
 *      ['a','b','c'],
 *      [1,2,3]
 *  ];  
 *  var myData = new DataMaster(data,true);
 */
var DataMaster = function(data, fields, options) {
    //A recordtable is a data structure consisting of data in a "table" (an array of arrays: [[]])
    //and a field listing as an array. Essentially it's a compressed recordset.
    //It is meant to simplify working with data output from a database, so it assumes that all rows
    //have the same number of columns.
    //Here is a comparison of "table", "recordset" and "recordtable" data styles:
    /* 
        table = [
            [1, 'Anna', true],
            [2, 'Bob', true],
            [3, 'Cindy', false]
        ]
        recordset = [
            {id:1, Name:'Anna', Alive:true},
            {id:2, Name:'Bob', Alive:true},
            {id:3, Name:'Cindy', Alive:false}
        ]
        recordtable = {
            fields: ['id', 'Name', 'Alive']
            data: [
                [1, 'Anna', true],
                [2, 'Bob', true],
                [3, 'Cindy', false]
            ]
        }
    */

    //Params:
    /*
        data: excepts either a table, recordset or recordtable
        fields: (array), the names of the fields.
            Will overwrite any exiting field names if data is a recordset
    */

    //Create the recordtable structure
    var _self = this;
    var _table = [];
    var _fields = [];
    this.valid = true; //this will be set to false if invalid data is passed in the constructor
    if (typeof options === 'undefined') { options = {}; }

    (function startup() {
        //determine if a table or recordset was passed
        try {
            //check for a recordtable
            if (Array.isArray(data.table) && Array.isArray(data.fields)) {
                _table = copy(data.table);
                _fields = copy(data.fields);
            } else {
                //check if the first element in the data param is an array (if so assume a table was passed)
                if (Array.isArray(data[0])) {
                    _table = copy(data); //make a copy of the data
                    createFields(); //create default fields
                    if (Array.isArray(fields)) { createFields(fields); } //create the fields based on the passed fieldnames
                    else if (fields === true) { //when set explicitly to true, the first row is treated as the fieldnames
                        createFields(_table[0]); //use the first row as the field names
                        _table.splice(0, 1); //remove the first row since it's actually the field names
                    }
                } else if (typeof data === 'string') {
                    _table = csvToTable(data, options.isTSV, options.noLF);
                    createFields(); //create default fields
                    if (Array.isArray(fields)) { createFields(fields); } //create the fields based on the passed fieldnames
                    else if (fields === true) { //when set explicitly to true, the first row is treated as the fieldnames
                        createFields(_table[0]); //use the first row as the field names
                        _table.splice(0, 1); //remove the first row since it's actually the field names
                    }
                } else { //since the first row is not an array or string,  assume a valid recordset
                    
                    var rTable = recordsetToRecordTable(data); //create a recordtable from the data
                    _table = rTable.table; //set the _table to the table part (will not be a reference to the original data)
                    createFields(); //create default fields
                    createFields(rTable.fields); //create the fields based on the fields part
                    if (fields) { createFields(fields); } //overwrite recordset fields with potentially provided fields.
                }
            }
        } catch (e) {
            this.valid = false;
        }
    })();

    /******* INTERNAL FUNCTIONS **********************************************************/

    function csvToTable(csv, isTSV, noCR) {
        //create the recordtable
        var table = [];
    
        var sep = ','; //the separator char
        if (isTSV) { sep = '\t'; }
        var cr = '\r\n'; //the carriage return char

        //LF (Newline. \n) only, no Carriage return (CR, \r)
        //this is what will be passed from an html text field
        //or from a multi-line string in javascript

        if (noCR) { cr = '\n'; }
        
        var cell = ''; //the cell buffer
        var row = []; //the row buffer
        var started = false; //have we started reading a cell yet
        var protectedMode = false; //is the cell surrounded by quotes.
        var cursor = 0; //loop var
    
        function isChar(str) {
            //this is just a helper function to make the following loop cleaner
            //char is the string you want to test against, it's meant to allow for testing
            //of multiple char strings that should be treated as a single char
            //it will use the previously declared csv and cursor vars and auto-advance
            //the cursor by the length your testing against if the match is found
            
            var test = '';
            var l = str.length;
            //for each char in the str, create a corresponding test string from the csv
            for (var i=0; i<l; i++) { test += csv[cursor+i]; }
    
            if (str === test) {
                cursor += l;
                return true;
            } else {
                return false;
            }
        }
    
        while (cursor<csv.length) {
            //we are going to reset all the vars on state change just to be safe
            if (started) { //we've entered the started state
                if (protectedMode) { //we're in protected mode
                    if (isChar('\"' + sep)) { 
                        row.push(cell);
                        cell = '';
                        started = false;
                        protectedMode = false;
                    } else if (isChar('"' + cr)) {
                        row.push(cell);
                        cell = '';
                        table.push(row);
                        row = [];
                        started = false;
                        protectedMode = false;
                    } else if (isChar('\"\"')) { //double quotes read as single quotes
                       cell += '"';
                    } else { //we found a general cell char
                        cell += csv[cursor];
                        cursor++;
                    }
                } else { //not protected mode
                    if (isChar(sep)) { //found a separator
                        row.push(cell);
                        cell = '';
                        started = false;
                        protectedMode = false;
                    } else if (isChar(cr)) { //found a carriage return
                        row.push(cell);
                        cell = '';
                        table.push(row);
                        row = [];
                        started = false;
                        protectedMode = false;
                    } else if (isChar('""')) { //double quotes read as single quotes
                        cell += '"';
                    } else {
                        cell += csv[cursor];
                        cursor++;
                    }
                }
            } else { //we are not yet reading a cell
                //remember that if isChar returns true it auto-increments the cursor
                if (isChar('"')) {//first check for a quote to see if we are in protected mode.
                    protectedMode = true;
                    started = true;
                } else if (isChar(sep)) { //we found a separator char
                    row.push(cell);
                    cell = '';
                    started = false;
                    protectedMode = false;
                } else if (isChar(cr)) { //we found a carriage return
                    table.push(row);
                    row = [];
                    cell = '';
                    started = false;
                    protectedMode = false;    
                } else { //we've found something else, so start the cell
                    cell = csv[cursor];
                    started = true;
                    protectedMode = false;  
                    cursor++; 
                }
            }
        } 
    
        return table;
    }
    
    function sortBy(field, desc, primer) {
        
        var key = primer ? 
                function(x) { return primer(x[field]); } : 
                function(x) { return x[field]; };
        
        desc = !desc ? 1 : -1;
        
        return function (a, b) {
            // @ts-ignore
            return a = key(a), b = key(b), desc * ((a > b) - (b > a));
        }; 
    }

    function copy(data) {
        return JSON.parse(JSON.stringify(data));
    }

    function findFieldIndex(fields, field) {
        if (typeof field === 'number') {
            if (field <fields.length) {
                return field;
            } else {
                return false;
            }
        } else {
            for (var f=0; f<_fields.length; f++) {
                if (fields[f] === field) { //hard check
                    return f;
                }
            }
        }
        //it wasn't found
        return false;
    }

    function createFields(fields) {
        //creates fieldnames based on the passed fields
        //if fields is undefined then creates an array of indexes: [0,1,2,3...]
        //running this twice, once with no fields and then again with fields will allow
        //passing a shorter list of fields then there are columns but still have a value 
        //for each column
        if (typeof fields === 'undefined') {
            //reset the internal fields array
            _fields = [];
            for (var i=0; i<_table[0].length; i++) {
                _fields.push(i.toString());
            }    
        } else {
            var max = (_fields.length < fields.length) ? _fields.length : fields.length; //get the shorter of the two
            for (var f=0; f<max; f++) {
                _fields[f] = fields[f];
            }
        }
    }

    function recordsetToRecordTable(data) {
        //converts recordset style data into a recordtable
        /* Params:
            -data: a recordset to convert
        */
        var table = [];
        var rowData = [];
        var keys = [];
        for (var row=0; row<data.length; row++) {
            //initialize the row
            rowData = [];
            //initialize the keys
            keys = Object.keys(data[row]);
            for (var col=0; col<keys.length; col++) {
                rowData.push(data[row][keys[col]]); //fill the row
            }
            table.push(rowData); //add the row to the table
        }
        
        return {
            table: table,
            fields: keys
        };
    }

    function reorderData(table, fields, order) {
        //returns data in the order of the provided fields. 
        //fields that are not provided will not be returned
        /* Params:
            -table: the table data to be reordered
            -fields: the field names for the table
            -order: the fields/indexes to be returned
        */
        var res = {
            table: [],
            fields: []
        };
        try {
            //first get the fields as indexes
            var fieldIndexes = [];
            for (var o=0; o<order.length; o++) {
                var index = findFieldIndex(fields, order[o]);
                if (index !== false) {
                    fieldIndexes.push(index);
                }
            }
            //now for each row push the values in the columns from fieldIndex array
            var rowData;
            for (var r=0; r<table.length; r++) {
                rowData = [];
                for (var i=0; i<fieldIndexes.length; i++) {
                    rowData.push(table[r][fieldIndexes[i]]);
                }
                res.table.push(rowData);
            }

            //finally push the fieldnames provided in order into the res.fields array
            //if an index was used in order convert it to a string

            for (var f=0; f<order.length; f++) {
                //if the order pushed was an index, push the fieldName at that index
                if (typeof order[f] === 'number') {
                    res.fields.push(fields[order[f]]);
                } else if (findFieldIndex(fields, order[f]) !== false) { //verify that the field in order[f] exists
                    res.fields.push(order[f]); //if so push it in
                }
            }
        }
        catch (e) { return res; }

        return res;
    }

    function getTableColumn(table, column, distinct) {
        //returns a single column from a table
        /* Params:
            -column: (num), the index of the column to return
            -distinct: (bool), no duplicates
        */

        function itemInList(list, item) {
            //checks to see if an item is in a list, such as a particular string
            //this looks for a soft equivalence, so 1 = '1' etc
            /* Params:
                -list: array[], the list of things to check against
                -item: the thing we're checking for
            */
    
            if (list.constructor !== Array) { return false; }
        
            for (var i=0; i<list.length; i++) {
                if (list[i] == item) { return true; } //soft check
            }
        
            return false;
        
        
        }
        var col = [];
        try {
            //push the column into an Array, row by row
            for (var row=0; row<table.length; row++) {
                if (distinct) {
                    //if distinct, see if the item is already in the col array
                    if (!itemInList(col, table[row][column])) {
                        col.push(table[row][column]); //if not then go ahead and push
                    }
                } else {
                    col.push(table[row][column]);
                }
            }
            return col;   
        } catch (e) {
            return [];
        }
    }

    function recordtableToRecordset(rTable) {
        //converts a recordtable to a recordset
        /* Params:
            -rTable: the recordtable to convert
        */
    
        var res = [];
        var rowData;
        for (var row=0; row<rTable.table.length; row++) {
            rowData = {};
            for (var field=0; field<rTable.fields.length; field++) {
                rowData[rTable.fields[field]] = rTable.table[row][field];
            }
            res.push(rowData);
        }
        return res;
    }

    

    function createCSV(data, options) {
        //creates a CSV string from the table data 
        /* Params:
            -data: a recordtable to convert
            -Options = {
                -startRow: (num) row to start export from
                -startCol: (num) column to start export from
                -newLineString: (string) newline character
                -removeNewLines: (bool) don't include newlines (better readability in excel)
                -skipFields: (bool) don't include column headers
            }
        */
        if (typeof options === 'undefined') { options = {}; }
        if (typeof options.newLineString === 'undefined') { options.newLineString = '\r\n'; }
        if (typeof options.startCol === 'undefined') { options.startCol = 0; } 
        if (typeof options.startRow === 'undefined') { options.startRow = 0; } 

        var CSV = '';
        
        function escape(val) {
            //escapes a string so it doesn't break the CSV format
            /* Params:
                -val: the string to escape
            */
            if (typeof val === 'undefined' || val === null) { val = ''; }
            val = val.toString();
            
            //replace multiple quotes with single quotes
            val = val.replace(/"{2,}/g, '"');
            //replace single quotes with double quotes
            val = val.replace(/"/g, '""');
            if (options.removeNewLines) {
                val = val.replace(/(\r\n|\r|\n)/g, ' ');
            }

            val = '"' + val + '"'; //encapsulate everything
            return val;
        }

        if (options.skipFields !== true) { 
            //start by adding the fieldnames
            for (var f=0; f<data.fields.length; f++) {
                CSV += escape(data.fields[f]) + ',';
            }
            CSV = CSV.substring(0, CSV.length-1); //remove trailing ,
            CSV += options.newLineString; //add the line break
        }
        
        //now iterate through the table
        for (var r=options.startRow; r<data.table.length; r++) {
            for (var c=options.startCol; c<data.table[r].length; c++) {
                CSV += escape(data.table[r][c]) + ',';
            }

            CSV = CSV.substring(0, CSV.length-1); //remove trailing ,
            CSV += options.newLineString; //add the line break
        }

        return CSV;
    }

    /******* PUBLIC FUNCTIONS **********************************************************/
    

    /**
     * Exports a string representation of the DataMaster
     * @param {boolean} [consoleMode=false] - true is meant for console output false is meant for html
     * 
     * @returns {string} String representation of the DataMaster
     */
    this.debug = function (consoleMode) {
        //debugging function
        //spits out a string that represents the recordtable
        var newline = '<br>';
        var space = '&nbsp';
        if (consoleMode) {
            newline = '\r\n';
            space = ' ';
        }
        function lpad(value, length) {
            if (typeof value === 'number') { value = value.toString(); }
            if (typeof value !== 'string') {
                value = new Array(length + 1).join(space);
            } else {
                if (value.length < length) {
                    for (var c=value.length; c<length; c++) {
                        value += space;
                    }
                }
            }
            return value;
        }

        var pads = [];
        for (var i=0; i<_fields.length; i++) {
            pads[i] = _fields[i].length;      
        }
        for (var r=0; r<_table.length; r++) {
            for (var c=0; c<_fields.length; c++) {
                if (_table[r][c]) { //in case it's null or undefined
                    if (_table[r][c].toString().length > pads[c]) { pads[c] = _table[r][c].toString().length; }
                }
            } 
        }

        var out = newline;
        out += '-|';
        for (var f=0; f<_fields.length; f++) {
            out += lpad(_fields[f], pads[f]) + '|';
        }
        out += newline;
        for (var row = 0; row<_table.length; row++) {
            out += row + '|';
            for (var col=0; col<_table[row].length; col++) {
                out += lpad(_table[row][col], pads[col]) + '|';
            }
            out += newline;
        }
        
        return out;
    };

    /**
     * Exports a string representation of the DataMaster
     * @param {boolean} [consoleMode=false] - true is meant for console output false is meant for html
     * 
     * @returns {string} String representation of the DataMaster
     */
    this.print = _self.debug; //this is just an alternate way to debug/print

    /**
     * Copy the DataMaster into a new object
     * @returns {Object} {fields:[], table[]}
     */
    this.copy = function() {
        //wrapper for exportAs meant for making a copy of the DataMaster
        return _self.exportAs('recordtable') ;
    };

    /**
     * Exports the DataMaster in a variety of formats
     * @param {('table'|'recordset'|'recordtable'|'spreadsheet'|'csv')} style 
     *      The style of the exported data
     *      NOTES:
     *          'spreadsheet' uses the fields as the first row
     * @param {Object} [options]
     * @param {string[]|number[]} [options.fields] - The column names or indexes to export and the order
     *      NOTES:
     *          undefined = all columns in the existing order
     * @param {number} [options.startRow=0] - The row to start export from (csv only)
     * @param {number} [options.startCol=0] - The column to start export from (csv only)
     * @param {string} [options.newLineString="\r\n"] - The string to use for newlines
     *
     * @returns {Object|string} Different styles return different types of data
     * 
     * @example
     *      exportAs('recordset',{fields:[1,3,5,4]});
     */
    this.exportAs = function(style, options) {
        //convert style to lowercase
        // @ts-ignore
        style = style.toLowerCase();
        var res = {};
        
        //if fields were provided then 
        if (typeof options !== 'undefined') {
            if (Array.isArray(options.fields)) {
                //res will be a recordtable
                res = reorderData(_table, _fields, options.fields);
            }
        } else {
            res.table = copy(_table);
            res.fields = copy(_fields);
        }
        //we now have a copy of the full recordtable or a modified one in res

        if (style === 'table') {
            return res.table;
        } else if (style === 'recordset') {
            return recordtableToRecordset(res);
        } else if (style === 'recordtable') {
            return res;
        } else if (style === 'spreadsheet') {
            res.table.unshift(_fields);
            return res.table;
        } else if (style === 'csv') {
            return createCSV(res, options);
        } else {
            return null; //no default return type.
        }
    };

    /**
     * Returns a copy of the DataMaster table
     * @returns {Object} [[]]
     */
    this.table = function() {
        return copy(_table);
    };

    /**
     * Returns a copy of the DataMaster field list
     * @returns {string[]} ['field1','field2'...]
     */
    this.fields = function() {
        return copy(_fields);
    };

    /**
     * Returns a single column from the DataMaster
     * @param {string|number} column - The column name or index to return
     * @param {boolean} [distinct=false] - No duplicates
     * 
     * @returns {string[]|null} ['val1','val2'...]
     */
    this.getColumn = function(column, distinct) {
        var index = findFieldIndex(_fields, column);
        if (index !== false) {
            return getTableColumn(_table, index, distinct);
        } else {
            return null;
        }
        
    };

    /**
     * Returns a single row from the DataMaster
     * @param {number} index - The row index
     * @param {('array'|'table'|'recordset'|'recordtable'|'object')} [style='array'] - The return type
     *      NOTE: 'object' returns a single object {}, 'recordset' returns [{}]
     * @returns {Object} Various types
     */
    this.getRow = function(index, style) {
        //returns a single row as an array.
        /* Params:
            -column: column number or field name
            -style: (string), 'table/recordset/recordtable/array/object' default = array
        */
        if (index >=0 && index <_table.length) {
            if (typeof style !== 'undefined') { 
                // @ts-ignore
                style = style.toLowerCase();
            } else {
                style = 'array';
            }

            var res = {
                table: [_table[index]], //this forces it to be a table, not an array
                fields: _fields
            };

            if (style === 'table') {
                return res.table;
            } else if (style === 'array') {
                return res.table[0];
            } else if (style === 'recordset') {
                return recordtableToRecordset(res);
            } else if (style === 'recordtable') {
                return res;
            } else if (style === 'object') {
                return recordtableToRecordset(res)[0];    
            } else {
                return null; //invalid return type.
            }
        } else {
            return null;
        }
    };

    /**
     * Sorts the DataMaster
     * @param {string|number} field - The field to sort by, if null all fields will be sorted in order
     * @param {boolean} [desc] - Sort descending
     * @returns {Object} this
     */
    this.sort = function(field, desc) {        
        
        if (field) {
            sortField(field);
        } else {
            for (var i=_fields.length-1; i>=0; i--) {
                sortField(_fields[i]);
            }
        }

        function sortField(fieldName) {
            //get the index of the field
            var index = findFieldIndex(_fields, fieldName);
            if (index !== false) {
                var primer; //this is the function to apply to each row to determine sort order
                if (isNaN(_table[0][index])) { //not a number, not even a string representation
                    primer = function(a) { 
                        try {
                            return a.toUpperCase(); //convert everything to uppercase
                        } catch(e) {
                            return a; //or just return a if you can't convert.
                        }
                    }; 
                } else {
                    primer = parseFloat; //so now number strings we be evaluated as numbers
                }

                _table.sort(sortBy(index, desc, primer));
            }
        }
        
        return this;
    };



    /**
     * Reorders the DataMaster in place and removes fields
     * @param {string[]|number[]} fields - The fields to keep and in what order
     * @returns {Object} this
     */
    this.reorder = function(fields) {
        var rTable = reorderData(_table, _fields, fields);
        _table = rTable.table;
        _fields = rTable.fields;

        return this; //for chaining
    };

    /**
     * Searches the DataMaster
     * @param {Object} options
     * @param {string|number|function} options.query - The value to search for
     * @param {string|number} [options.searchField] -The field to search in, undefined for all
     * @param {string|number} [options.return] - The field to return
     * @param {('table'|'recordset'|'recordtable'|'index'|'array')} [options.style='index']
     *  - The style of the returned data
     *      NOTE: 'index' is an array of row indexes that match
     * @returns {Object} Various types
     */
    this.search = function(options) {
        //setup some defaults and some requirements
        if (typeof options === 'undefined') { return null; }
        if (typeof options.query === 'undefined') { return null; }
        if (typeof options.style === 'undefined') { options.style = 'index'; }

        var searchIndex = findFieldIndex(_fields, options.searchField); //the field to search
        var returnIndex = findFieldIndex(_fields, options.return); //the field to return
        
        //we need to convert the options.return value into a valid field in case a column number was passed
        var returnField = false;
        if (returnIndex !== false) {
            returnField = _fields[returnIndex];
        } 

        var found = []; //search generates a list of row indexes 
        var res;

        var tempVal = '';
        for (var r=0; r<_table.length; r++) {
            if (searchIndex || searchIndex === 0) { //only search the given field
                //we're going to use a non-cased search. I can't think of a reason why we would want to 
                //only search in a case sensitive fashion, but that would be easy enough to add
                //in the same vein, numbers and strings will be treated the same. 45='45'
                if (typeof options.query === 'function') {
                    if (options.query(_table[r][searchIndex])) {
                        found.push(r);
                    }
                } else {
                    tempVal = _table[r][searchIndex];
                    if (tempVal === null) { tempVal = ''; }
                    if (tempVal.toString().toLowerCase().search(new RegExp(options.query.toString(),'i')) > -1) {
                        found.push(r); //just save the row index
                    }  
                } 
            } else {
                for (var c=0; c<_table[r].length; c++) {
                    if (typeof options.query === 'function') {
                        if (options.query(_table[r][c])) {
                            found.push(r);
                            break;
                        }
                    } else {
                        tempVal = _table[r][c];
                        if (tempVal === null) { tempVal = ''; }
                        if (tempVal.toString().toLowerCase().search(new RegExp(options.query.toString(),'i')) > -1) {
                            found.push(r); //just save the row index
                        }   
                    }  
                }
            }
        }

        //convert the found array into the various types of return structures the user may want.
        var i;
        if (options.style === 'index') {
            return found; //just return the list of row indexes 
        }  else {
            //generate a table from the found indexes based on the returnIndex
            res = [];
            if (returnIndex !== false) {
                for (i=0; i<found.length; i++) {
                    res.push(_table[found[i]][returnIndex]);
                }
            } else {
                for (i=0; i<found.length; i++) {
                    res.push(_table[found[i]]);
                }    
            }
            
            //now return the data in the appropriate format
            if (options.style === 'array') {
                return res; 
            } else {
                var rTable = {
                    table: res,
                    fields: _fields
                };
                if (returnField) { 
                    var table = [];
                    /* The following converts an array of values into a table with one column
                        input=[0,1,2]
                        result=[
                            [0],
                            [1],
                            [2]
                        ]
                    */
                    res.forEach(function(value) {
                        table.push([value]);
                    });

                    rTable.table = table;
                    rTable.fields = [returnField]; //force into an array
                } 
                if (options.style === 'table') {
                    return rTable.table;
                } else if (options.style === 'recordset') {
                    return recordtableToRecordset(rTable);    
                } else if (options.style === 'recordtable') {
                    return rTable;
                }
                
            } 
        }
        
        //Will this ever be reached?
        return this; //for chaining  
    };   

    /**
     * 
     * @param {string/RegEx} query - the value to search for 
     * @param {string|number} newValue - the replacement value
     * @param {*} fields 
     */
    this.replace = function(query, newValue, fields) {
        if (typeof query === 'undefined') { return this; }
        if (typeof newValue === 'undefined')  { return this; }
        if (typeof fields === 'undefined') { fields = _fields; }

        //convert to an array if only one field provided
        if (!Array.isArray(fields)) { fields = [fields]; }

        //if the user provided a string, make it a regex, not insensitive, global replace        
        if (!(query instanceof RegExp)) {
            query = new RegExp(query.toString(),'ig');   
        }

        //iterate over the provided fields
        for (var f=0; f<fields.length; f++) {
            //find the index of the field
            var col = findFieldIndex(_fields, fields[f]);
            //iterate down the column if it is valid
            if (col !== false) {
                for (var row=0; row<_table.length; row++) {
                    //replace the values
                    //we're going to treat nulls as empty strings
                    var cell = _table[row][col];
                    if (cell === null) { cell = ''; }
                    _table[row][col] = cell.replace(query, newValue);
                }
            }
        }

        return this; //for chaining
        
    };

    /**
     * Limits the DataMaster based on a search result
     * @param {Object} options
     * @param {string|number|function} options.query - The value to search for
     * @param {string|number} [options.searchField] -The field to search in, undefined for all
     * 
     */
    this.limit = function(options) {
        _table = _self.search({
            query: options.query,
            searchField: options.searchField,
            style: 'table'
        });

        return this; //for chaining
    };

    /**
     * Modifies existing field names;
     * @param {Object} fieldMap - 2d array of fields to modify
     * @param {boolean} [reorder] - if true then the new fieldnames will be
     *  used to reorder/limit the data as well
     * @returns {Object} this
     * @example
     *      modifyFieldNames([
     *          ['firstFieldToRename','newName'],
     *          ['anotherFieldToRename', 'newname']
     *      ], true;
     */
    this.modifyFieldNames = function(fieldMap, reorder) {
        //iterate over the map
        try {
            for (var i=0; i<fieldMap.length; i++) { 
                var index = findFieldIndex(_fields, fieldMap[i][0]); //get the index of the field name
                if (index !== false) { _fields[index] = fieldMap[i][1]; }
            }

            if (reorder) {
                //create an array of the second row of the fieldmap
                var list = [];
                for (var l=0; l<fieldMap.length; l++) { list.push(fieldMap[l][1]); }
                _self.reorder(list);
            }

        } catch (e) { }   

        return this; //for chaining
    };

    /**
     * Sets the field names
     * @param {string[]} fields - The new field names
     * @returns {Object} this
     */
    this.setFieldNames = function(fields) {
        //updates the field names
        /* Params:
            -fields: (string[]), the new field names.
        */
        //replaces fields in order, if you pass fewer names then already exist in the recordtable
        //the remaining ones wont be updated.

        //get the shorter of the two fields so that if extra field names are passed they are ignored.
        var max = fields.length < _fields.length ? fields.length : _fields.length; 
        for (var f=0; f<max; f++) {
            _fields[f] = fields[f];
        }

        return this; //for chaining
    };

    /**
     * Adds a new column to the DataMaster
     * @param {string} name - The column/field name
     * @param {Object} [data] - The data to add. undefined will add nulls
     * @param {string|number} [location] - Index or fieldname to place the column.
     *  Will shift existing columns over. NOTE: undefined will place column at the end.
     * @returns {Object} this
     */
    this.addColumn = function(name, data, location) {
        if (typeof name === 'undefined') { return null; }
        if (typeof data === 'undefined') { data = []; }

        try {
            var clean; //this will be a properly formatted column
            clean = data.slice(0, _table.length); 
            if (clean.length< _table.length) { //if it's too short, add nulls to fill
                for (var i=clean.length; i<_table.length; i++) {
                    clean.push(null);
                }
            }

            //we now have a proper column with a proper name.
            var r; //for loops
            if (typeof location !== 'undefined') {
                var index = findFieldIndex(_fields, location);
                if (index !== false) {
                    _fields.splice(index, 0, name); //splice into the field list
                    for (r=0; r<_table.length; r++) {
                        _table[r].splice(index,0, data[r]); //splice into each row
                    } 
                }        
            } else {
                _fields.push(name); //stick it in the end of the stack
                for (r=0; r<_table.length; r++) {
                    _table[r].push(data[r]); //place it at the end of the row
                }     
            }

        } catch (e) {}

        return this; //for chaining
    };

    /**
     * Removes a column from the DataMaster
     * @param {string|number} column - The column to remove
     * @returns {Object} this
     */
    this.removeColumn = function(column) {
        //strips a single column from the recordtable
        /* Params:
            -column: index or field to remove
        */

        var index = findFieldIndex(_fields, column);
        if (index !== false) {
            _fields.splice(index, 1); //strip the field
            for (var r=0; r<_table.length; r++) {
                _table[r].splice(index, 1); //strip out from the row
            }
        }

        return this; //for chaining
    };

    /**
     * Adds a row to the DataMaster
     * @param {Object} data - The row data
     *  NOTE:
     *      1) array will only add items up to the existing length, extras will be skipped
     *      2) for object, only matching field names will be added, the rest skipped or set to null
     * @param {number} location - The index at which to place the new row, shifting existing rows
     *  NOTE:
     *      1) undefined: end of table
     *      2) <=0: beginning of table
     * @returns {Object} this
     */
    this.addRow = function(data, location) {
        if (typeof data === 'undefined') { data = []; }
        var clean; 
        try {
            if (!Array.isArray(data)) { //hopefully an object was passed
                clean = new Array(_fields.length); //create an array of the proper length
                
                //prefer null to undefined?
                for (var c=0; c<clean.length; c++) { clean[c] = null; } 
                
                //fill the array from the fieldIndexes of the passed object in the proper locations
                Object.keys(data).forEach(function(key) {
                    var index = findFieldIndex(_fields, key);
                    if (index !== false) {
                        clean[index] = data[key];
                    }
                });
            } else { //if an array was passed just set clean to the passed value
                clean = data;
                //see if it's too long
                if (clean.length > _fields.length) {
                    clean = clean.slice(0, _fields.length); //trim the excess
                } else if (clean.length < _fields.length) {
                    for (var i=clean.length; i<_fields.length; i++) { //start at the end of the exiting row
                        clean.push(null);
                    }
                }
            }

            //clean is now an array of the appropriate length filled with the passed data

            if (typeof location === 'number') {
                //make location in bounds
                if (location < 0) { location = 0; }
                if (location > _table.length) { location = _table.length; }
                //splice it into the table
                _table.splice(location, 0, clean);
            } else {
                //if location not defined, add row to bottom
                _table.push(clean);
            }
            
        } catch (e) {}
        
        return this; //for chaining
    };

    /**
     * Removes a row from the DataMaster
     * @param {number} index - Index of the row to remove
     * @returns {Object} this
     */
    this.removeRow = function(index) {
        if (index >=0 && index < _table.length) {
            _table.splice(index, 1);
        }

        return this; //for chaining
    };

    /**
     * Modifies a cell value
     * @param {number} row - The row
     * @param {string|number} column - The column
     * @param {string|number} value - The new value for the cell
     * @returns {Object} this
     */
    this.modifyCell = function(row, column, value) {
        try {
            var index = findFieldIndex(_fields, column);
            if (index !== false) { //findFieldIndex will either return valid num or false
                 _table[row][index] = value;   
            }
        } catch (e) { }

        return this; //for chaining
    };

    /**
     * Gets the value of a single cell
     * @param {number} row - The row
     * @param {string|number} column - The column
     * @returns {string|number} The cell value
     */
    this.getCell = function(row, column) {
        try {
            var index = findFieldIndex(_fields, column); //get the index of the field name
            if (index !== false) { //findFieldIndex will either return valid num or false
                return _table[row][index];
            }
        } catch (e) { return undefined; }
        //invalid cell
        return undefined;
    };

    /**
     * Get the length of the DataMaster table
     * @returns {number} The length of the table
     */
    this.length = function() {
        return _table.length;
    };

    /**
     * Sums column values
     * @param {string} [label] - If the rows have headers, this will be the label for the sums
     * @param {string[]|number[]} [columns] - The columns to sum. Undefined for all.
     * @returns {Object} this
     */
    this.sumColumns = function(label, columns) {
        //if not passed, create a column array with all columns
        if (typeof columns === 'undefined') {
            columns = [];
            for (var a=0; a<_fields.length; a++) {
                // @ts-ignore
                columns.push(a);
            }
            //remove column 0 from default column list if label exists
            if (typeof label === 'string') {
                columns.shift(); 
            }
        }
        
        //convert column array into indexes
        var clean = []; //this will hold valid column indexes
        for (var i=0; i<columns.length; i++) {
            if (typeof columns[i] === 'string') {
                var index = findFieldIndex(_fields, columns[i]);
                if (index !== false) { clean.push(index); }
            } else {
                if (columns[i]>=0 && columns[i]<_fields.length) {clean.push(columns[i]); }
            }
        }

        //we should now have an array of valid column indexes
        //create the sums array
        var sums = [];
        for (var s=0; s<_fields.length; s++) { sums.push(null); }
        if (typeof label === 'string') { sums[0] = label; } //replace the first column with the label

        //now sum the columns from the clean array
        for (var c=0; c<clean.length; c++) {
            var sum = 0;
            for (var r=0; r<_table.length; r++) {
                if (typeof _table[r][clean[c]] === 'number') {
                    sum += _table[r][clean[c]];
                }
            }
            sums[clean[c]] = sum;
        }

        //we now have a full array of the sums, so add as a new row
        this.addRow(sums);

        return this; //for chaining
    };

    /**
     * Sums rows
     * @param {string} label -The label of the new column holding the sum 
     * @param {number[]} [rows] - The rows to sum, undefined for all
     * @returns {Object} this
     */
    this.sumRows = function(label, rows) {
        if (typeof label === 'undefined' || label === null) { label = 'Total'; }
        
        //create an array to hold the sums. Set to null by default
        var sums = [];
        for (var a=0; a<_table.length; a++) { sums.push(null); }
        //if no rows were passed then create a row array with all rows in it
        if (typeof rows === 'undefined') {
            rows = [];
            for (var i=0; i<_table.length; i++) { rows.push(i); }
        }
        //we now have a row array that has all the rows we want summed
        for (var r=0; r<rows.length; r++) {
            if (rows[r]>=0 && rows[r]<_table.length) { //basic sanity check
                var sum = 0;
                for (var c=0; c<_fields.length; c++) {
                    if (typeof _table[rows[r]][c] === 'number') {
                        sum += _table[rows[r]][c];
                    }
                }
                sums[rows[r]] = sum;
            }
        }
        //we now have a column of sums, so push into the table
        _self.addColumn(label, sums);

        return this; //for chaining
    };

    /**
     * Pivots the table (so rows become cols)
     *  NOTE: 1) This function assumes that your table data has row headers, because that's what the new
        columns will be called. Add in row headers using addColumn if necessary before running this. 
        @returns {Object} this
     */
    this.pivot = function() {
        var c, f, r; //for loops

        var pivot = { 
            table: [],
            fields: []
        };

        try {

            //first create the full pivoted table structure
            for (f=0; f<_fields.length-1; f++) { //_fields.length-1 because we're skipping the column names
                data = [];
                //create a blank row
                //length+1 because we need a spot for the fields to become row headers
                for (r=0; r<_table.length+1; r++) { 
                    data.push('XXX'); //TODO: switch to nulls
                }
                pivot.table.push(data);
            }

            //the new fields will be the first column values
            pivot.fields = getTableColumn(_table, 0);
            pivot.fields.unshift(_fields[0]); //keep the first column header
            //place the fields into the first column of the new table
            for (r=0; r<_fields.length-1; r++) { //for each field
                pivot.table[r][0] = _fields[r+1]; //skip first field
            }     
            
            for (c=0; c<_fields.length-1; c++) { //skip the first column as that's now field names
                for (r=0; r<_table.length; r++) { //still do each row
                    //add 1 to the _table column so we skip the field names
                    //add 1 to the pivot.table row because we've already put in the row headers 
                    //which aren't in the original table data
                    pivot.table[c][r+1] = _table[r][c+1]; 
                }
            }
            
            _table = pivot.table;
            _fields = pivot.fields;   
        } catch(e) {
            console.log(e);
        }

        return this; //for chaining   
    };

}; //END DATAMASTER 

if (typeof window === 'undefined') {
    exports.DataMaster = DataMaster;
} else {
    //convenience variable
    var jwdm = DataMaster;
}