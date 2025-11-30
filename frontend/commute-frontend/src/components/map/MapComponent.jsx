import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  Polyline,
  useMap,
  useMapEvents, 
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { toast } from "react-hot-toast";

import { HouseIcon } from "@/components/CustomMarker";
import DetailsCard from "@/components/DetailsCard";

import { animationDuration, initialZoomLvl } from "@/constants/constants";

import InitialLoadLoader from "@/components/InitialLoadLoader";
import { CloseCircle, FarCircle, MiddleCircle } from "@/components/Circles";
import GeoEncodingComponent from "@/components/GeoEncodingComponent";

import { getPathBetweenSrcAndDest } from "@/lib/getPathBetweenSrcAndDest";
import { getHousesWithinRadius } from "@/lib/getHousesWithinRadius";
import { getIpLocation } from "@/lib/getIpLocation";

import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const openStreetMapUrl = import.meta.env.VITE_REACT_APP_OPENSTREET_MAP_URL;
const attribution = import.meta.env.VITE_REACT_APP_ATTRIBUTION;

if (!openStreetMapUrl || !attribution)
  throw new Error("ENV configuration failed!!!");

// --- HELPER COMPONENT FOR FLYING ---
const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] !== null && center[1] !== null) {
      map.flyTo(center, zoom, {
        duration: 1.5,
      });
    }
  }, [center, zoom, map]);

  return null;
};

// --- CHANGE 2: HELPER FOR CLICKING MAP ---
const LocationSelector = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
};
// -----------------------------------------

const MapComponent = () => {
  const [selectedLocation, setSelectedLocation] = useState({
    lat: null,
    lng: null,
  });

  const [houses, setHouses] = useState(null);

  const {
    data: initialLocation,
    isLoading,
    isError: isIpFetchingError,
  } = useQuery({
    queryKey: ["ipLocation"],
    queryFn: getIpLocation,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 12 * 60 * 60 * 60,
  });

  const routeMutation = useMutation({
    mutationFn: ({ src, dest }) => getPathBetweenSrcAndDest(src, dest),
  });
  const {
    data: routeData,
    isError: isRouteFetchingError,
  } = routeMutation;

  useEffect(() => {
    if (isIpFetchingError || isRouteFetchingError) {
      toast.error("An error occurred while fetching data");
    }
  }, [isIpFetchingError, isRouteFetchingError]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedLocation.lat && !selectedLocation.lng) return;
      const notification = toast.loading("Fetching Houses...");

      try {
        routeMutation.reset();
        const houseData = await getHousesWithinRadius(
          selectedLocation.lat,
          selectedLocation.lng,
          7500
        );
        setHouses(houseData);
        toast.success(`${houseData.length} Houses Found`, {
          id: notification,
        });
      } catch (error) {
        console.error("An error occurred: ", error);
        toast.error("An Error Occurred While Fetching!!", {
          id: notification,
        });
      }
    };

    fetchData();
  }, [selectedLocation.lat, selectedLocation.lng]);

  const handleGeocodeSelect = (event) => {
    const feature = event?.feature || event;
    if (!feature || !feature.center) {
      console.error("Invalid event data from search bar.");
      return;
    }
    const [lng, lat] = feature.center;
    setSelectedLocation({
      lat: Number(lat),
      lng: Number(lng),
    });
  };

  // --- CHANGE 3: Handle Manual Clicks ---
  const handleMapClick = ({ lat, lng }) => {
    setSelectedLocation({ lat, lng });
    routeMutation.reset();
  };
  // --------------------------------------

  const handleMarkerClick = async (event) => {
    const { lat, lng } = event.latlng;
    const src = [selectedLocation.lat, selectedLocation.lng];
    const dest = [lat, lng];

    try {
      const notification = toast.loading("Calculating Route...");
      await routeMutation.mutateAsync({ src, dest });
      toast.success("Route Successfully Fetched", { id: notification });
    } catch (error) {
      toast.error("An Error Occurred While Fetching!!", { id: "notification" });
    }
  };

  return (
    <div className="container">
      {isLoading || !initialLocation || !initialLocation.latitude ? (
        <InitialLoadLoader />
      ) : (
        <MapContainer
          center={[initialLocation.latitude, initialLocation.longitude]}
          zoom={initialZoomLvl}
          zoomControl={false}
          style={{ width: "100%", height: "100vh" }}
        >
          <MapFlyTo
            center={
              selectedLocation.lat
                ? [selectedLocation.lat, selectedLocation.lng]
                : null
            }
            zoom={initialZoomLvl + 2}
          />
          
          {/* --- CHANGE 4: Add Selector Here --- */}
          <LocationSelector onLocationSelect={handleMapClick} />
          {/* ----------------------------------- */}

          <TileLayer url={openStreetMapUrl} attribution={attribution} />
          <ZoomControl position="topright" />

          <Marker
            position={[initialLocation.latitude, initialLocation.longitude]}
          >
            <Popup>
              {`${initialLocation?.city}, ${initialLocation?.region}, ${initialLocation?.country}`}
            </Popup>
          </Marker>

          {selectedLocation.lat && selectedLocation.lng && (
            <>
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                title={selectedLocation.lat + ", " + selectedLocation.lng}
              />
              <CloseCircle center={selectedLocation} />
              <MiddleCircle center={selectedLocation} />
              <FarCircle center={selectedLocation} />
            </>
          )}

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={150}
            spiderfyOnMaxZoom={false}
            disableClusteringAtZoom={17}
          >
            {houses &&
              Array.isArray(houses) &&
              houses.map(({ lat, lng }, index) => {
                return (
                  <Marker
                    key={index}
                    position={[lat, lng]}
                    title={lat + ", " + lng}
                    icon={HouseIcon}
                    eventHandlers={{
                      click: handleMarkerClick,
                    }}
                  />
                );
              })}
          </MarkerClusterGroup>

          {routeData && routeData?.geometry && (
            <>
              <Polyline
                positions={routeData.geometry.coordinates.map((coord) => [
                  coord[1],
                  coord[0],
                ])}
                pathOptions={{ color: "#00b0ff", weight: 5 }}
              />
              {(() => {
                const lastPoint =
                  routeData.geometry.coordinates[
                    routeData.geometry.coordinates.length - 1
                  ];
                return (
                  <Marker
                    position={[lastPoint[1], lastPoint[0]]}
                    icon={HouseIcon}
                  />
                );
              })()}
            </>
          )}

          <GeoEncodingComponent handleGeocodeSelect={handleGeocodeSelect} />
          <DetailsCard pathInfo={routeData} />
        </MapContainer>
      )}
    </div>
  );
};

export default MapComponent;