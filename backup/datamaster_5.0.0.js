/**
 * ver .0.0 2025/07/07
 */

(function(global) {
    'use strict';

    /******* HELPER FUNCTIONS (Private Scope) **********************************************************/

    function copy(data) {
        return JSON.parse(JSON.stringify(data));
    }

    function multiFieldSort(fields, directions, primers) {
        return function (a, b) {
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                const isDescending = directions[i];
                const primer = primers && primers[i];
                const sortOrder = isDescending ? -1 : 1;

                let key = function(x) {
                    return x[field];
                };
                
                if (primer) {
                    key = function(x) {
                        return primer(x[field]);
                    };
                }
                
                const valueA = key(a);
                const valueB = key(b);

                if (valueA > valueB) {
                    return sortOrder;
                } else if (valueA < valueB) {
                    return -sortOrder;
                }
            }
            return 0;
        };
    }

    function csvToTable(csv, options = {}) {
        const table = [];
        const sep = options.isTSV ? '\t' : ',';
        const cr = options.noCR ? '\n' : '\r\n';
        
        let cell = '';
        let row = [];
        let started = false;
        let protectedMode = false;
        let cursor = 0;

        function isChar(str) {
            const test = csv.substr(cursor, str.length);
            if (str === test) {
                cursor += str.length;
                return true;
            }
            return false;
        }

        while (cursor < csv.length) {
            if (started) {
                if (protectedMode) {
                    if (isChar('"' + sep)) { 
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
                    } else if (isChar('""')) {
                       cell += '"';
                    } else {
                        cell += csv[cursor];
                        cursor++;
                    }
                } else {
                    if (isChar(sep)) {
                        row.push(cell);
                        cell = '';
                        started = false;
                        protectedMode = false;
                    } else if (isChar(cr)) {
                        row.push(cell);
                        cell = '';
                        table.push(row);
                        row = [];
                        started = false;
                        protectedMode = false;
                    } else if (isChar('""')) {
                        cell += '"';
                    } else {
                        cell += csv[cursor];
                        cursor++;
                    }
                }
            } else {
                if (isChar('"')) {
                    protectedMode = true;
                    started = true;
                } else if (isChar(sep)) {
                    row.push(cell);
                    cell = '';
                    started = false;
                    protectedMode = false;
                } else if (isChar(cr)) {
                    table.push(row);
                    row = [];
                    cell = '';
                    started = false;
                    protectedMode = false;    
                } else {
                    cell = csv[cursor];
                    started = true;
                    protectedMode = false;  
                    cursor++; 
                }
            }
        } 

        return table;
    }

    function recordsetToRecordTable(data) {
        const fieldNames = Object.keys(data[0]);
        const table = [];

        for (let i = 0; i < data.length; i++) {
            const row = [];
            for (let j = 0; j < fieldNames.length; j++) {
                const fieldName = fieldNames[j];
                if (data[i].hasOwnProperty(fieldName)) {
                    row.push(data[i][fieldName]);
                } 
            }
            table.push(row);
        }
        
        return {
            table: table,
            fields: fieldNames
        };
    }

    function recordtableToRecordset(rTable) {
        const res = [];
        for (let row = 0; row < rTable.table.length; row++) {
            const rowData = {};
            for (let field = 0; field < rTable.fields.length; field++) {
                rowData[rTable.fields[field]] = rTable.table[row][field];
            }
            res.push(rowData);
        }
        return res;
    }

    function createCSV(data, options = {}) {
        const newLineString = options.newLineString || '\r\n';
        const startCol = options.startCol || 0;
        const startRow = options.startRow || 0;

        let CSV = '';
        
        function escape(val) {
            if (typeof val === 'undefined' || val === null) { 
                val = ''; 
            }
            val = val.toString();
            
            val = val.replace(/"{2,}/g, '"');
            val = val.replace(/"/g, '""');
            if (options.removeNewLines) {
                val = val.replace(/(\r\n|\r|\n)/g, ' ');
            }

            val = '"' + val + '"';
            return val;
        }

        if (options.skipFields !== true) { 
            for (let f = 0; f < data.fields.length; f++) {
                CSV += escape(data.fields[f]) + ',';
            }
            CSV = CSV.substring(0, CSV.length - 1);
            CSV += newLineString;
        }
        
        for (let r = startRow; r < data.table.length; r++) {
            for (let c = startCol; c < data.table[r].length; c++) {
                CSV += escape(data.table[r][c]) + ',';
            }
            CSV = CSV.substring(0, CSV.length - 1);
            CSV += newLineString;
        }

        return CSV;
    }

    // Advanced search functionality preserved from original
    function advancedSearch(query, queryFunctions, table, fields) {
        function looseCaseInsensitiveCompare(value, query, forceCaseSensitivity) {
            if (value == null || query == null) {
                return false;
            }

            value = String(value);
            query = String(query);

            if (!forceCaseSensitivity) {
                value = value.toLowerCase();
                query = query.toLowerCase();
            }
            
            let regexStr = '';
            for (let i = 0; i < query.length; i++) {
                if (query[i] === '%') {
                    regexStr += '.*';
                } else if (query[i] === '_') {
                    regexStr += '.';
                } else {
                    regexStr += query[i];
                }
            }
            const regex = new RegExp(`^${regexStr}$`);
            return regex.test(value);
        }
        
        function parseFunctionString(functionString) {
            const openParenIndex = functionString.indexOf('(');
            const closeParenIndex = functionString.lastIndexOf(')');

            const functionName = openParenIndex === -1 ? 
                functionString : 
                functionString.substring(0, openParenIndex);
            let arrayContent = [];

            if (openParenIndex !== -1 && closeParenIndex !== -1) {
                const arrayContentString = functionString.substring(
                    openParenIndex + 1, closeParenIndex
                );

                try {
                    arrayContent = eval('[' + arrayContentString + ']');
                } catch (error) {
                    return functionString;
                }
            }

            return {
                name: functionName,
                params: arrayContent
            };
        }

        function evaluateSingleOperation(data, operation) {
            const operatorPattern = /(=|!=)/g;
            const [index, operator, value] = operation.split(operatorPattern);
            const cleanValue = value.replace(/['"]/g, '');
            
            if (!isNaN(index) && index < data.length) {
                let matchFound = false; 
                
                if (cleanValue.charAt(0) === '$') {
                    const functionString = cleanValue.substring(1);
                    const functionParts = parseFunctionString(functionString);
                    const functionName = functionParts.name;
                    const functionParams = functionParts.params;
                    if (typeof queryFunctions !== 'undefined') {
                        if (typeof queryFunctions[functionName] === 'function') {
                            matchFound = queryFunctions[functionName](data[index], functionParams);
                        } else {
                            matchFound = looseCaseInsensitiveCompare(data[index], cleanValue);  
                        }
                    }
                } else { 
                    matchFound = looseCaseInsensitiveCompare(data[index], cleanValue);
                }
                
                matchFound = operator === '!=' ? !matchFound : matchFound;
                return matchFound ? 'true' : 'false';
            }

            return 'false';
        }
       
        function replaceAndEvaluateExpressions(data, query) {
            const regex = /\d+\s*(?:!=|=)\s*'[^']*'/g;
            let match;
            let modifiedStr = query;

            while ((match = regex.exec(query)) !== null) {
                const expression = match[0];
                const evaluatedValue = evaluateSingleOperation(data, expression);
                modifiedStr = modifiedStr.replace(expression, evaluatedValue);
            }

            return modifiedStr;
        }

        function evaluateLogicalExpression(expression) {
            const orParts = expression.split(' OR ');

            for (const orPart of orParts) {
                const andParts = orPart.split(' AND ');
                let andResult = true;

                for (const andPart of andParts) {
                    if (andPart === 'false') {
                        andResult = false;
                        break;
                    }
                }

                if (andResult) {
                    return true;
                }
            }

            return false;
        }

        function evaluateNestedExpression(expression) {
            let start = -1;
            let end = -1;
            let depth = 0;

            for (let i = 0; i < expression.length; i++) {
                if (expression[i] === '(') {
                    if (start === -1) {
                        start = i;
                    }
                    depth++;
                } else if (expression[i] === ')') {
                    depth--;
                    if (depth === 0) {
                        end = i;
                        break;
                    }
                }
            }

            if (start === -1 || end === -1) {
                return evaluateLogicalExpression(expression) ? 'true' : 'false';
            }

            const innerExpression = expression.substring(start + 1, end);
            const innerResult = evaluateNestedExpression(innerExpression);
            
            const newExpression = expression.substring(0, start) + innerResult + 
                                    expression.substring(end + 1);

            return evaluateNestedExpression(newExpression);
        }

        function expandAllFields(query, fields) {
            const pattern = /(OR|AND)\*\s*(=|!=)\s*\'([^\']+)\'/g;

            function replaceMatch(match, logicalOperator, operator, value) {
                const conditions = fields.map(column => `${column}${operator}'${value}'`);
                const joiner = logicalOperator === 'OR' ? ' OR ' : ' AND ';
                return '(' + conditions.join(joiner) + ')';
            }

            return query.replace(pattern, replaceMatch);
        }

        // Main search logic
        query = expandAllFields(query, fields);
        const resultData = [];
        const resultIndices = [];

        // Replace field names with corresponding indices
        for (let i = 0; i < fields.length; i++) {
            const fieldName = fields[i];
            const regExpEqual = new RegExp(fieldName + '=', 'g');
            query = query.replace(regExpEqual, i.toString() + '=');
            const regExpNotEqual = new RegExp(fieldName + '!=', 'g');
            query = query.replace(regExpNotEqual, i.toString() + '!=');
        }

        // Loop through the data and add matches to the result
        for (let d = 0; d < table.length; d++) {
            const booleanExpression = replaceAndEvaluateExpressions(table[d], query);
            const result = evaluateNestedExpression(booleanExpression);
            
            if (result === 'true') {
                resultData.push(table[d]);
                resultIndices.push(d);
            }
        }

        return {
            table: resultData,
            indices: resultIndices
        };
    }

    /******* THE DATAMASTER CLASS **********************************************************/

    class DataMaster {
        constructor(table, fields, options = {}) {
            this._table = table || [];
            this._fields = fields || [];
            this._options = this._validateOptions(options);
        }

        _validateOptions(options) {
            const defaultOptions = {
                errorMode: 'standard',
                onError: null
            };
            return Object.assign(defaultOptions, options);
        }

        _handleError(errorMessage, errorType = 'User Error') {
            const errorObject = {
                message: errorMessage,
                type: errorType,
                timestamp: new Date().toISOString()
            };

            // 1. Call the user's onError callback, if it exists.
            if (this._options.onError && typeof this._options.onError === 'function') {
                try {
                    this._options.onError(errorObject);
                } catch (e) {
                    console.error("DataMaster: The user-provided 'onError' callback threw an error.", e);
                }
            }

            // 2. Return the final, correct value based on the configured mode.
            switch (this._options.errorMode) {
                case 'strict':
                    // In strict mode, throw the error.
                    throw new Error(`[${errorObject.type}] ${errorObject.message}`);
                
                case 'silent':
                    // In silent mode, log the error and return null.
                    console.error(`DataMaster ${errorObject.type}: ${errorObject.message}`);
                    return null;
                
                case 'standard':
                    // In standard mode, directly call the creation method and return the result.
                    return this._createErrorDataMaster(errorObject.type, errorObject.message);
                default:
                    // We'll treat default the same as standard mode.
                    return this._createErrorDataMaster(errorObject.type, errorObject.message);
            }
        }

        _createErrorDataMaster(errorType, errorMessage) {
            // This method correctly creates the "Error as Data" DataMaster instance.
            const errorDM = new DataMaster(
                [[errorType, errorMessage]], 
                ['ErrorType', 'Message'],
                this._options
            );
            return errorDM;
        }

        _findFieldIndex(field) {
            if (typeof field === 'number') {
                if (field < this._fields.length && field >= 0) {
                    return field;
                }
                return false;
            } else {
                for (let f = 0; f < this._fields.length; f++) {
                    if (this._fields[f] === field) {
                        return f;
                    }
                }
            }
            return false;
        }

        _createFields(fields) {
            if (typeof fields === 'undefined') {
                this._fields = [];
                for (let i = 0; i < this._table[0].length; i++) {
                    this._fields.push(i.toString());
                }    
            } else {
                const max = (this._fields.length < fields.length) ? this._fields.length : fields.length;
                for (let f = 0; f < max; f++) {
                    this._fields[f] = fields[f];
                }
            }
        }

        _reorderData(table, fields, order) {
            const res = {
                table: [],
                fields: []
            };

            try {
                const fieldIndexes = [];
                for (let o = 0; o < order.length; o++) {
                    const index = this._findFieldIndex.call({_fields: fields}, order[o]);
                    if (index !== false) {
                        fieldIndexes.push(index);
                    }
                }

                for (let r = 0; r < table.length; r++) {
                    const rowData = [];
                    for (let i = 0; i < fieldIndexes.length; i++) {
                        rowData.push(table[r][fieldIndexes[i]]);
                    }
                    res.table.push(rowData);
                }

                for (let f = 0; f < order.length; f++) {
                    if (typeof order[f] === 'number') {
                        res.fields.push(fields[order[f]]);
                    } else if (this._findFieldIndex.call({_fields: fields}, order[f]) !== false) {
                        res.fields.push(order[f]);
                    }
                }
            }
            catch (e) { 
                return res; 
            }

            return res;
        }

        // Static Factory Methods
        static fromRecordset(recordset, options = {}) {
            try {
                if (!Array.isArray(recordset) || recordset.length === 0) {
                    const dm = new DataMaster([], [], options);
                    dm._handleError('Invalid recordset: must be a non-empty array');
                    return dm._createErrorDataMaster('Invalid recordset provided');
                }

                const rTable = recordsetToRecordTable(recordset);
                return new DataMaster(rTable.table, rTable.fields, options);
            } catch (e) {
                const dm = new DataMaster([], [], options);
                return dm._createErrorDataMaster('Failed to create DataMaster from recordset');
            }
        }

        static fromTable(table, options = {}) {
            try {
                if (!Array.isArray(table)) {
                    const dm = new DataMaster([], [], options);
                    return dm._createErrorDataMaster('Invalid table: must be an array');
                }

                const dm = new DataMaster(copy(table), [], options);
                
                if (table.length > 0) {
                    dm._createFields();
                    
                    if (Array.isArray(options.headers)) {
                        dm._createFields(options.headers);
                    } else if (options.headersInFirstRow === true) {
                        dm._createFields(table[0]);
                        dm._table.splice(0, 1);
                    }
                }

                return dm;
            } catch (e) {
                const dm = new DataMaster([], [], options);
                return dm._createErrorDataMaster('Failed to create DataMaster from table');
            }
        }

        static fromCsv(csvString, options = {}) {
            try {
                if (typeof csvString !== 'string') {
                    const dm = new DataMaster([], [], options);
                    return dm._createErrorDataMaster('Invalid CSV: must be a string');
                }

                const table = csvToTable(csvString, options);
                const dm = new DataMaster(table, [], options);
                
                if (table.length > 0) {
                    dm._createFields();
                    
                    if (Array.isArray(options.headers)) {
                        dm._createFields(options.headers);
                    } else if (options.headersInFirstRow === true) {
                        dm._createFields(table[0]);
                        dm._table.splice(0, 1);
                    }
                }

                return dm;
            } catch (e) {
                const dm = new DataMaster([], [], options);
                return dm._createErrorDataMaster('Failed to create DataMaster from CSV');
            }
        }

        static fromGenerator(template, options = {}) {
            try {
                const generator = new TableGenerator();
                const table = generator.generate(template);
                
                return DataMaster.fromTable(table, {
                    ...options,
                    headersInFirstRow: template.settings && template.settings.includeHeaders
                });
            } catch (e) {
                const dm = new DataMaster([], [], options);
                return dm._createErrorDataMaster('Failed to create DataMaster from generator');
            }
        }

        // Mutating Methods (return this)
        modifyCell(rowIndex, field, newValue) {
            try {
                const index = this._findFieldIndex(field);
                if (index !== false && rowIndex >= 0 && rowIndex < this._table.length) {
                     this._table[rowIndex][index] = newValue;   
                }
            } catch (e) {
                this._handleError('Failed to modify cell');
            }
            return this;
        }

        addRow(rowData, location) {
            if (typeof rowData === 'undefined') { 
                rowData = []; 
            }
            
            try {
                let clean;
                
                if (!Array.isArray(rowData)) {
                    clean = new Array(this._fields.length);
                    
                    for (let c = 0; c < clean.length; c++) { 
                        clean[c] = null; 
                    } 
                    
                    Object.keys(rowData).forEach(key => {
                        const index = this._findFieldIndex(key);
                        if (index !== false) {
                            clean[index] = rowData[key];
                        }
                    });
                } else {
                    clean = rowData.slice();
                    if (clean.length > this._fields.length) {
                        clean = clean.slice(0, this._fields.length);
                    } else if (clean.length < this._fields.length) {
                        for (let i = clean.length; i < this._fields.length; i++) {
                            clean.push(null);
                        }
                    }
                }

                if (typeof location === 'number') {
                    if (location < 0) { location = 0; }
                    if (location > this._table.length) { location = this._table.length; }
                    this._table.splice(location, 0, clean);
                } else {
                    this._table.push(clean);
                }
                
            } catch (e) {
                this._handleError('Failed to add row');
            }
            
            return this;
        }

        removeRow(rowIndex) {
            if (rowIndex >= 0 && rowIndex < this._table.length) {
                this._table.splice(rowIndex, 1);
            }
            return this;
        }

        addColumn(name, data, location) {
            if (typeof name === 'undefined') { 
                this._handleError('Column name is required');
                return this; 
            }
            if (typeof data === 'undefined') { 
                data = []; 
            }

            try {
                const clean = data.slice(0, this._table.length); 
                if (clean.length < this._table.length) {
                    for (let i = clean.length; i < this._table.length; i++) {
                        clean.push(null);
                    }
                }

                if (typeof location !== 'undefined') {
                    const index = this._findFieldIndex(location);
                    if (index !== false) {
                        this._fields.splice(index, 0, name);
                        for (let r = 0; r < this._table.length; r++) {
                            this._table[r].splice(index, 0, clean[r]);
                        } 
                    }        
                } else {
                    this._fields.push(name);
                    for (let r = 0; r < this._table.length; r++) {
                        this._table[r].push(clean[r]);
                    }     
                }

            } catch (e) {
                this._handleError('Failed to add column');
            }

            return this;
        }

        removeColumn(field) {
            const index = this._findFieldIndex(field);
            if (index !== false) {
                this._fields.splice(index, 1);
                for (let r = 0; r < this._table.length; r++) {
                    this._table[r].splice(index, 1);
                }
            }
            return this;
        }

        formatColumn(field, formatFn) {
            if (typeof formatFn !== 'function') { 
                return this; 
            }

            const index = this._findFieldIndex(field);
            if (index === false) { 
                return this; 
            }

            for (let row = 0; row < this._table.length; row++) {
                try {
                    this._table[row][index] = formatFn(this._table[row][index]);
                } catch (e) {
                    // Continue on formatting errors
                }
            }
            
            return this;
        }

        formatRow(rowIndex, formatFn) {
            if (typeof formatFn !== 'function') { 
                return this; 
            }
            if (rowIndex >= this._table.length) { 
                return this; 
            }

            for (let col = 0; col < this._table[rowIndex].length; col++) {
                try {
                    this._table[rowIndex][col] = formatFn(this._table[rowIndex][col]);
                } catch (e) {
                    // Continue on formatting errors
                }
            }
            
            return this;
        }

        setFieldNames(fields) {
            const max = fields.length < this._fields.length ? fields.length : this._fields.length; 
            for (let f = 0; f < max; f++) {
                this._fields[f] = fields[f];
            }
            return this;
        }

        limit(filter) {
            const searchResult = this.search(filter);
            this._table = searchResult._table;
            return this;
        }

        sort(fieldOrFields, directionOrDirections) {
            let fields = fieldOrFields;
            let desc = directionOrDirections;
            
            if (!Array.isArray(fields)) { 
                fields = [fields]; 
            }
            if (!Array.isArray(desc)) { 
                desc = [desc]; 
            }

            const validFields = [];
            for (let i = 0; i < fields.length; i++) {
                if (isNaN(fields[i])) {
                    const col = this._fields.indexOf(fields[i]);
                    if (col >= 0) {
                        validFields.push(col);
                    }
                } else {
                    if (fields[i] >= 0 && fields[i] <= this._fields.length) {
                        validFields.push(fields[i]);
                    }
                }
            }

            this._table.sort(multiFieldSort(validFields, desc));
            return this;
        }

        pivot() {
            try {
                const pivot = { 
                    table: [],
                    fields: []
                };

                for (let f = 0; f < this._fields.length - 1; f++) {
                    const data = [];
                    for (let r = 0; r < this._table.length + 1; r++) { 
                        data.push('XXX');
                    }
                    pivot.table.push(data);
                }

                pivot.fields = this._table.map(row => row[0]);
                pivot.fields.unshift(this._fields[0]);
                
                for (let r = 0; r < this._fields.length - 1; r++) {
                    pivot.table[r][0] = this._fields[r + 1];
                }     
                
                for (let c = 0; c < this._fields.length - 1; c++) {
                    for (let r = 0; r < this._table.length; r++) {
                        pivot.table[c][r + 1] = this._table[r][c + 1]; 
                    }
                }
                
                this._table = pivot.table;
                this._fields = pivot.fields;   
            } catch(e) {
                this._handleError('Failed to pivot table');
            }

            return this;
        }

        sumColumns(options = {}) {
            const label = options.label;
            let columns = options.columns;
            const isAverage = options.isAverage;
            const isNaNValue = options.isNaNValue;

            if (typeof columns === 'undefined') {
                columns = [];
                for (let a = 0; a < this._fields.length; a++) {
                    columns.push(a);
                }
                if (typeof label === 'string') {
                    columns.shift(); 
                }
            }
            
            const clean = [];
            for (let i = 0; i < columns.length; i++) {
                if (typeof columns[i] === 'string') {
                    const index = this._findFieldIndex(columns[i]);
                    if (index !== false) { 
                        clean.push(index); 
                    }
                } else {
                    if (columns[i] >= 0 && columns[i] < this._fields.length) {
                        clean.push(columns[i]); 
                    }
                }
            }

            const sums = [];
            const avgCount = [];
            for (let s = 0; s < this._fields.length; s++) { 
                sums.push(null); 
            }
            if (typeof label === 'string') { 
                sums[0] = label; 
            }

            for (let c = 0; c < clean.length; c++) {
                let sum = 0;
                avgCount[c] = 0;
                for (let r = 0; r < this._table.length; r++) {
                    const value = parseFloat(this._table[r][clean[c]]);
                    if (!isNaN(value)) {
                        sum += value;
                        avgCount[c]++;
                    }
                }
                sums[clean[c]] = sum;
                
                if (isAverage && avgCount[c] > 0) {
                    sums[clean[c]] /= avgCount[c];
                }
            }

            if (typeof isNaNValue !== 'undefined') {
                for (let i = 0; i < sums.length; i++) {
                    if (isNaN(sums[i])) { 
                        sums[i] = isNaNValue; 
                    }
                }
            }

            this.addRow(sums);
            return this;
        }

        sumRows(options = {}) {
            const label = options.label || 'Total';
            let rows = options.rows;
            const isAverage = options.isAverage;
            const isNaNValue = options.isNaNValue;
            
            const sums = [];
            const avgCount = [];
            for (let a = 0; a < this._table.length; a++) { 
                sums.push(null); 
            }
            
            if (typeof rows === 'undefined') {
                rows = [];
                for (let i = 0; i < this._table.length; i++) { 
                    rows.push(i); 
                }
            }
            
            for (let r = 0; r < rows.length; r++) {
                if (rows[r] >= 0 && rows[r] < this._table.length) {
                    let sum = 0;
                    avgCount[r] = 0;
                    for (let c = 0; c < this._fields.length; c++) {
                        const value = parseFloat(this._table[rows[r]][c]);
                        if (!isNaN(value)) {
                            sum += value;
                            avgCount[r]++;
                        }
                    }
                    sums[rows[r]] = sum;
                    if (isAverage && avgCount[r] > 0) {
                        sums[rows[r]] /= avgCount[r];
                    }
                }
            }

            if (typeof isNaNValue !== 'undefined') {
                for (let i = 0; i < sums.length; i++) {
                    if (isNaN(sums[i])) { 
                        sums[i] = isNaNValue; 
                    }
                }
            }

            this.addColumn(label, sums);
            return this;
        }

        replace(query, newValue, fields) {
            if (typeof query === 'undefined') { 
                return this; 
            }
            if (typeof newValue === 'undefined')  { 
                return this; 
            }
            if (typeof fields === 'undefined') { 
                fields = this._fields; 
            }

            if (!Array.isArray(fields)) { 
                fields = [fields]; 
            }

            if (!(query instanceof RegExp)) {
                query = new RegExp(query.toString(), 'ig');   
            }

            for (let f = 0; f < fields.length; f++) {
                const col = this._findFieldIndex(fields[f]);
                if (col !== false) {
                    for (let row = 0; row < this._table.length; row++) {
                        let cell = this._table[row][col];
                        if (cell === null) { 
                            cell = ''; 
                        }
                        this._table[row][col] = cell.toString().replace(query, newValue);
                    }
                }
            }

            return this;
        }

        removeDuplicates(fields) {
            if (this._table.length === 0) { 
                return this; 
            }
            if (typeof fields === 'undefined') {
                fields = this._fields;
            }
            if (!Array.isArray(fields)) { 
                fields = [fields]; 
            }
            
            const newTable = [];
            const cols = [];
            
            for (let f = 0; f < fields.length; f++) {
                const testCol = this._findFieldIndex(fields[f]);
                if (testCol !== false) {
                    cols.push(testCol);
                }
            }

            newTable.push(this._table[0]);

            const testForMatch = (rowData) => {
                for (let row = 0; row < newTable.length; row++) {
                    if (newTable[row][cols[0]] == rowData[cols[0]]) {
                        for (let col = 1; col < cols.length; col++) {
                            if (newTable[row][cols[col]] != rowData[cols[col]]) {
                                return false;
                            }
                        }
                        return true; 
                    } 
                }
                return false;
            };

            for (let row = 1; row < this._table.length; row++) {
                if (!testForMatch(this._table[row])) {
                    newTable.push(this._table[row]);
                }    
            }

            this._table = newTable;
            return this;
        }

        // SQL-like operations
        query(sqlString) {
            try {
                const verb = this._getSqlVerb(sqlString).toUpperCase();

                switch (verb) {
                    case 'SELECT':
                        const tempDM = this.clone();
                        tempDM._executeSelect(sqlString);
                        return tempDM;

                    case 'UPDATE':
                    case 'DELETE':
                    case 'INSERT':
                        this._executeMutation(sqlString, verb);
                        return this;

                    default:
                        this._handleError(`Unsupported SQL verb: ${verb}`);
                        return this;
                }
            } catch (e) {
                this._handleError('Failed to execute query');
                return this;
            }
        }

        update(setClause, whereClause) {
            const updateQuery = `UPDATE SET ${setClause}` + 
                (whereClause ? ` WHERE ${whereClause}` : '');
            return this.query(updateQuery);
        }

        delete(whereClause) {
            if (!whereClause) {
                this._handleError('DELETE requires a WHERE clause to prevent accidental full-table deletion');
                return this;
            }
            const deleteQuery = `DELETE WHERE ${whereClause}`;
            return this.query(deleteQuery);
        }

        _getSqlVerb(sqlString) {
            const trimmed = sqlString.trim();
            const firstWord = trimmed.split(/\s+/)[0];
            return firstWord || '';
        }

        _executeSelect(sqlString) {
            // Basic SELECT implementation - this could be expanded
            // For now, we'll handle simple SELECT * and field selections
            const selectMatch = sqlString.match(/SELECT\s+(.+?)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?$/i);
            
            if (selectMatch) {
                const [, selectClause, whereClause, orderClause] = selectMatch;
                
                // Handle WHERE clause
                if (whereClause) {
                    this.limit({
                        query: whereClause,
                        advanced: true,
                        queryFunctions: {}
                    });
                }
                
                // Handle ORDER BY clause
                if (orderClause) {
                    const orderParts = this._parseOrderByClause(orderClause);
                    this.sort(orderParts.fields, orderParts.desc);
                }
                
                // Handle SELECT clause
                if (selectClause.trim() !== '*') {
                    const fields = selectClause.split(',').map(f => f.trim());
                    const reorderedData = this._reorderData(this._table, this._fields, fields);
                    this._table = reorderedData.table;
                    this._fields = reorderedData.fields;
                }
            }
        }

        _executeMutation(sqlString, verb) {
            // Basic mutation implementation
            if (verb === 'UPDATE') {
                const updateMatch = sqlString.match(/UPDATE\s+SET\s+(.+?)(?:\s+WHERE\s+(.+?))?$/i);
                if (updateMatch) {
                    const [, setClause, whereClause] = updateMatch;
                    this._executeUpdate(setClause, whereClause);
                }
            } else if (verb === 'DELETE') {
                const deleteMatch = sqlString.match(/DELETE\s+WHERE\s+(.+?)$/i);
                if (deleteMatch) {
                    const [, whereClause] = deleteMatch;
                    this._executeDelete(whereClause);
                }
            }
        }

        _executeUpdate(setClause, whereClause) {
            let rowsToUpdate = Array.from({ length: this._table.length }, (_, index) => index);
            
            if (whereClause) {
                const searchResult = advancedSearch(whereClause, {}, this._table, this._fields);
                rowsToUpdate = searchResult.indices;
            }

            const updateList = this._parseSetClause(setClause);
            
            rowsToUpdate.forEach(row => {
                Object.keys(updateList).forEach(field => {
                    this.modifyCell(row, field, updateList[field]);
                });
            });
        }

        _executeDelete(whereClause) {
            if (!whereClause) return;
            
            const searchResult = advancedSearch(whereClause, {}, this._table, this._fields);
            const rowsToDelete = searchResult.indices.sort((a, b) => b - a);
            
            rowsToDelete.forEach(row => {
                this.removeRow(row);
            });
        }

        _parseSetClause(setClause) {
            const updateList = {};
            const fields = setClause.split(',');
            
            for (let i = 0; i < fields.length; i++) {
                const parts = fields[i].trim().split('=');
                if (parts.length === 2) {
                    const key = parts[0].trim();
                    let value = parts[1].trim();
                    value = value.replace(/^['"](.*)['"]$/, '$1');
                    updateList[key] = value;
                }
            }
            
            return updateList;
        }

        _parseOrderByClause(orderByClause) {
            const fieldClauses = orderByClause.split(/\s*,\s*/);
            const fields = [];
            const orders = [];

            for (let i = 0; i < fieldClauses.length; i++) {
                const fieldClause = fieldClauses[i].trim();
                let order = false;
                let fieldName = fieldClause;

                if (fieldClause.toUpperCase().endsWith(' DESC')) {
                    order = true;
                    fieldName = fieldClause.substring(0, fieldClause.length - 5).trim();
                } else if (fieldClause.toUpperCase().endsWith(' ASC')) {
                    fieldName = fieldClause.substring(0, fieldClause.length - 4).trim();
                }

                fields.push(fieldName);
                orders.push(order);
            }

            return { fields: fields, desc: orders };
        }

        // Non-Mutating Methods (return new values)
        getCell(rowIndex, field) {
            try {
                const index = this._findFieldIndex(field);
                if (index !== false && rowIndex >= 0 && rowIndex < this._table.length) {
                    return this._table[rowIndex][index];
                }
            } catch (e) {
                return undefined;
            }
            return undefined;
        }

        getRow(rowIndex) {
            if (rowIndex >= 0 && rowIndex < this._table.length) {
                const rowData = {};
                for (let field = 0; field < this._fields.length; field++) {
                    rowData[this._fields[field]] = this._table[rowIndex][field];
                }
                return rowData;
            }
            return null;
        }

        getColumn(field) {
            const index = this._findFieldIndex(field);
            if (index !== false) {
                const col = [];
                for (let row = 0; row < this._table.length; row++) {
                    col.push(this._table[row][index]);
                }
                return col;
            }
            return null;
        }

        length() {
            return this._table.length;
        }

        fields() {
            return copy(this._fields);
        }

        search(filter) {
            if (typeof filter === 'object' && filter.advanced) {
                const result = advancedSearch(
                    filter.query, 
                    filter.queryFunctions || {}, 
                    this._table, 
                    this._fields
                );
                return new DataMaster(result.table, copy(this._fields), this._options);
            }
            
            // Simple search implementation
            if (typeof filter === 'object') {
                const query = filter.query;
                let searchFields = filter.searchFields || this._fields;
                
                if (!Array.isArray(searchFields)) {
                    searchFields = [searchFields];
                }
                
                const found = [];
                
                for (let r = 0; r < this._table.length; r++) {
                    for (let f = 0; f < searchFields.length; f++) {
                        const fieldIndex = this._findFieldIndex(searchFields[f]);
                        if (fieldIndex !== false) {
                            const cellValue = this._table[r][fieldIndex];
                            if (cellValue != null && 
                                cellValue.toString().toLowerCase()
                                    .indexOf(query.toString().toLowerCase()) > -1) {
                                found.push(this._table[r]);
                                break;
                            }
                        }
                    }
                }
                
                return new DataMaster(found, copy(this._fields), this._options);
            }
            
            return this.clone();
        }

        clone() {
            return new DataMaster(copy(this._table), copy(this._fields), this._options);
        }

        select(queryString = "*") {
            return this.query(`SELECT ${queryString}`);
        }

        // Pure Serialization Methods
        toRecordset() {
            return recordtableToRecordset({
                table: this._table,
                fields: this._fields
            });
        }

        toTable(options = {}) {
            if (options.includeHeaders) {
                return [this._fields, ...this._table];
            }
            return copy(this._table);
        }

        toCsv(options = {}) {
            return createCSV({
                table: this._table,
                fields: this._fields
            }, options);
        }

        // Legacy compatibility methods
        debug(consoleMode = false) {
            const newline = consoleMode ? '\r\n' : '<br>';
            const space = consoleMode ? ' ' : '&nbsp;';
            
            const lPad = (value, length) => {
                if (typeof value === 'number') { 
                    value = value.toString(); 
                }
                if (typeof value !== 'string') {
                    value = new Array(length + 1).join(space);
                } else {
                    if (value.length < length) {
                        for (let c = value.length; c < length; c++) {
                            value += space;
                        }
                    }
                }
                return value;
            };

            const pads = [];
            for (let i = 0; i < this._fields.length; i++) {
                pads[i] = this._fields[i].length;      
            }
            
            for (let r = 0; r < this._table.length; r++) {
                for (let c = 0; c < this._fields.length; c++) {
                    let val = this._table[r][c];
                    if (val === true) { val = 'true'; }
                    else if (val === false) { val = 'false'; }
                    else if (val === null) { val = 'null'; }
                    else if (typeof val === 'undefined') { val = 'undefined'; }
                    if (val.toString().length > pads[c]) { 
                        pads[c] = val.toString().length; 
                    }
                } 
            }

            let out = newline;
            out += '--|';
            for (let f = 0; f < this._fields.length; f++) {
                out += lPad(this._fields[f], pads[f]) + '|';
            }
            out += newline;
            
            for (let row = 0; row < this._table.length; row++) {
                out += row + (row < 10 ? ' |' : '|');
                for (let col = 0; col < this._table[row].length; col++) {
                    let val = this._table[row][col];
                    if (val === true) { val = 'true'; }
                    else if (val === false) { val = 'false'; }
                    else if (val === null) { val = 'null'; }
                    else if (typeof val === 'undefined') { val = 'undefined'; }
                    out += lPad(val, pads[col]) + '|';
                }
                out += newline;
            }
            
            return out;
        }

        print(consoleMode = false) {
            return this.debug(consoleMode);
        }
    }

    /******* TABLE GENERATOR CLASS (Embedded) **********************************************************/

    class TableGenerator {
        constructor() {
            this.libraryData = {};
            if (TableGenerator.defaultLibrary && typeof TableGenerator.defaultLibrary === "object") {
                this.libraryData = TableGenerator.defaultLibrary;
            }
        }

        loremIpsum(wordCount) {
            const loremWords = [
                "Lorem", "ipsum", "dolor", "sit", "amet", "consectetur",
                "adipiscing", "elit", "sed", "do", "eiusmod", "tempor",
                "incididunt", "ut", "labore", "et", "dolore", "magna",
                "aliqua", "Ut", "enim", "ad", "minim", "veniam", "quis",
                "nostrud", "exercitation", "ullamco", "laboris", "nisi",
                "ut", "aliquip", "ex", "ea", "commodo", "consequat",
                "Duis", "aute", "irure", "dolor", "in", "reprehenderit",
                "in", "voluptate", "velit", "esse", "cillum", "dolore",
                "eu", "fugiat", "nulla", "pariatur", "Excepteur",
                "sint", "occaecat", "cupidatat", "non", "proident",
                "sunt", "in", "culpa", "qui", "officia", "deserunt",
                "mollit", "anim", "id", "est", "laborum"
            ];
            
            if (wordCount < 1) {
                return "";
            }
            
            const result = [];
            for (let i = 0; i < wordCount; i++) {
                result.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
            }
            return result.join(" ") + ".";
        }

        getLibraryValue(key, columnName, errors) {
            if (!this.libraryData[key]) {
                errors.push("Library key '" + key + "' not found for column '" + columnName + "'.");
                return "";
            }
            
            if (typeof this.libraryData[key] === "object" && this.libraryData[key].type === "composite") {
                return this.generateAutoValue(this.libraryData[key], columnName, [], [], errors);
            }
            
            if (!Array.isArray(this.libraryData[key]) || this.libraryData[key].length === 0) {
                errors.push("Library key '" + key + "' is empty or not an array for column '" + columnName + "'.");
                return "";
            }
            
            return this.libraryData[key][Math.floor(Math.random() * this.libraryData[key].length)];
        }

        generateAutoValue(autoGenSettings, columnName, currentRow, fullTable, errors) {
            if (!autoGenSettings.type) {
                errors.push("Missing 'type' in autoGenerate for column '" + columnName + "'.");
                return "";
            }
            
            if (autoGenSettings.type === "library") {
                return this.getLibraryValue(autoGenSettings.value, columnName, errors);
            }
            
            if (autoGenSettings.type === "loremIpsum") {
                if (typeof autoGenSettings.min !== "number" || typeof autoGenSettings.max !== "number") {
                    errors.push("'loremIpsum' type requires 'min' and 'max' values in column '" + columnName + "'.");
                    return "";
                }
                if (autoGenSettings.min > autoGenSettings.max) {
                    errors.push("'min' cannot be greater than 'max' in autoGenerate for column '" + columnName + "'.");
                    return "";
                }
                const wordCount = Math.floor(Math.random() * (autoGenSettings.max - autoGenSettings.min + 1)) + autoGenSettings.min;
                return this.loremIpsum(wordCount);
            }
            
            if (autoGenSettings.type === "number") {
                if (typeof autoGenSettings.min !== "number" || typeof autoGenSettings.max !== "number") {
                    errors.push("Invalid or missing 'min'/'max' in autoGenerate for column '" + columnName + "'.");
                    return "";
                }
                if (autoGenSettings.min > autoGenSettings.max) {
                    errors.push("'min' cannot be greater than 'max' in autoGenerate for column '" + columnName + "'.");
                    return "";
                }
                return Math.floor(Math.random() * (autoGenSettings.max - autoGenSettings.min + 1)) + autoGenSettings.min;
            }
            
            if (autoGenSettings.type === "random") {
                if (!autoGenSettings.length || !autoGenSettings.characters) {
                    errors.push("'random' type requires 'length' and 'characters' in column '" + columnName + "'.");
                    return "";
                }
                let result = "";
                for (let i = 0; i < autoGenSettings.length; i++) {
                    result += autoGenSettings.characters[Math.floor(Math.random() * autoGenSettings.characters.length)];
                }
                return result;
            }
            
            if (autoGenSettings.type === "composite") {
                if (!Array.isArray(autoGenSettings.patterns) || autoGenSettings.patterns.length === 0) {
                    errors.push("'patterns' must be a non-empty array in autoGenerate for column '" + columnName + "'.");
                    return "";
                }
                const pattern = autoGenSettings.patterns[Math.floor(Math.random() * autoGenSettings.patterns.length)];
                let result = "";
                for (let k = 0; k < pattern.length; k++) {
                    const part = pattern[k];
                    if (!part.type) {
                        errors.push("Missing 'type' in pattern part for column '" + columnName + "'.");
                        return "";
                    }
                    if (part.type === "library") {
                        result += this.getLibraryValue(part.value, columnName, errors);
                    } else if (part.type === "static") {
                        result += part.value || "";
                    } else if (part.type === "field") {
                        const fieldIndex = fullTable[0] ? fullTable[0].indexOf(part.value) : -1;
                        if (fieldIndex === -1) {
                            errors.push("Referenced field '" + part.value + "' not found for column '" + columnName + "'.");
                            return "";
                        }
                        result += currentRow[fieldIndex] || "";
                    } else if (part.type === "list") {
                        result += part.value[Math.floor(Math.random() * part.value.length)];
                    } else if (part.type === "random") {
                        if (!part.length || !part.characters) {
                            errors.push("'random' part must have 'length' and 'characters' properties in column '" + columnName + "'.");
                            return "";
                        }
                        for (let j = 0; j < part.length; j++) {
                            result += part.characters[Math.floor(Math.random() * part.characters.length)];
                        }
                    } else if (part.type === "number") {
                        if (typeof part.min !== "number" || typeof part.max !== "number") {
                            errors.push("'number' part must have 'min' and 'max' properties in column '" + columnName + "'.");
                            return "";
                        }
                        if (part.min > part.max) {
                            errors.push("'min' cannot be greater than 'max' in number part for column '" + columnName + "'.");
                            return "";
                        }
                        result += Math.floor(Math.random() * (part.max - part.min + 1)) + part.min;
                    } else {
                        errors.push("Unsupported part type '" + part.type + "' in column '" + columnName + "'.");
                        return "";
                    }
                }
                return result;
            }
            
            errors.push("Unsupported autoGenerate type '" + autoGenSettings.type + "' for column '" + columnName + "'.");
            return "";
        }

        buildErrorTable(errors) {
            const table = [];
            table.push(["Errors"]);
            for (let i = 0; i < errors.length; i++) {
                table.push([errors[i]]);
            }
            return table;
        }

        generate(template, customLibrary) {
            const errors = [];
            if (!template || typeof template !== "object") {
                errors.push("Invalid or missing template.");
                return this.buildErrorTable(errors);
            }
            
            if (customLibrary && typeof customLibrary === "object") {
                this.libraryData = Object.assign(this.libraryData, customLibrary);
            }
            
            const settings = template.settings || {};
            const numRows = settings.rows || 10;
            const includeHeaders = settings.includeHeaders || false;
            const indexSettings = settings.index || null;
            const tmpl = template.template;
            
            if (!tmpl || typeof tmpl !== "object") {
                errors.push("Invalid template structure in provided template.");
                return this.buildErrorTable(errors);
            }
            
            let columns = Object.keys(tmpl);
            let indexName = "";
            let startIndex = 1;
            
            if (indexSettings && indexSettings.name) {
                indexName = indexSettings.name;
                startIndex = Number.isInteger(indexSettings.start) ? indexSettings.start : 1;
                columns = [indexName].concat(columns);
            }
            
            const table = [];
            if (includeHeaders) {
                table.push(columns);
            }
            
            const tmplKeys = (indexSettings && indexSettings.name) ? Object.keys(tmpl) : columns;
            
            for (let i = 0; i < numRows; i++) {
                const row = [];
                if (indexSettings && indexSettings.name) {
                    row.push(startIndex + i);
                }
                for (let j = 0; j < tmplKeys.length; j++) {
                    const column = tmplKeys[j];
                    const field = tmpl[column];
                    let value = "";
                    if (field && field.autoGenerate) {
                        value = this.generateAutoValue(field.autoGenerate, column, row, table, errors);
                    } else if (field && Array.isArray(field.list) && field.list.length > 0) {
                        value = field.list[Math.floor(Math.random() * field.list.length)];
                    }
                    row.push(value);
                }
                table.push(row);
            }
            
            if (errors.length > 0) {
                return this.buildErrorTable(errors);
            }
            return table;
        }
    }

    // Static property for the default library
    TableGenerator.defaultLibrary = 
    {
        
    };

    /******* UTILITY FUNCTIONS (Public Layer 2) **********************************************************/

    const converters = {
        recordsetToTable: function(recordset) {
            return recordsetToRecordTable(recordset);
        },
        csvToTable: function(csvString, options) {
            const table = csvToTable(csvString, options);
            return {
                fields: table.length > 0 ? table[0].map((_, i) => i.toString()) : [],
                table: table
            };
        }
    };

    function generate(template) {
        const generator = new TableGenerator();
        return generator.generate(template);
    }

    /******* PUBLIC API ASSEMBLY **********************************************************/

    const jwdm = {
        DataMaster,
        TableGenerator,
        converters,
        generate
    };

    /******* UNIVERSAL EXPORT LOGIC **********************************************************/

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = jwdm; // Node.js
    } else {
        global.jwdm = jwdm; // Browser
    }

}(this || window));