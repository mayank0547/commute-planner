import axiosInstance from "./axiosInstance";

export const getIpLocation = async () => {
  // Make sure this matches your backend route exactly!
  const { data } = await axiosInstance.get("/ipLocation");
  return data;
};