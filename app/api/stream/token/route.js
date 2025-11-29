import { StreamChat } from 'stream-chat';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Stream API credentials not configured' },
        { status: 500 }
      );
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    // Initialize server client. NOTE: createToken is local and does not
    // require a network call. Avoid upserting the user here to prevent
    // network timeouts during token generation.
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    // Generate a user token locally (no network request)
    const token = serverClient.createToken(user.id);

    return NextResponse.json({
      token,
      apiKey,
      userId: user.id,
    });
  } catch (error) {
    console.error('Stream token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token', details: error.message },
      { status: 500 }
    );
  }
}
