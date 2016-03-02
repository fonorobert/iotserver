var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/cu.wchusbserial1420", {
  baudrate: 9600
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

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });
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
        console.log('err ' + err);
        console.log('results ' + results);
      });
    }
  });
});
