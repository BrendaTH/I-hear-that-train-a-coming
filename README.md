## REPO Name: I-hear-that-train-a-coming
### Homework week 7 - a train schedule

When adding trains to the schedule board, administrators are required to submit the following:
* Train Name
* Destination 
* First Train Time -- 24 hour clock HH:mm
* Frequency -- arrival in minutes
There is user input validation on the form.

Once a minute and also on screen refresh the user data is fectched and a current train schedule is displayed. The schedule includes the following info:
* Train Name (user input)
* Destination (user input)
* Frequency of arrival in minutes (user input)
* Next arrival time (24 hour clock) (calculates from user input retrieved from database)
* The number of minutes away from next arrival (calculates from user input retrieved from database)

All times displayed in the schedule are local times.
Technology used for this app include: 
* firebase - stores the user data input through the form, and retrieves it on refresh and once per minute
* interval timer - fires once a minute and updates the train schedule
* moment - used to calculate Minutes Away and Next Arrival Time.

## Future Enhancements
* Make the schedule into a bootstrap grid
s
To get started go [https://brendath.github.io/I-hear-that-train-a-coming/](https://brendath.github.io/I-hear-that-train-a-coming)


