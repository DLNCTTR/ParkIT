// src/api.js
import axios from 'axios';

// ✅ Create an Axios instance with the base URL
const api = axios.create({
  baseURL: "https://localhost:7155/api", // Base URL of your backend API
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Fetch all available parking spots
export const getAllParkingSpots = async () => {
  try {
    const response = await api.get("/parking-spaces"); // Fetch all available spots
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching parking spots:", error.response?.data || error.message);
    return [];
  }
};

// ✅ Fetch a single parking spot by ID
export const getParkingSpotById = async (id) => {
  try {
    const response = await api.get(`/parking-spaces/${id}`); // Fetch details of one spot
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching parking spot ${id}:`, error.response?.data || error.message);
    return null;
  }
};

export default api;
