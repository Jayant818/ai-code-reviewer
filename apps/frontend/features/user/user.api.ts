import { APIError, ValidationError } from "@/lib/errors";
import axios from "@/lib/axios/axiosInstance";
import { IUser, UserSchema } from "./user.schema";

export const getCurrentUser = async (): Promise<IUser> => {
  try {
    const response = await axios.get("/user/current");

    const result = UserSchema.safeParse(response.data);
    console.log(result);
    if (!result.success) {
      throw new ValidationError(
        "Invalid API response format in fetching user",
        result.error
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
