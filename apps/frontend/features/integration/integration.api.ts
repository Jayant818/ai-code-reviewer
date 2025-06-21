import axios from "@/lib/axios/axiosInstance";

export const getIntegration = async () => {
  const response = await axios.get("/integration");
  return response.data;
};
