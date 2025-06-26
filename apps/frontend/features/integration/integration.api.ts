import axios from "@/lib/axios/axiosInstance";
import { GetOrgIntegrationResponseSchema } from "./integration.types";
import { APIError, ValidationError } from "@/lib/errors";

export const getIntegration = async () => {
  try {
    const response = await axios.get("/integration");

    const result = GetOrgIntegrationResponseSchema.safeParse(
      response.data || {}
    );

    console.log(result);
    if (!result.success) {
      throw new ValidationError("Invalid API response format", result.error);
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }

    throw new APIError("An unexpected error occurred", 500, error);
  }
};
