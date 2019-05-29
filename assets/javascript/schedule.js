
// Initialize Firebase

var config = {
apiKey: "AIzaSyDJ5iP8AyZUcg_EzCdl1775eoFgsewuD_8",
authDomain: "test-8a800.firebaseapp.com",
databaseURL: "https://test-8a800.firebaseio.com",
projectId: "test-8a800",
storageBucket: "test-8a800.appspot.com",
messagingSenderId: "71632803599"
};
// Create a variable to reference the database
// var database = ...
firebase.initializeApp(config);
// Create a variable to reference the database
var database = firebase.database();

var intervalId;

/**************************************** */
// Table Object
var tbl = {
    rowCount: 0,

    getMinutesAway: function (firstTrainTime, frequency, currentTimeMoment) {
        // calc minutes since first train time
        var minSinceFirstTrainTime = this.getMinutesSinceFirstTrain(currentTimeMoment, firstTrainTime);
        var minutesAway;
        // two cases for minutes away
        if (parseInt(frequency) > minSinceFirstTrainTime) {
            // 1) no trains have arrived yet
            minutesAway = parseInt(frequency) - minSinceFirstTrainTime;
        } else {
            // 2) at least one train has arrived already
            minutesAway = parseInt(frequency) - (minSinceFirstTrainTime % parseInt(frequency));
        }

        console.log("difference in time is: " + minSinceFirstTrainTime);
        return minutesAway;
    },

    getArrivalTime: function (currentTimeMoment, minutesAway) {
        var arrivalTimeMoment = moment(currentTimeMoment).add(minutesAway, 'minutes');
        var arrivalTime = arrivalTimeMoment.format('HH:mm');
        return arrivalTime;
    },

    getMinutesSinceFirstTrain: function (currentTimeMoment, firstTrainTime) {
        var currentTime = currentTimeMoment.format('HH:mm');  // convert it to a string
        // var currentTime = moment().format('HH:mm');
        console.log('current time is: ' + currentTime);

        // want the difference in minutes between first train and now
        var timeDiff = moment(currentTime, 'HH:mm').diff(moment(firstTrainTime, 'HH:mm'));
        var duration = moment.duration(timeDiff);
        var minSinceFirstTrainTime = duration.asMinutes();

        // if first train left yesterday do extra calc to handle the wrap in 24 hour time
        if (minSinceFirstTrainTime < 0 ) {
            // handle the wrap condition
            minSinceFirstTrainTime = (24 * 60) + minSinceFirstTrainTime;
        }
        return minSinceFirstTrainTime;
    }, 

    buildTableRow: function (row) {
        var rowHead = $("<th>").text(++tbl.rowCount);
        rowHead.attr('scope', 'row');
         
        var newRow = $("<tr>").append(
            rowHead,
            $("<td>").text(row.name),
            $("<td>").text(row.destination),
            $("<td>").text(row.frequency),
            $("<td>").text(row.arrivalTime),
            $("<td>").text(row.minutesAway),
        );
        // Append the new row to the table
        $("#schedule-table > tbody").append(newRow);
    },

}  // end tbl object

//for each entry in the table
function tblUpdate() {
    database.ref().once("value", function(snapshot) {

        // storing the snapshot.val() in a variable for convenience
        var sv = snapshot.val();

        // first remove any rows and return rowCount to zero
        while (tbl.rowCount > 0) {
            document.getElementById("schedule-table").deleteRow(tbl.rowCount--);
        }

        // create the tableRow object
        var tableRow = {};
        // walk through each item from the database and create a table row then display it
        for (var key in sv) {
            console.log("key: " + key);
            var myObj = sv[key];
            tableRow.frequency = myObj['frequency'];
            tableRow.destination = myObj['destination'];
            tableRow.name = myObj['name'];
            var firstTrainTime = myObj['firstTrainTime'];

            var currentTimeMoment = moment();  // get the current time in a moment object
            tableRow.minutesAway = tbl.getMinutesAway(firstTrainTime, tableRow.frequency, currentTimeMoment);
            tableRow.arrivalTime = tbl.getArrivalTime(currentTimeMoment, tableRow.minutesAway);

            // Console.loging the train data
            console.log('first train time: ' + firstTrainTime);
            console.log('from getDatabase: ' + tableRow.name + " " + tableRow.destination + " " + tableRow.frequency + " " + tableRow.arrivalTime + " " + tableRow.minutesAway);
            // build a new row
            tbl.buildTableRow(tableRow);
        }

      });
}

$(document).ready(function() {
    // start the 60 second timer to redo the table 
    intervalId = setInterval(tblUpdate, 60000);
    // Capture Button Click
    $("#add-user").on("click", function(event) {
        // Don't refresh the page!
        event.preventDefault();
        
        // make sure the timer doesn't fire until we get through here
        // so stop and restart the interval timer
        // 60 seconds from now should be plenty of time to get through updating table
        clearInterval(intervalId);
        intervalId = setInterval(tblUpdate, 60000);

        // Code in the logic for storing and retrieving the most recent user.
        var name = $('#name-input').val();
        var destination = $('#destination-input').val();
        var firstTrainTime = $('#first-train-time-input').val();
        var frequency = $('#frequency-input').val();

        // Save new value to Firebase
        database.ref().push({
            name: name,
            destination: destination,
            firstTrainTime: firstTrainTime,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        // clear input fields
        $('#name-input').val("");
        $('#destination-input').val("");
        $('#first-train-time-input').val("");
        $('#frequency-input').val("");

    });

    // Firebase watcher .on("child_added"
    database.ref().on("child_added", function(snapshot) {
        // storing the snapshot.val() in a variable for convenience
        var sv = snapshot.val();
        // Console.loging the train data
        console.log('from firebase name: ' + sv.name);
        console.log('destination: ' + sv.destination);
        console.log('first train time: ' + sv.firstTrainTime);
        console.log('frequency: ' + sv.frequency);
        var tableRow = {};
        tableRow.name = sv.name;
        tableRow.destination = sv.destination;
        tableRow.frequency = sv.frequency;

        // a moment is an object
        // a duration is just a number (ie. hours, minutes, etc..)
        // .format converts a moment to a string in a particular 'format' 
        var currentTimeMoment = moment();  // get the current time in a moment object

        tableRow.minutesAway = tbl.getMinutesAway(sv.firstTrainTime, sv.frequency, currentTimeMoment);
        tableRow.arrivalTime = tbl.getArrivalTime(currentTimeMoment, tableRow.minutesAway);

        console.log(" "); // bjt delete this
        tbl.buildTableRow(tableRow);
    
        // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
});
