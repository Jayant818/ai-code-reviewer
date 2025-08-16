import axios from "@/lib/axios/axiosInstance";
import {
  GetOrgIntegrationResponseSchema,
  SlackIntegrationSchema,
} from "./integration.types";
import { APIError, ValidationError } from "@/lib/errors";

export const getIntegration = async () => {
  try {
    const response = await axios.get("/integration");

    const result = GetOrgIntegrationResponseSchema.safeParse(
      response.data || {}
    );

    if (!result.success) {
      console.error("API response error:", result.error);
      throw new ValidationError("Invalid API response format", result.error);
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }
    console.log("Error fetching integration:", error);
    throw new APIError("An unexpected error occurred", 500, error);
  }
};

export const getSlackIntegration = async () => {
  try {
    const response = await axios.get("/integration/slack");

    const result = SlackIntegrationSchema.safeParse(response.data || {});

    if (!result.success) {
      console.error("API response error:", result.error);
      throw new ValidationError("Invalid API response format", result.error);
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }
    console.log("Error fetching Slack integration:", error);
    throw new APIError("An unexpected error occurred", 500, error);
  }
};

export const connectSlack = async () => {
  try {
    const response = await axios.get("/integration/slack/connect");
    return response.data;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }
    console.log("Error connecting to Slack:", error);
    throw new APIError("An unexpected error occurred", 500, error);
  }
};

export const disconnectSlack = async () => {
  try {
    const response = await axios.post("/integration/slack/disconnect");
    return response.data;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }
    console.log("Error disconnecting from Slack:", error);
    throw new APIError("An unexpected error occurred", 500, error);
  }
};
