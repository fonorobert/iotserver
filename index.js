var usbDevice = process.argv[2];
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var serialPort = new SerialPort(usbDevice, {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
});

var util = require('util');

// process.stdin.resume();
// process.stdin.setEncoding('utf8');
// process.stdin.on('data', function (text) {
//   console.log('received data:', util.inspect(text));
//   if (text === 'quit\n') {
//     done();
//   } else {
//     serialPort.write(text, function(err, results) {
//       console.log('err ' + err);
//       console.log('results ' + results);
//     });
//   }
// });

  function done() {
    console.log('Now that process.stdin is paused, there is nothing more to do.');
    process.exit();
  }

  function handleData(data) {
    var sliced = data.replace(/(\r\n|\n|\r)/gm,"").split(':');
    sliced.splice(0,1);
    if (sliced.length > 0){
      switch (sliced[0]) {
        case "done":
          console.log("Operation "+sliced[1]+" completed.");
          break;
        case "resp":
          console.log("Value of "+sliced[1]+" is "+sliced[2]);
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
    // console.log(sliced);

  }

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {handleData(data)});
  // serialPort.write("ledon\n", function(err, results) {
  //   console.log('err ' + err);
  //   console.log('results ' + results);
  // });
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (text) {
    // console.log('received data:', util.inspect(text));
    if (text === 'quit\n') {
      done();
    } else {
      serialPort.write(text.replace(/(\r\n|\n|\r)/gm,"") + "\r\n", function(err, results) {
        if(err) {
          console.log('err ' + err);
        }
        // console.log('results ' + results);
      });
    }
  });
});
