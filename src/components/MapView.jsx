import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "./MapView.css";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const customIcon = L.divIcon({
  className: "custom-marker-icon", 
  iconSize: [20, 20],
});

function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function MapView({ pgs, userLocation }) {
  return (
    <MapContainer center={userLocation} zoom={14} className="map-box">
      <ChangeMapView center={userLocation} />

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={userLocation} icon={customIcon}>
  <Popup>You are here</Popup>
</Marker>


      {pgs.map((pg) => (
        <Marker key={pg.id} position={[pg.latitude, pg.longitude]}>
          <Popup>{pg.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
