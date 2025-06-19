import axios from "@/lib/axios/axiosInstance";

export const getIntegration = async (orgId: string) => {
  const response = await axios.get("/integration?orgId=" + orgId);
  return response.data;
};
