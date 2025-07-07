// Some raw, messy data from an API
const rawData = [/* ... */];

// Step 1: Use the DataMaster "workshop" to build the dataset we need.
// The chainable API shines here because we're doing many stateful transformations.
const dm = DataMaster.fromRecordset(rawData)
    .removeColumn('internal_id')
    .addColumn('Profit', (row) => row.revenue - row.cost) // Hypothetical calculated column
    .replace('special_order', 'Special Order', 'orderType')
    .sort('Date');

// We're done building. Get the final, clean dataset.
const cleanDataForReporting = dm.exportAs('recordset');


// Step 2: Now use the simple query "front door" to ask questions of our clean data.
// Each of these is a simple, independent, one-line operation.
const canadianReports = jwdm.query(cleanDataForReporting, { 
    where: "Country='Canada'" 
});

const highValueReports = jwdm.query(cleanDataForReporting, { 
    where: "Profit>'5000'" 
});

const specificClientReport = jwdm.query(cleanDataForReporting, {
    where: "clientName='Acme Corp' AND Order Type='Special Order'"
});