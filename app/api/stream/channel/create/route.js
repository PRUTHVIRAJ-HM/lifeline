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

    const { otherUserId } = await request.json();
    
    if (!otherUserId) {
      return NextResponse.json({ error: 'Missing otherUserId' }, { status: 400 });
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

    // Get both user profiles
    const [currentProfile, otherProfile] = await Promise.all([
      supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
      supabase.from('profiles').select('full_name, avatar_url, email').eq('id', otherUserId).single()
    ]);

    // Upsert both users to Stream using server client (has permission)
    await serverClient.upsertUsers([
      {
        id: user.id,
        name: currentProfile.data?.full_name || user.email?.split('@')[0] || 'User',
        image: currentProfile.data?.avatar_url || undefined,
      },
      {
        id: otherUserId,
        name: otherProfile.data?.full_name || otherProfile.data?.email?.split('@')[0] || 'User',
        image: otherProfile.data?.avatar_url || undefined,
      }
    ]);

    // Create or get the channel
    const channel = serverClient.channel('messaging', {
      members: [user.id, otherUserId],
      created_by_id: user.id,
    });

    await channel.create();

    return NextResponse.json({
      channelId: channel.id,
      channelType: 'messaging',
      success: true
    });
  } catch (error) {
    console.error('Stream channel creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create channel', details: error.message },
      { status: 500 }
    );
  }
}
