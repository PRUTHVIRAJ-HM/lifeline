import { StreamChat } from 'stream-chat';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelId, channelType = 'messaging' } = await request.json();

    if (!channelId) {
      return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });
    }

    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Stream API credentials not configured' },
        { status: 500 }
      );
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    const channel = serverClient.channel(channelType, channelId);
    await channel.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stream channel delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat', details: error.message },
      { status: 500 }
    );
  }
}
