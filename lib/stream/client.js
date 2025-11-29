import { StreamChat } from 'stream-chat';
import { StreamVideoClient } from '@stream-io/video-react-sdk';

let chatClient = null;
let videoClient = null;

export async function getStreamChatClient(userId, userName, userImage) {
  if (chatClient) return chatClient;

  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  if (!apiKey) {
    throw new Error('Stream API key not configured');
  }

  chatClient = StreamChat.getInstance(apiKey);

  // Get token from our API
  const response = await fetch('/api/stream/token', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to get Stream token');
  }

  const { token } = await response.json();

  await chatClient.connectUser(
    {
      id: userId,
      name: userName,
      image: userImage,
    },
    token
  );

  return chatClient;
}

export async function getStreamVideoClient(userId, userName, userImage) {
  if (videoClient) return videoClient;

  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  if (!apiKey) {
    throw new Error('Stream API key not configured');
  }

  // Get token from our API
  const response = await fetch('/api/stream/token', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to get Stream token');
  }

  const { token } = await response.json();

  videoClient = new StreamVideoClient({
    apiKey,
    user: {
      id: userId,
      name: userName,
      image: userImage,
    },
    token,
  });

  return videoClient;
}

export function disconnectStreamClients() {
  if (chatClient) {
    chatClient.disconnectUser();
    chatClient = null;
  }
  if (videoClient) {
    videoClient.disconnectUser();
    videoClient = null;
  }
}
