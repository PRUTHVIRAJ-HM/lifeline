# Stream Chat & Video Integration Setup

This project now uses **Stream Chat** and **Stream Video** SDKs for real-time messaging and video calling functionality.

## Prerequisites

1. Create a free account at [getstream.io](https://getstream.io)
2. Create a new Stream app in your dashboard
3. Get your API Key and Secret from the Stream dashboard

## Environment Variables

Add the following to your `.env.local` file:

```env
# Stream Chat & Video
STREAM_API_KEY=your_stream_api_key_here
STREAM_API_SECRET=your_stream_api_secret_here
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key_here
```

**Important:** Replace the placeholder values with your actual Stream credentials.

## Features Implemented

### 1. **Real-time Chat Messaging**
- Powered by Stream Chat React SDK
- Built-in features:
  - Real-time message delivery
  - Typing indicators
  - Read receipts
  - File uploads (images, documents)
  - Emoji reactions
  - Message threading
  - Channel search
  - User presence (online/offline status)

### 2. **Video & Audio Calling**
- Powered by Stream Video React SDK
- Features:
  - One-on-one video calls
  - Group video calls
  - Audio-only calls
  - Screen sharing
  - Camera and microphone controls
  - Picture-in-picture view
  - Call state management

### 3. **Channel Management**
- Direct messaging (1-on-1)
- Group conversations
- Channel list with sorting
- Search functionality
- User discovery

## How It Works

### Authentication Flow

1. User logs in via Supabase Auth
2. Client requests a Stream token from `/api/stream/token`
3. Server generates a secure token using Stream secret
4. Client initializes Stream Chat and Video clients with the token
5. User is now connected to Stream services

### Creating Channels

```javascript
// The Stream SDK handles channel creation
const channel = chatClient.channel('messaging', 'channel-id', {
  name: 'Channel Name',
  members: ['user-id-1', 'user-id-2']
});

await channel.watch();
```

### Starting Video Calls

```javascript
const call = videoClient.call('default', 'call-id');

await call.getOrCreate({
  ring: true,
  data: {
    members: [
      { user_id: 'user-1' },
      { user_id: 'user-2' }
    ]
  }
});
```

## File Structure

```
app/
├── api/
│   └── stream/
│       └── token/
│           └── route.js          # Token generation endpoint
├── conversations/
│   └── page.js                   # Main chat interface
lib/
└── stream/
    └── client.js                 # Stream client initialization
```

## Installed Packages

- `stream-chat` - Core Stream Chat SDK
- `stream-chat-react` - React components for Stream Chat
- `@stream-io/video-react-sdk` - Stream Video SDK for React

## Customization

### Chat UI Theming

The Stream Chat components support extensive theming. You can customize:

- Message bubbles
- Channel list appearance
- Input components
- Colors and fonts

### Video Call Layout

You can switch between different video layouts:

- `SpeakerLayout` - Active speaker highlighted
- `GridLayout` - Equal-sized participant tiles
- Custom layouts

## Migrating from Supabase Chat

The old Supabase-based chat system has been replaced. Key differences:

| Feature | Old (Supabase) | New (Stream) |
|---------|---------------|--------------|
| Messages | Manual DB queries | Real-time SDK |
| Typing indicators | Custom implementation | Built-in |
| File uploads | Supabase Storage | Stream CDN |
| Video calls | Mock UI only | Full WebRTC implementation |
| Read receipts | Manual tracking | Automatic |
| Presence | Manual updates | Real-time presence |

## Troubleshooting

### "Stream API credentials not configured"
- Ensure `.env.local` has the correct `STREAM_API_KEY` and `STREAM_API_SECRET`
- Restart your development server after updating env variables

### Video call not connecting
- Check browser permissions for camera/microphone
- Ensure you're using HTTPS (or localhost for development)
- Verify Stream Video is enabled in your Stream dashboard

### Messages not appearing
- Check Stream dashboard for API quota limits
- Verify token generation is working in `/api/stream/token`
- Check browser console for errors

## Additional Resources

- [Stream Chat React Documentation](https://getstream.io/chat/docs/sdk/react/)
- [Stream Video React Documentation](https://getstream.io/video/docs/react/)
- [Stream Dashboard](https://dashboard.getstream.io/)

## Support

For issues specific to Stream integration:
1. Check Stream status page
2. Review Stream documentation
3. Contact Stream support

For project-specific issues, refer to the main README.md
