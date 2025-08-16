"use client";

import { motion } from "framer-motion";
import { FaSlack } from "react-icons/fa";
import { useSlackIntegration } from "../useSlackIntegration";
import { BACKEND_URL } from "@/lib/constants";
import { connectToSlackQuery } from "../useIntegrationQuery";

export function SlackIntegration() {
  const { slackData, isLoading, error, connect, disconnect } = useSlackIntegration();
  
  const isConnected = slackData?.isConnected || false;

  // const { data: slackConnectData, isLoading: isConnecting } = connectToSlackQuery({
  //   customConfig: {
  //     enabled: isConnected,
  //     onSuccess: (data) => {
  //       if (data?.url) {
  //         window.location.href = data.url;
  //       } else {
  //         console.error("No URL returned from Slack connect API");
  //       }
  //     }
  //   },
  // });

  const handleSlackConnect = async () => {
    if (isLoading) return;
    // window.location.href = `${BACKEND_URL}/integration/slack/connect`
    await connect();
  };

  const handleSlackDisconnect = async () => {
    if (isLoading) return;
    await disconnect();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card rounded-lg p-4"
    >
      {error && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-600 text-xs">
          {error}
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${isConnected ? 'bg-green-600' : 'bg-purple-600'} rounded-lg flex items-center justify-center`}>
          <FaSlack className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Slack Integration</p>
          <p className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Connect to receive notifications'}
          </p>
          {slackData?.workspaceName && (
            <p className="text-xs text-green-600 mt-1">
              Workspace: {slackData.workspaceName}
            </p>
          )}
        </div>
        <button
          onClick={isConnected ? handleSlackDisconnect : handleSlackConnect}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            isConnected
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isConnected ? 'Disconnecting...' : 'Connecting...'}
            </div>
          ) : (
            isConnected ? 'Disconnect' : 'Connect'
          )}
        </button>
      </div>
    </motion.div>
  );
} 