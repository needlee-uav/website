# gunicorn -b :8080 --worker-class eventlet -w 1 app:app
# kill -9 $(lsof -t -i:"8080")
import eventlet
import eventlet.wsgi
eventlet.monkey_patch()
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import cv2 as cv
import base64
import numpy as np

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app)

DRONES = {
    "UAV-1234": "1488",
    "UAV-0001": "1001"
}

header_style = {
    "show": "display: inline; overflow: hidden;",
    "hide": "display: none;"
}

class AppData:
    debug = []
    client = ""
    vehicle = ""
    marker = {"lat": 0, "lon": 0, "alt": 0}
    id = ""

global appData
appData = AppData()

@socketio.on("update_sid")
def update_sid():
    global appData
    appData.client = request.sid
    print(f'client sid updated: {appData.client}')
    if appData.marker["lat"] != 0:
        emit("init_marker", {"id": appData.id, "lat": appData.marker["lat"], "lon": appData.marker["lon"], "alt": appData.marker["alt"]}, room=appData.client)

@socketio.on("connect")
def test_connect():
    emit("conn_success", {"data": "Connected"})

@socketio.on("disconnect")
def disconnect():
    global appData
    if request.sid == appData.vehicle:
        appData.id = ""

@socketio.on("ready")
def ready(data):
    global appData
    if appData.vehicle != "":
        print(data)
        emit("ready", data, room=appData.vehicle)

@socketio.on("emergency")
def emergency(data):
    emit("emergency", data, room=appData.vehicle)

@socketio.on("vehicle_sign_in")
def vehicle_sign_in(data):
    if data["id"] in DRONES.keys():
        global appData
        appData.vehicle = request.sid
        appData.id = data["id"]
        appData.marker["lat"] = data["lat"]
        appData.marker["lon"] = data["lon"]
        appData.marker["alt"] = data["alt"]
        print(f'vehicle sid updated: {appData.vehicle}')
        emit("init_marker", data, room=appData.client)

def base64_resize(base64_string, shape):
    im_bytes = base64.b64decode(base64_string)
    im_arr = np.frombuffer(im_bytes, dtype=np.uint8)
    img = cv.imdecode(im_arr, flags=cv.IMREAD_COLOR)
    img_r = cv.resize(img, shape, interpolation = cv.INTER_AREA)
    im_bytes = cv.imencode('.jpg', img_r)[1].tobytes()
    return base64.encodebytes(im_bytes).decode("utf-8")


@socketio.on("stream")
def stream(data):
    global appData
    if data["debug"] != "":
        # Refresh log
        if(data["debug"] == "LOGGER: log OK"): appData.debug = []
        appData.debug.append(data["debug"])
    frame = base64_resize(data["frame"], (data["shape"]["w"], data["shape"]["h"]))
    emit("update_vehicle", {"image": "data:image/jpeg;base64," + frame, "params": data["log"], "debug": data["debug"]}, room=appData.client)

@app.route("/")
def home():
    return render_template("index.html", section="home.html", header_style=header_style["show"])

@app.route("/faq")
def faq():
    return render_template("index.html", section="faq.html", header_style=header_style["hide"])

@app.route("/contact")
def contact():
    return render_template("index.html", section="contact.html", header_style=header_style["hide"])

@app.route("/investors")
def investors():
    return render_template("index.html", section="investors.html", header_style=header_style["show"])

@app.route("/products")
def products():
    return render_template("index.html", section="products.html", header_style=header_style["hide"])

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            if request.form["vehicle_key"] == DRONES[request.form["vehicle_id"]]:
                return render_template("console.html")
            else:
                return render_template("login.html", login_status=False)
        except:
            return render_template("login.html", login_status=False)
    else:
        return render_template("login.html", login_status=True)

@app.route("/console")
def console():
    return render_template("console.html", debug_data = appData.debug)

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080)
