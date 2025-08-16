import { useState, useEffect } from "react";
import { getSlackIntegration, connectSlack, disconnectSlack } from "./integration.api";
import { ISlackIntegration } from "./integration.types";

export function useSlackIntegration() {
  const [slackData, setSlackData] = useState<ISlackIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlackIntegration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSlackIntegration();
      setSlackData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Slack integration");
      // If it's a 404, it means no integration exists yet
      if (err.status === 404) {
        setSlackData({ isConnected: false });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setError(null);
      await connectSlack();
      await fetchSlackIntegration();
    } catch (err: any) {
      setError(err.message || "Failed to connect to Slack");
    }
  };

  const handleDisconnect = async () => {
    try {
      setError(null);
      await disconnectSlack();
      await fetchSlackIntegration();
    } catch (err: any) {
      setError(err.message || "Failed to disconnect from Slack");
    }
  };

  useEffect(() => {
    fetchSlackIntegration();
  }, []);

  return {
    slackData,
    isLoading,
    error,
    connect: handleConnect,
    disconnect: handleDisconnect,
    refetch: fetchSlackIntegration,
  };
} 