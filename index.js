var usbDevice = process.argv[2];
var serialport = require("serialport");
var util = require('util');
var SerialPort = serialport.SerialPort;
var events = require('events');
var express = require('express');
var app = express();

var webRequest = new events.EventEmitter();
var serialResp = new events.EventEmitter();
var serialDone = new events.EventEmitter();

var serialPort = new SerialPort(usbDevice, {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
});

function done() {
  console.log('closing app');
  process.exit();
}

function handleData(data) {
  var sliced = data.replace(/(\r\n|\n|\r)/gm,"").split(':');
  sliced.splice(0,1);
  if (sliced.length > 0){
    switch (sliced[0]) {
      case "done":
        console.log("Operation "+sliced[1]+" completed.");
        serialDone.emit('event', sliced[1]);
        break;
      case "resp":
        console.log("Value of "+sliced[1]+" is "+sliced[2]);
        serialResp.emit('event', sliced[1], sliced[2]);
        break;
      case "serial":
        if(sliced[1] == "begin") {
          console.log("Serial connection open");
        }
      default:
        console.log("can't handle this");
        break;
    }
  }
}

// Should be changed to POST

app.get('/do/:cmd', function(req, res){
  var cmd = req.params.cmd;
  webRequest.emit('event', cmd);
  serialDone.on('event', function(doneCmd){
    res.end(JSON.stringify({completed: doneCmd}));
  });
})

app.get('/get/:metric', function(req, res){
  var metric = req.params.metric;
  webRequest.emit('event', "read"+metric);
  serialResp.on('event', function(respMetric, value){
    var response = {};
    response[respMetric] = value;
    res.end(JSON.stringify(response));
  });
})

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {handleData(data)});

  webRequest.on('event', function(content){
    serialPort.write(content.replace(/(\r\n|\n|\r)/gm,"") + "\r\n", function(err, results) {
      if(err) {
        console.log('err ' + err);
      }
      // console.log('results ' + results);
    });
  })
});

var server = app.listen(8080, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Serial peripheral handler listening at http://%s:%s", host, port)

})
