const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// ROUTE 1: Get User's IP Location (Fixed for Render)
// ---------------------------------------------------------
// DEBUG VERSION of the IP Route
app.get("/api/v1/ipLocation", async (req, res) => {
  try {
    const xForwardedFor = req.headers['x-forwarded-for'];
    let ip = xForwardedFor ? xForwardedFor.split(',')[0] : req.socket.remoteAddress;

    // --- DEBUG LOGS (Check these in Render Dashboard) ---
    console.log("-----------------------------------------");
    console.log("1. Raw Headers:", xForwardedFor);
    console.log("2. Detected IP:", ip);
    console.log("-----------------------------------------");

    if (ip === '::1' || ip === '127.0.0.1') {
        ip = ''; 
    }

    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    
    // Log what the API returned
    console.log("3. API Location:", response.data.country); 

    res.json({
      latitude: response.data.lat,
      longitude: response.data.lon,
      city: response.data.city,
      region: response.data.regionName,
      country: response.data.country,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

// ---------------------------------------------------------
// ROUTE 2: Get Random Houses (Mock Data / Procedural Generation)
// ---------------------------------------------------------
app.get("/api/v1/houses", (req, res) => {
  const { lat, lng, radius } = req.query;
  
  const centerLat = parseFloat(lat);
  const centerLng = parseFloat(lng);
  const numberOfHouses = 50;
  const houses = [];

  for (let i = 0; i < numberOfHouses; i++) {
    // Generate random points within the radius using Polar Coordinates
    const r = (radius / 111300) * Math.sqrt(Math.random()); 
    const theta = Math.random() * 2 * Math.PI;
    
    houses.push({
      lat: centerLat + r * Math.cos(theta),
      lng: centerLng + r * Math.sin(theta),
      price: Math.floor(Math.random() * 500000) + 200000 // Random price $200k - $700k
    });
  }

  res.json(houses);
});

// ---------------------------------------------------------
// ROUTE 3: Get Driving Route (Proxy to OSRM)
// ---------------------------------------------------------
app.post("/api/v1/route", async (req, res) => {
  const { src, dest } = req.body; // Expects [lat, lng] arrays
  
  if(!src || !dest) {
      return res.status(400).json({ error: "Source and Destination required" });
  }

  try {
    // OSRM expects coordinates as: Longitude,Latitude
    const srcStr = `${src[1]},${src[0]}`;
    const destStr = `${dest[1]},${dest[0]}`;

    const url = `http://router.project-osrm.org/route/v1/driving/${srcStr};${destStr}?overview=full&geometries=geojson`;
    
    const response = await axios.get(url);

    if(response.data.routes && response.data.routes.length > 0) {
        res.json({
            geometry: response.data.routes[0].geometry,
            duration: response.data.routes[0].duration,
            distance: response.data.routes[0].distance
        });
    } else {
        res.status(404).json({ error: "No route found" });
    }
  } catch (error) {
    console.error("Routing Error:", error.message);
    res.status(500).json({ error: "Routing service failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});