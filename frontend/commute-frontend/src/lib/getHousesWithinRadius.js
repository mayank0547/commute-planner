import axiosInstance from "@/lib/axiosInstance";

export const getHousesWithinRadius = async (latitude, longitude, radius) => {
  try {
    // CHANGE 1: Use .get() instead of .post()
    // CHANGE 2: Use URL "/houses" to match your backend
    // CHANGE 3: Send data as 'params' (Query String) instead of body
    const response = await axiosInstance.get("/houses", {
      params: {
        lat: latitude,  // Backend expects "lat", not "latitude"
        lng: longitude, // Backend expects "lng", not "longitude"
        radius,
      },
    });
    return response.data;
  } catch (error) {
    console.error("[getHousesWithinRadius]", error);
    // Important: Return an empty array [] on error so .map() doesn't crash the app
    return []; 
  }
};