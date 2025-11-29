import { GeocodingControl } from "@maptiler/geocoding-control/react";
import "@maptiler/geocoding-control/style.css";

const GeoEncodingComponent = ({ handleGeocodeSelect }) => {
  return (
    <div className="geocoding">
      <GeocodingControl
        apiKey={import.meta.env.VITE_REACT_APP_MAPTILER_API_KEY}
        fuzzyMatch={true}
        debounceSearch={350}
        placeholder="Search Your Office..."
        onPick={handleGeocodeSelect}
      />
    </div>
  );
};

export default GeoEncodingComponent;