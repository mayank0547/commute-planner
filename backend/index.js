// index.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Get User's IP Location
app.get("/api/v1/ipLocation", async (req, res) => {
  try {
    // Uses a free API to detect location based on IP
    const response = await axios.get("http://ip-api.com/json/");
    const data = response.data;
    res.json({
      latitude: data.lat,
      longitude: data.lon,
      city: data.city,
      region: data.regionName,
      country: data.country,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

// 2. Get Random Houses (Mock Data)
// Since we don't have a real database of houses, we generate random points near the center
app.get("/api/v1/houses", (req, res) => {
  const { lat, lng, radius } = req.query;
  
  const centerLat = parseFloat(lat);
  const centerLng = parseFloat(lng);
  const numberOfHouses = 50;
  const houses = [];

  for (let i = 0; i < numberOfHouses; i++) {
    // Math to create random points within a small radius
    const r = (radius / 111300) * Math.sqrt(Math.random()); 
    const theta = Math.random() * 2 * Math.PI;
    
    houses.push({
      lat: centerLat + r * Math.cos(theta),
      lng: centerLng + r * Math.sin(theta),
      price: Math.floor(Math.random() * 500000) + 200000 // Random price
    });
  }

  res.json(houses);
});

// 3. Get Route (Proxy to OSRM)
app.post("/api/v1/route", async (req, res) => {
  const { src, dest } = req.body; // Expects [lat, lng] arrays
  
  try {
    // Uses OSRM public API for driving directions
    const url = `http://router.project-osrm.org/route/v1/driving/${src[1]},${src[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
    
    const response = await axios.get(url);
    if(response.data.routes.length > 0) {
        res.json({
            geometry: response.data.routes[0].geometry,
            duration: response.data.routes[0].duration,
            distance: response.data.routes[0].distance
        });
    } else {
        res.status(404).json({ error: "No route found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Routing service failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});