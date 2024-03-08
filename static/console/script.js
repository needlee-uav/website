console.log('Connecting...');
io.set('transports', ['websocket']);
var socket = io.connect(
  window.location.protocol + "//" + document.domain + ":" + location.port
);
socket.on("connect", function () {
  console.log("Connected...!", socket.connected);
  console.log(socket);
  socket.emit("update_sid");
});

socket.on("init_marker", function (data) {
  console.log(data)
  if (data.id == "") {
    console.log("No vehicles connected");
    return
  }
  window.document.getElementById('vehicle_id').innerText = data.id;
  if (data.test_mode) {
    window.document.getElementById('test_mode').style = "display: inline";
    displayReadyButton();
  }
  window.document.getElementById('params').style = "display: inline";
  homeCoords = [data.lat, data.lon];
  moveMap(data.lat, data.lon);
  moveMarker(data)
});

socket.on("update_vehicle", function (data) {
  updateParams(data.params)
  moveMarker(data.params)
  updateHorizont(data.params.roll, data.params.pitch)
  photo.setAttribute("src", data.image);
});

function updateHorizont(roll, pitch) {
  var attitude = window.document.getElementById("attitude-dir-box");
  pitch = 50 + pitch*1.3;
  roll = 180 + roll;
  attitude.style.background = `
  linear-gradient(
    ${roll}deg,
    #6699FF 0%,
    #6699FF ${pitch}%,
    #996600 ${pitch}%,
    #996600 100%
  )`;
}        

function setReady() {
  const MODES = new Map();
  MODES.set('Soft takeoff and land no GPS', 1);
  MODES.set('Test offboard commands', 2);
  MODES.set('Test GPS route navigation', 3);
  MODES.set('Test emergency', 4);
  MODES.set('Test camera streaming', 5);
  MODES.set('Test capturing', 6);
  MODES.set('Test following', 7);
  
  var test_mode = window.document.getElementById("test_mode_name").innerText;
  console.log(MODES.get(test_mode))
  window.document.getElementById("ready_button_container").style.display = "none";
  var route = [];
  if (GPS_POINTS != []) {
    route = GPS_POINTS.map(point => point.coords);
  }
  socket.emit("ready", {"test_mode": MODES.get(test_mode), "home": homeCoords, "route": route});
}

