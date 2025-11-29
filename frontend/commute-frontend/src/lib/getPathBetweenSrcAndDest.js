import axiosInstance from "./axiosInstance";

export const getPathBetweenSrcAndDest = async (src, dest) => {
  try {
    // FIX: Changed "/directions" to "/route" to match your backend
    const { data } = await axiosInstance.post("/route", {
      src,
      dest,
    });
    return data;
  } catch (error) {
    console.error("[getPathBetweenSrcAndDest]", error);
    throw error;
  }
};