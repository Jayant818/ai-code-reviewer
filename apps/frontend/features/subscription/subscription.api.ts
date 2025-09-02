import { APIError, ValidationError } from "@/lib/errors";
import axios from "../../lib/axios/axiosInstance";
import {
  createSubscriptionResponseSchema,
  ICreateSubscriptionResponse,
  ISubscriptionResponse,
  SubscriptionRequest,
  SubscriptionRequestSchema,
  SubscriptionSchema,
} from "./api.types";

export const createSubscription = async (
  data: SubscriptionRequest
): Promise<ICreateSubscriptionResponse> => {
  console.log("Creating subscription with data:", data);
  try {
    const inputCheck = SubscriptionRequestSchema.safeParse(data);

    // if (!inputCheck.success) {
    //   throw new ValidationError(
    //     "Invalid subscription request",
    //     inputCheck.error
    //   );
    // }

    const response = await axios.post("/organization/subscription", data);

    const result = createSubscriptionResponseSchema.safeParse(response.data);

    if (!result.success) {
      console.error("API response error", result.error);
      throw new ValidationError(
        "Invalid API response format in creating subscription",
        result.error
      );
    }

    if (!result.data.success) {
      throw new APIError(
        "Failed to create subscription",
        500,
        result.data.message
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }

    throw new APIError("An unexpected error occurred", 500, error);
  }
};

export const getOrgSubscription = async (): Promise<ISubscriptionResponse> => {
  try {
    const response = await axios.get(`/organization/subscription`);

    const result = SubscriptionSchema.safeParse(response.data);

    if (!result.success) {
      console.error("API response error:", result.error);
      throw new ValidationError(
        "Invalid API response format in fetching subscription",
        result.error
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new APIError("An unexpected error occurred", 500, error);
  }
};
