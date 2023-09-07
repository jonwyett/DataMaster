function recordSetToObject(recordSet) {
    // Validate the input is an array
    if (!Array.isArray(recordSet)) {
      return "Error: Input is not an array";
    }
  
    // Validate the array contains objects
    if (recordSet.length === 0 || typeof recordSet[0] !== 'object') {
      return "Error: Input array should contain objects";
    }
  
    // Initialize fieldNames and table variables
    var fieldNames = Object.keys(recordSet[0]);
    var table = [];
  
    // Fill the table array
    for (var i = 0; i < recordSet.length; i++) {
      var row = [];
      for (var j = 0; j < fieldNames.length; j++) {
        var fieldName = fieldNames[j];
        if (recordSet[i].hasOwnProperty(fieldName)) {
          row.push(recordSet[i][fieldName]);
        } else {
          return "Error: Inconsistent fields in recordset";
        }
      }
      table.push(row);
    }
  
    // Return the object containing fieldNames and table
    return {
      fieldNames: fieldNames,
      table: table
    };
  }
  
  var people = 
  [{
      "Email": "AdamsS@email.com",
      "ID": "1",
      "LastName": "Adams",
      "Categories": "Mailing Lists",
      "FirstName": "Samuel",
      "Tags": "Announcements, Event Invites, PressPass",
      "SPECIAL": "Foo Bar"
  }, {
      "Email": "AlabamaA@outlook.com",
      "LastName": "Alabama",
      "ID": "2",
      "Categories": "Mailing Lists",
      "FirstName": "Alice",
      "Tags": "Announcements, Event Invites, PressPass"
  }, {
      "Email": "AndersonJ@gmail.com",
      "ID": "3",
      "LastName": "Anderson",
      "Categories": "Mailing Lists",
      "FirstName": "Jacob",
      "Tags": "Announcements, Event Invites, PressPass"
  }, {
      "Email": "AlexanderBailey@email.com",
      "ID": "4",
      "LastName": "Bailey",
      "Categories": "Mailing Lists, Newspapers",
      "FirstName": "Alexander",
      "Tags": "Announcements, Event Invites, New York Times, PressPass, Washington Post"
  }, {
      "Email": "BakerB@hotmail.com",
      "ID": "5",
      "LastName": "Baker",
      "Categories": "Mailing Lists, Newspapers",
      "FirstName": "Benjamin",
      "Tags": "Announcements, Event Invites, PressPass, Washington Post"
  }, {
      "Email": "BarnesE@email.com",
      "LastName": "Barnes",
      "ID": "6",
      "Categories": "Mailing Lists",
      "FirstName": "Ethan",
      "Tags": "Announcements, Event Invites, PressPass"
  }, {
      "Email": "BellH@email.com",
      "LastName": "Bell",
      "ID": "7",
      "Categories": "Mailing Lists, Newspapers",
      "FirstName": "Harper",
      "Tags": "Announcements, Baltimore Sun, Event Invites, PressPass"
  }, {
      "Email": "BellA@email.com",
      "ID": "8",
      "LastName": "Bell",
      "Categories": "Mailing Lists",
      "FirstName": "Alexander",
      "Tags": "Announcements, Event Invites, PressPass"
  }, {
      "Email": "BennettC@hotmail.com",
      "ID": "9",
      "LastName": "Bennett",
      "Categories": "Mailing Lists",
      "FirstName": "Chloe",
      "Tags": "Announcements, Event Invites, PressPass",
      "SPECIAL": "Hello World!"
  }];
  
  var result = recordSetToObject(people);
  if (typeof result === 'string') {
    console.error(result);
  } else {
    console.log(result);
  }
  