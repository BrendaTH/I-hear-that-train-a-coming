
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

var name = "";
var destination = "";
var firstTrainTime = "";
var frequency = "";

var rowCount = 0;

// Capture Button Click
$("#add-user").on("click", function(event) {
    console.log("in click event");
    // Don't refresh the page!
    event.preventDefault();
  
    // Code in the logic for storing and retrieving the most recent user.
    var name = $('#name-input').val();
    console.log("name is " + name);
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

    // Console.loging the last user's data
    console.log(sv.name);
    console.log(sv.destination);
    console.log(sv.firstTrainTime);
    console.log(sv.frequency);

    // a moment is an object
    // a duration is just a number (ie. hours, minutes, etc..)
    // .format converts a moment to a string in a particular 'format' 

    var currentTimeMoment = moment();  // get the current time in a moment object
    var currentTime = currentTimeMoment.format('HH:mm');  // convert it to a string
    // var currentTime = moment().format('HH:mm');
    console.log('current time is: ' + currentTime);

    // want the difference in minutes between first train and now
    var timeDiff = moment(currentTime, 'HH:mm').diff(moment(sv.firstTrainTime, 'HH:mm'));
    var duration = moment.duration(timeDiff);
    var minSinceFirstTrainTime = duration.asMinutes();

    // if first train left yesterday do extra calc to handle the wrap in 24 hour time
    if (minSinceFirstTrainTime < 0 ) {
        // handle the wrap condition
        var minSinceFirstTrainTime = (24 * 60) + minSinceFirstTrainTime;
    }

    var minutesAway;
    // ok two cases
    if (parseInt(sv.frequency) > minSinceFirstTrainTime) {
        // 1) no trains have arrived yet
        minutesAway = parseInt(sv.frequency) - minSinceFirstTrainTime;
    } else {
        // 2) at least one train has arrived already
        minutesAway = parseInt(sv.frequency) - (minSinceFirstTrainTime % parseInt(sv.frequency));
    }
    console.log("difference in time is: " + minSinceFirstTrainTime);
    console.log("minutes away " + minutesAway);

    var arrivalTimeMoment = moment(currentTimeMoment).add(minutesAway, 'minutes');
    var arrivalTime = arrivalTimeMoment.format('HH:mm');
    console.log("arrival time " + arrivalTime);
    console.log(" ");
    console.log(" ");
    

    var newRow = $("<tr>").append(
        $("<th>").text(++rowCount),
        $("<td>").text(sv.name),
        $("<td>").text(sv.destination),
        $("<td>").text(sv.frequency),
        $("<td>").text(arrivalTime),
        $("<td>").text(minutesAway),
    );
    // Append the new row to the table
    $("#schedule-table > tbody").append(newRow);

    // Handle the errors
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

