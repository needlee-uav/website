const MODES = new Map();
MODES.set('Test mode', 0);
MODES.set('Soft takeoff and land no GPS', 1);
MODES.set('Test offboard commands', 2);
MODES.set('Test GPS route navigation', 3);
MODES.set('Test emergency', 4);
MODES.set('Test camera streaming', 5);
MODES.set('Test capturing', 6);
MODES.set('Test following', 7);

var vehicleConnected = false

console.log('Connecting...');
var socket = io.connect(
  window.location.protocol + "//" + document.domain + ":" + location.port, {
    upgrade: false,
    transports: ["websocket"]
  }
);

socket.on("connect", function () {
  console.log("Connected...!", socket.connected);
  socket.emit("update_sid");
});

socket.on("init_marker", function (data) {
  console.log(data)
  if (data.id == "") {
    console.log("No vehicles connected");
    return
  }
  vehicleConnected = true
  window.document.getElementById('vehicle_id').innerHTML = window.document.getElementById('vehicle_id').innerHTML.toString().replace("None", data.id);
  if (data.test_mode) {
    window.document.getElementById('test_mode').style = "display: inline";
  }
  homeCoords = [data.lat, data.lon];
  moveMap(data.lat, data.lon);
  moveMarker(data)
});

socket.on("update_vehicle", function (data) {
  updateParams(data.params)
  moveMarker(data.params)
  updateHorizont(data.params.roll, data.params.pitch)
  processDebugData()
  photo.setAttribute("src", data.image);
  if (data.debug != "") {
    debugData.push(data.debug)
  }
});

function updateHorizont(roll, pitch) {
  var attitude = window.document.getElementById("attitude-dir-box");
  pitch = 50 + pitch*1.3;
  roll = 180 + roll;
  attitude.style.background = `
  linear-gradient(
    ${roll}deg,
    #6883DB 0%,
    #6883DB ${pitch}%,
    #937676 ${pitch}%,
    #937676 100%
  )`;
}

function setReady() {
  pickPoints = false
  var test_mode = window.document.getElementById("test-mode-line").innerText;
  if (test_mode == "Test mode" || window.document.getElementById("vehicle_id").innerText.toString().indexOf("None") != -1) { return }
  test_mode = test_mode.replace("Test mode - ", "")
  window.document.getElementById("ready_button_container").style.display = "none";
  var route = [];
  if (GPS_POINTS != []) {
    route = GPS_POINTS.map(point => point.coords);
  }
  const params = {
    "test_mode": MODES.get(test_mode),
    "home": homeCoords,
    "route": route,
    "enable_camera": window.document.getElementById("enable-camera").checked
  }
  window.document.getElementById("main-button").innerText = "Land"
  window.document.getElementById("main-button").onclick = emergencyLand
  socket.emit("ready", params);
}

function emergencyLand() {
  const params = {
    "type": "web_client"
  }
  socket.emit("emergency", params);
}

function pickTestMode(option) {
  let display = window.document.getElementById("test-mode-options").style.display == "none" ? "inline" : "none"
  window.document.getElementById("test-mode-options").style.display = display
  if (display == "none") {
    window.document.getElementById("test-mode-line").style.marginBottom = "0px"
  } else {
    window.document.getElementById("test-mode-line").style.marginBottom = "10px"
  }
  if (option != undefined) {
    window.document.getElementById("test-mode-line").innerText = `Test mode - ${option}`
    window.document.getElementById("mode_param").innerText = `Test ${MODES.get(option)}`
    window.document.getElementById("settings").style.display = "none"
    pickPoints = option == "Test GPS route navigation" ? true : false
    console.log(pickPoints)
  } else {
    window.document.getElementById("test-mode-line").innerText = "Test mode"
  }
}

function processDebugData() {
  if (debugData.length > 0) {
    const mobileFontSize = mobile ? `style="font-size: 14px;"` : ""
    if (debugData[0] == "LOGGER: ready") {
      window.document.getElementById("log-screen").innerHTML = `
      <p ${mobileFontSize} class="log-line">NEEDLEE FLIGHT LOG</p>
      <p ${mobileFontSize} class="log-line">==================</p>
      `
    }
    const line = `<p ${mobileFontSize} class="log-line">${debugData[0]}</p>`
    debugData.shift()
    const logScreen = window.document.getElementById("log-screen")
    logScreen.insertAdjacentHTML( 'beforeend', line )
    logScreen.scrollIntoView(false)
    processDebugData()
  }
}
