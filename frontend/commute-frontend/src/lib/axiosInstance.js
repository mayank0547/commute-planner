import axios from "axios";

// const baseURL = "";
const baseURL = `${
  import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:5000"
}/api/v1`;

const axiosInstance = axios.create({
  baseURL,
});

export default axiosInstance;
