var m = require('mraa'); //IO Library
var HTMLParser = require('node-html-parser');
var fs = require('fs');
var n = require('os').networkInterfaces()
var app = require('express')(); //Express Library
var server = require('http').Server(app); //Create HTTP instance
var io = require('socket.io')(server); //Socket.IO Library

var buttonState = 0; //set default button state

var myLed = new m.Gpio(5); //LED hooked up to digital pin 5
var statusLed = new m.Gpio(13); // LED hooked up to digital pin 13
myLed.dir(m.DIR_OUT); //set the gpio direction to output
statusLed.dir(m.DIR_OUT); //set the gpio direction to output
myLed.write(0); //write the LED state
statusLed.write(0); //write the LED state




var myIp = function () {
  var ip = []
  for(var k in n) {
    var inter = n[k]
    for(var j in inter)
      if(inter[j].family === 'IPv4' && !inter[j].internal)
        return new Promise ((resolve, reject) => {
          resolve(inter[j].address);
        });
  }
}

myIp().then(ip => {
  console.log(ip);
  fs.readFile('index.html', 'utf8', (err, data) => {
    if (err) throw err;
    var root = HTMLParser.parse(data, {
      lowerCaseTagName: false,
      script: true,
      style: true,
    });
    var mainContainer = root.querySelector('.container');
    mainContainer.insertAdjacentHTML('afterbegin', '<p class="invisible">http://' + ip + ':3000</p>');
    //console.log(root);
    fs.writeFile('index.html', root, function(err) {
      if(err) throw err;
      console.log("file saved!");
      statusLed.write(1); // Lets user know html file is ready.
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
    });
  });
});

