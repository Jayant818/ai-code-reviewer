import { z } from "zod";

export const GetOrgIntegrationResponseSchema = z.object({
  _id: z.string().optional(),
  installationId: z.number().optional(),
  integratedBy: z.number().optional(),
});

export type IGetOrgIntegrationResponse = z.infer<
  typeof GetOrgIntegrationResponseSchema
>;
