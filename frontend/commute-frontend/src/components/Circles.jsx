import { Circle } from "react-leaflet";

const defaultOptions = {
  weight: 3,
};

const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.5,
  color: "#8BC34A",
  fillColor: "#8BC34A",
};

const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.3,
  color: "#FBC02D",
  fillColor: "#FBC02D",
};

const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.2,
  color: "#FF5252",
  fillColor: "#FF5252",
};

export const CloseCircle = ({ center }) => {
  return <Circle center={center} pathOptions={closeOptions} radius={2500} />;
};

export const MiddleCircle = ({ center }) => {
  return <Circle center={center} pathOptions={middleOptions} radius={5000} />;
};

export const FarCircle = ({ center }) => {
  return <Circle center={center} pathOptions={farOptions} radius={7500} />;
};