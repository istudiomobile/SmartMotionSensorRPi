var m = require('mraa'); //IO Library
var app = require('express')(); //Express Library
var server = require('http').Server(app); //Create HTTP instance
var io = require('socket.io')(server); //Socket.IO Library

var buttonState = 0; //set default button state

var myLed = new m.Gpio(5); //LED hooked up to digital pin 13
myLed.dir(m.DIR_OUT); //set the gpio direction to output
myLed.write(0); //write the LED state

app.get('/', function (req, res) {                  
    res.sendFile(__dirname + '/index.html'); //serve the static html file
});                                                 

io.on('connection', function(socket){
  socket.on('state', function(data){ //on incoming websocket message...
    buttonState = data; //update blink interval
    console.log(data);
    myLed.write(buttonState); //write the LED state
  });
});                                                   

server.listen(3000); //run on port 3000
