import { NextResponse } from 'next/server'
import { createClient as createServerAnon } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(_req, { params }) {
  const supabase = await createServerAnon()
  const admin = createAdminClient()
  const chatId = params.id

  if (!chatId) return NextResponse.json({ error: 'Missing chat id' }, { status: 400 })

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Ensure the requester is the chat creator
  const { data: chat, error: chatErr } = await supabase
    .from('chats')
    .select('id, created_by')
    .eq('id', chatId)
    .maybeSingle()

  if (chatErr || !chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  if (chat.created_by !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Best-effort storage cleanup
  if (admin) {
    try {
      const bucket = 'chat-files'
      // List files directly under chatId/
      const { data: files, error: listErr } = await admin.storage.from(bucket).list(`${chatId}`)
      if (!listErr && Array.isArray(files) && files.length > 0) {
        const paths = files.map(f => `${chatId}/${f.name}`)
        await admin.storage.from(bucket).remove(paths)
      }
    } catch (e) {
      // Ignore storage errors; proceed with DB cleanup
      console.error('Storage cleanup failed:', e)
    }
  }

  // Delete DB rows (RLS allows chat creator to delete)
  const { error: mErr } = await supabase.from('messages').delete().eq('chat_id', chatId)
  if (mErr) return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 })

  const { error: cmErr } = await supabase.from('chat_members').delete().eq('chat_id', chatId)
  if (cmErr) return NextResponse.json({ error: 'Failed to delete members' }, { status: 500 })

  const { error: cErr } = await supabase.from('chats').delete().eq('id', chatId)
  if (cErr) return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
