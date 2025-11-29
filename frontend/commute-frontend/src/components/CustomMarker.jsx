import L from "leaflet";
import markerIcon from "../assets/marker.png";
import locationSvg from "../assets/location.svg";

export const MarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconSize: [32, 32],
});

export const HouseIcon = new L.Icon({
  iconUrl: locationSvg,
  iconSize: new L.Point(40, 47),
});