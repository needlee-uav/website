
const img_path = `${window.location.href.replace('console', '')}static/console/`;
const GPS_POINT_ICONS = [
    `${img_path}n1.png`,
    `${img_path}n2.png`,
    `${img_path}n3.png`,
    `${img_path}n4.png`
];
console.log(GPS_POINT_ICONS)
var LeafIconNum = L.Icon.extend({options: {iconSize: [24, 24], iconAnchor: [12, 12]}});
class Point {
    constructor(icon_url, coords, map_point) {
        this.map_point = map_point;
        this.icon_url = icon_url;
        this.coords = coords;
        this.active = false;
    }
}
var GPS_POINTS = [];
var pickPoints = false;
var routeLine = false;
var startLine = false;
var endLine = false;
var homeCoords = false;
function addNavPoint(coords) {
    if (GPS_POINTS.length != 0 && !gpsValidateDistance(GPS_POINTS[GPS_POINTS.length-1].coords[0], GPS_POINTS[GPS_POINTS.length-1].coords[1], coords[0], coords[1])) {
        return
    }
    if (GPS_POINTS.length < GPS_POINT_ICONS.length) {
        GPS_POINTS.push(new Point(
            GPS_POINT_ICONS[GPS_POINTS.length],
            coords,
            new L.Marker(coords, {
                icon: new LeafIconNum({
                    iconUrl: GPS_POINT_ICONS[GPS_POINTS.length]
                })
            })
        ));
        GPS_POINTS[GPS_POINTS.length - 1].map_point.addTo(map);
    } else {
        map.removeLayer(GPS_POINTS[0].map_point);
        GPS_POINTS.shift();
        GPS_POINTS.push(new Point(
            GPS_POINT_ICONS[0],
            coords,
            new L.Marker(coords, {
                icon: new LeafIconNum({
                    iconUrl: GPS_POINT_ICONS[0]
                })
            })
        ));
        for (var i = 0; i < GPS_POINT_ICONS.length; i++) {
            map.removeLayer(GPS_POINTS[i].map_point);
            GPS_POINTS[i].map_point = new L.Marker(GPS_POINTS[i].coords, {
                icon: new LeafIconNum({
                    iconUrl: GPS_POINT_ICONS[i]
                })
            })
            GPS_POINTS[i].map_point.addTo(map);
        }
    }
    connectPoints();
}
function connectPoints() {
    var routeList = GPS_POINTS.map(point => new L.LatLng(point.coords[0], point.coords[1]));
    var startList = [
        new L.LatLng(homeCoords[0], homeCoords[1]),
        routeList[0],
    ];
    var endList = [
        routeList[routeList.length - 1],
        new L.LatLng(homeCoords[0], homeCoords[1])
    ];
    // pointList.unshift(new L.LatLng(homeCoords[0], homeCoords[1]));
    // pointList.push(new L.LatLng(homeCoords[0], homeCoords[1]));
    if (routeLine) {
        map.removeLayer(startLine);
        map.removeLayer(endLine);
        map.removeLayer(routeLine);
    }
    routeLine = new L.Polyline(routeList, {
        color: "#33a7ff",
        weight: 3,
        opacity: 1,
        smoothFactor: 1
    });
    routeLine.addTo(map);
    startLine = new L.Polyline(startList, {
        color: "#bae1ff",
        weight: 3,
        opacity: 1,
        smoothFactor: 1
    });
    startLine.addTo(map);
    endLine = new L.Polyline(endList, {
        color: "#005fa8",
        weight: 3,
        opacity: 1,
        smoothFactor: 1
    });
    endLine.addTo(map);
}

function gpsValidateDistance(lat1, lon1, lat2, lon2) {
    const R = 6378.137;
    dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    d = R * c;
    result = d * 1000;
    if (result > 150 || result < 5) {
      return false;
    }
    return true;
}

map.on("click", (event)=> {
    if (pickPoints && event.containerPoint.y > 100) {
        if (gpsValidateDistance(homeCoords[0], homeCoords[1], event.latlng.lat , event.latlng.lng)) {
            addNavPoint([event.latlng.lat , event.latlng.lng]);
        }
    }
})
