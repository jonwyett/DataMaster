class DataMaster {
    // The constructor becomes simple. It assumes data is pre-formatted.
    constructor(table, fields) {
        this._table = table || [];
        this._fields = fields || [];
        this.valid = true; // etc.
    }

    // --- STATIC FACTORY METHODS ---

    static fromRecordset(recordset) {
        if (!recordset || recordset.length === 0) {
            return new DataMaster([], []);
        }
        const fields = Object.keys(recordset[0]);
        const table = recordset.map(row => fields.map(field => row[field]));
        return new DataMaster(table, fields);
    }

    static fromTable(tableData, options = {}) {
        let table = JSON.parse(JSON.stringify(tableData)); // deep copy
        let headers = [];

        if (options.headersInFirstRow) {
            headers = table.shift(); // Remove first row and use as headers
        } else if (options.headers) {
            headers = options.headers;
        } else {
            // Create default numbered headers
            headers = table[0] ? table[0].map((_, i) => `col_${i + 1}`) : [];
        }
        
        return new DataMaster(table, headers);
    }

    static fromCsv(csvString, options = {}) {
        // Your existing, excellent csvToTable logic would go here...
        // ...it would use the options to determine the separator, line endings, etc.
        const tableWithOrWithoutHeaders = csvToTable(csvString, options);
        
        // ...then it would call fromTable to finish the job. We are reusing our own logic!
        return Data.fromTable(tableWithOrWithoutHeaders, options);
    }
    
    // ... all your other instance methods (sort, limit, etc.) would go here
}