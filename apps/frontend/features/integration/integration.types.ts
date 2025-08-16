import { z } from "zod";

export const GetOrgIntegrationResponseSchema = z.object({
  _id: z.string().optional(),
  installationId: z.number().optional(),
  integratedBy: z.number().optional(),
});

export const SlackIntegrationSchema = z.object({
  isConnected: z.boolean(),
  workspaceName: z.string().optional(),
  channels: z.array(z.string()).optional(),
});

export type IGetOrgIntegrationResponse = z.infer<
  typeof GetOrgIntegrationResponseSchema
>;

export type ISlackIntegration = z.infer<typeof SlackIntegrationSchema>;

export const GetSlackConnectURLResponse = z.object({
  url: z.string().url(),
})

export type getSlackConnectUrlResponse = z.infer<typeof GetSlackConnectURLResponse>;
