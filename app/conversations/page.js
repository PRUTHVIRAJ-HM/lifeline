'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  MessageCircle,
  Search,
  Video,
  Phone,
  MoreVertical,
  X,
  Send,
  Paperclip,
  Smile,
  Info,
  Hash,
  AtSign,
  UserPlus
} from 'lucide-react'
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window, ChannelList } from 'stream-chat-react'
import { getStreamChatClient, getStreamVideoClient, disconnectStreamClients } from '@/lib/stream/client'
import { 
  StreamCall,
  StreamVideo,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks
} from '@stream-io/video-react-sdk'
import 'stream-chat-react/dist/css/v2/index.css'
import '@stream-io/video-react-sdk/dist/css/styles.css'


// Custom Channel Preview Component
function CustomChannelPreview({ channel, setActiveChannel, activeChannel }) {
  const isActive = activeChannel?.id === channel.id;
  const otherMembers = Object.values(channel.state.members).filter(
    member => member.user?.id !== channel._client.userID
  );
  const displayUser = otherMembers[0]?.user;
  const lastMessage = channel.state.messages[channel.state.messages.length - 1];
  const unreadCount = channel.countUnread();

  return (
    <button
      onClick={() => setActiveChannel(channel)}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-all border-b border-gray-100 ${
        isActive 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white' 
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {displayUser?.image ? (
          <img
            src={displayUser.image}
            alt={displayUser.name || 'User'}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF8A65] to-[#F57C00] flex items-center justify-center text-white font-semibold text-lg">
            {(displayUser?.name || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        {/* Online indicator */}
        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 ${
          isActive ? 'border-gray-900' : 'border-white'
        }`}></div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-semibold text-sm truncate ${
            isActive ? 'text-white' : 'text-gray-900'
          }`}>
            {displayUser?.name || 'User'}
          </h3>
          {lastMessage && (
            <span className={`text-xs ${
              isActive ? 'text-white/80' : 'text-gray-500'
            }`}>
              {new Date(lastMessage.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-xs truncate ${
            isActive ? 'text-white/80' : 'text-gray-500'
          }`}>
            {lastMessage?.text || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className={`ml-2 text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold flex-shrink-0 ${
              isActive ? 'bg-white text-gray-900' : 'bg-[#FF8A65] text-white'
            }`}>
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// Video Call Component
function VideoCallUI({ call, onEndCall }) {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  return (
    <StreamTheme>
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-50 flex flex-col">
        {/* Video Area */}
        <div className="flex-1 relative">
          <SpeakerLayout />
          
          {/* Call Info */}
          <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md rounded-xl px-5 py-3 shadow-2xl border border-gray-700">
            <div className="flex items-center gap-3 text-white">
              <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Live Call</div>
                <div className="text-sm font-bold">{participantCount} participant{participantCount !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
          
          {/* Branding */}
          <div className="absolute top-6 right-6 bg-gradient-to-r from-[#F5C832] to-yellow-400 rounded-xl px-4 py-2 shadow-2xl">
            <div className="text-sm font-bold text-gray-900">Academix</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-t from-black via-gray-900 to-transparent border-t border-gray-800 px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-3 shadow-2xl">
              <CallControls onLeave={onEndCall} />
            </div>
          </div>
        </div>
      </div>
    </StreamTheme>
  );
}

export default function ConversationsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatClient, setChatClient] = useState(null)
  const [videoClient, setVideoClient] = useState(null)
  const [currentCall, setCurrentCall] = useState(null)
  const [activeChannel, setActiveChannel] = useState(null)
  const [peopleQuery, setPeopleQuery] = useState('')
  const [peopleResults, setPeopleResults] = useState([])
  const [showNewChat, setShowNewChat] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initializeUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()

      setUser({
        ...user,
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        image: profile?.avatar_url
      })

      try {
        // Initialize Stream Chat
        const client = await getStreamChatClient(
          user.id,
          profile?.full_name || user.email?.split('@')[0] || 'User',
          profile?.avatar_url
        )
        setChatClient(client)

        // Initialize Stream Video
        const vClient = await getStreamVideoClient(
          user.id,
          profile?.full_name || user.email?.split('@')[0] || 'User',
          profile?.avatar_url
        )
        setVideoClient(vClient)
      } catch (error) {
        console.error('Failed to initialize Stream clients:', error)
      }

      setLoading(false)
    }

    initializeUser()

    return () => {
      disconnectStreamClients()
    }
  }, [router, supabase])

  // Search people by name or email via API
  useEffect(() => {
    let active = true
    const run = async () => {
      const q = peopleQuery.trim()
      if (!q) {
        if (active) setPeopleResults([])
        return
      }
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        if (active) setPeopleResults(data.users || [])
      } catch (e) {
        console.error('User search error:', e)
        if (active) setPeopleResults([])
      }
    }
    run()
    return () => { active = false }
  }, [peopleQuery])

  // Start a direct Stream channel with selected user
  const startDirectChannel = async (otherUser) => {
    if (!chatClient || !user) return
    try {
      // Call server API to create/get channel (server has permission to upsert users)
      const res = await fetch('/api/stream/channel/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: otherUser.id })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create channel')
      }

      const { channelId, channelType } = await res.json()

      // Now connect to the channel on the client and set it active
      const channel = chatClient.channel(channelType, channelId)
      await channel.watch()
      setActiveChannel(channel)
      
      setPeopleQuery('')
      setPeopleResults([])
      setShowNewChat(false)
    } catch (err) {
      console.error('Failed to create channel:', err)
      alert('Failed to start chat. Please try again.')
    }
  }

  const startVideoCall = async () => {
    if (!videoClient || !activeChannel) return

    try {
      const callId = `call-${activeChannel.id}-${Date.now()}`
      const call = videoClient.call('default', callId)

      // Get other members of the channel
      const members = Object.keys(activeChannel.state.members).filter(
        memberId => memberId !== user.id
      )

      await call.getOrCreate({
        ring: true,
        data: {
          members: [
            { user_id: user.id },
            ...members.map(memberId => ({ user_id: memberId }))
          ],
        },
      })

      setCurrentCall(call)
    } catch (error) {
      console.error('Failed to start video call:', error)
      alert('Failed to start video call. Please try again.')
    }
  }

  const endVideoCall = async () => {
    if (currentCall) {
      await currentCall.leave()
      setCurrentCall(null)
    }
  }

  // Channel filters and sort
  const filters = { type: 'messaging', members: { $in: [user?.id] } }
  const sort = { last_message_at: -1 }
  const options = { state: true, presence: true, limit: 10 }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!chatClient || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-600">Failed to initialize chat. Please refresh the page.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-9rem)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden m-6">
        <Chat client={chatClient}>
          {/* Channel List Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                <button
                  onClick={() => setShowNewChat(!showNewChat)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  title="New chat"
                >
                  <UserPlus size={20} className="text-gray-700" />
                </button>
              </div>
              
              {/* Search Users */}
              {showNewChat && (
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={peopleQuery}
                      onChange={(e) => setPeopleQuery(e.target.value)}
                      placeholder="Search users by name..."
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  
                  {peopleResults.length > 0 && (
                    <div className="mt-2 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                      {peopleResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => startDirectChannel(p)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-all border-b border-gray-100 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {p.avatar_url ? (
                              <img src={p.avatar_url} alt={p.full_name || 'User'} className="w-full h-full object-cover" />
                            ) : (
                              (p.full_name || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-semibold text-gray-900">{p.full_name || 'User'}</div>
                            <div className="text-xs text-gray-500">Start conversation</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              <ChannelList
                filters={filters}
                sort={sort}
                options={options}
                Preview={(props) => (
                  <CustomChannelPreview 
                    {...props} 
                    setActiveChannel={setActiveChannel}
                    activeChannel={activeChannel}
                  />
                )}
              />
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50">
            <Channel
              channel={activeChannel}
              EmptyStateIndicator={() => (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center px-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-2 border-gray-300">
                      <MessageCircle size={48} className="text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Academix Chat</h3>
                    <p className="text-base text-gray-600 mb-8 max-w-sm mx-auto">Stay connected with your classmates and instructors. Select a conversation or start a new one.</p>
                    <button
                      onClick={() => setShowNewChat(true)}
                      className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full hover:from-gray-800 hover:to-gray-700 transition-all font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Start New Chat
                    </button>
                  </div>
                </div>
              )}
            >
              <Window>
                {activeChannel && (
                  <>
                    {/* Custom Header */}
                    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {(() => {
                          const otherMembers = Object.values(activeChannel.state.members).filter(
                            member => member.user?.id !== user?.id
                          );
                          const displayUser = otherMembers[0]?.user;
                          
                          return (
                            <>
                              <div className="relative">
                                {displayUser?.image ? (
                                  <img
                                    src={displayUser.image}
                                    alt={displayUser.name || 'User'}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4DB6AC] to-[#26A69A] flex items-center justify-center text-white font-semibold text-base ring-2 ring-gray-200">
                                    {(displayUser?.name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                              <div>
                                <h2 className="font-semibold text-gray-900 text-base">{displayUser?.name || 'User'}</h2>
                                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                  Online
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={startVideoCall}
                          className="p-2 hover:bg-gray-100 rounded-full transition-all group"
                          title="Video call"
                        >
                          <Video size={20} className="text-gray-600 group-hover:text-gray-900" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-full transition-all group"
                          title="Voice call"
                        >
                          <Phone size={20} className="text-gray-600 group-hover:text-gray-900" />
                        </button>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-full transition-all group"
                          title="Conversation info"
                        >
                          <Info size={20} className="text-gray-600 group-hover:text-gray-900" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Message List */}
                    <MessageList />
                    
                    {/* Message Input */}
                    <MessageInput />
                  </>
                )}
              </Window>
              <Thread />
            </Channel>
          </div>
        </Chat>

        {/* Video Call Modal */}
        {currentCall && videoClient && (
          <StreamVideo client={videoClient}>
            <StreamCall call={currentCall}>
              <VideoCallUI call={currentCall} onEndCall={endVideoCall} />
            </StreamCall>
          </StreamVideo>
        )}
      </div>
    </DashboardLayout>
  )
}
