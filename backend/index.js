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
app.get("/api/v1/ipLocation", async (req, res) => {
  try {
    // 1. Get the real user IP from the headers (Render/Vercel puts it here)
    const xForwardedFor = req.headers['x-forwarded-for'];
    
    // If multiple IPs exist, the first one is the real user
    let ip = xForwardedFor ? xForwardedFor.split(',')[0] : req.socket.remoteAddress;

    // 2. Handle Localhost (::1 or 127.0.0.1)
    // If we send '::1' to the API, it fails. 
    // Sending an empty string '' tells the API to use the request's public IP.
    if (ip === '::1' || ip === '127.0.0.1') {
        ip = ''; 
    }

    // 3. Call the API
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const data = response.data;

    // Check if API returned a failure (e.g., private IP range)
    if(data.status === 'fail') {
        console.warn("IP Lookup Failed:", data.message);
        // Fallback to a default location (e.g., New Delhi) if detection fails
        return res.json({
            latitude: 28.6139, 
            longitude: 77.2090, 
            city: "New Delhi", 
            region: "Delhi", 
            country: "India"
        });
    }

    res.json({
      latitude: data.lat,
      longitude: data.lon,
      city: data.city,
      region: data.regionName,
      country: data.country,
    });
  } catch (error) {
    console.error("IP Location Error:", error.message);
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