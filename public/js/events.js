$(function() {

  function loadEvents() {
    $.getJSON("/events").done(function(data) {
        data.events.forEach(function(event){
            event.allDay = false;
            console.log(event);
        	$('#calendar').fullCalendar();
        	$('#calendar').fullCalendar('renderEvent', event);
        });
    });
  }

  loadEvents();
});