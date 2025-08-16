# Slack Integration Setup

This document explains how to set up Slack integration for the AI Code Reviewer application.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Slack Integration
NEXT_PUBLIC_SLACK_CLIENT_ID=your_slack_client_id_here
NEXT_PUBLIC_SLACK_REDIRECT_URI=http://localhost:3000/auth/slack/callback

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Slack App Setup

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" and choose "From scratch"
3. Give your app a name and select your workspace
4. In the "OAuth & Permissions" section, add the following scopes:
   - `chat:write` - Send messages to channels
   - `channels:read` - View basic channel info
   - `groups:read` - View basic group info
   - `im:read` - View basic DM info
   - `mpim:read` - View basic multi-person DM info
5. Add your redirect URL: `http://localhost:3000/auth/slack/callback`
6. Copy the Client ID and add it to your environment variables

## Backend API Endpoints

The following endpoints need to be implemented in the backend:

- `GET /integration/slack` - Get current Slack integration status
- `POST /integration/slack/connect` - Initiate Slack OAuth flow
- `POST /integration/slack/disconnect` - Disconnect Slack integration
- `GET /auth/slack/callback` - Handle OAuth callback

## Features

- Connect/disconnect Slack workspace
- Send code review notifications to Slack channels
- Display integration status in the dashboard
- Error handling and loading states

## Usage

1. Navigate to the dashboard
2. Find the "Slack Integration" section in Quick Actions
3. Click "Connect" to start the OAuth flow
4. Authorize the app in Slack
5. The integration will show as "Connected" with workspace name
6. Use "Disconnect" to remove the integration 