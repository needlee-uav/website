const START_POINT = [48, 16];
var map = L.map('map', {
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false
});

var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});
map.addLayer(layer);

map.setView(START_POINT, 7);

var droneMarker = {};
var is_focus = false;
var LeafIcon = L.Icon.extend({options: {iconSize: [32, 32], iconAnchor: [16, 16]}});
var icon = new LeafIcon({iconUrl: 'https://cdn-icons-png.flaticon.com/512/399/399308.png'});
$(".leaflet-control-zoom").css("visibility", "hidden");

function moveMarker(params) {
  map.removeLayer(droneMarker);
  droneMarker = new L.Marker([params.lat, params.lon], {icon: icon, rotationAngle: params.h})
  droneMarker.addTo(map);
}

function moveMap(lat, lon) {
    map.flyTo([lat, lon], 17, {animate: true, duration: 3});
}

function updateParams(params) {
    window.document.getElementById('loc_param').innerText = `Lat: ${params.lat}°, Long: ${params.lon}°`;
    window.document.getElementById('v_param').innerText = `${params.v_m_s}m/s`;
    window.document.getElementById('h_param').innerText = `${params.h}°`;
    window.document.getElementById('alt_param').innerText = `${params.alt}m`;
}
