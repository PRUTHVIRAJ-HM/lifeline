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
  UserPlus,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Volume2,
  VolumeX,
  MonitorUp
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
function VideoCallUI({ call, onEndCall, otherUser }) {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const toggleMic = async () => {
    await call.microphone.toggle();
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = async () => {
    await call.camera.toggle();
    setIsCameraOn(!isCameraOn);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await call.stopPublish('screenShareTrack');
        setIsScreenSharing(false);
      } else {
        await call.screenShare.toggle();
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Screen share error:', error);
      alert('Failed to share screen. Please try again.');
    }
  };

  return (
    <StreamTheme>
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-50 flex flex-col">
        {/* Video Area */}
        <div className="flex-1 relative">
          <SpeakerLayout participantsBarPosition="bottom" />
          
          {/* Call Info */}
          <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md rounded-xl px-5 py-3 shadow-2xl border border-gray-700">
            <div className="flex items-center gap-3 text-white">
              <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              <div>
                <div className="text-xs text-gray-400 font-medium">
                  {callingState === 'ringing' ? 'Calling...' : 'Live Call'}
                </div>
                <div className="text-sm font-bold">
                  {otherUser?.name || 'User'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Branding */}
          <div className="absolute top-6 right-6 bg-gradient-to-r from-[#F5C832] to-yellow-400 rounded-xl px-4 py-2 shadow-2xl">
            <div className="text-sm font-bold text-gray-900">Academix</div>
          </div>
        </div>

        {/* Custom Controls */}
        <div className="bg-gradient-to-t from-black via-gray-900/95 to-transparent px-8 py-8">
          <div className="flex items-center justify-center gap-6">
            {/* Microphone Toggle */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleMic}
                className={`p-5 rounded-full transition-all shadow-2xl ${
                  isMicOn 
                    ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                title={isMicOn ? 'Mute' : 'Unmute'}
              >
                {isMicOn ? (
                  <Mic size={28} className="text-white" />
                ) : (
                  <MicOff size={28} className="text-white" />
                )}
              </button>
              <span className="text-white text-xs font-medium">
                {isMicOn ? 'Mute' : 'Unmuted'}
              </span>
            </div>

            {/* Camera Toggle */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleCamera}
                className={`p-5 rounded-full transition-all shadow-2xl ${
                  isCameraOn 
                    ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isCameraOn ? (
                  <Video size={28} className="text-white" />
                ) : (
                  <VideoOff size={28} className="text-white" />
                )}
              </button>
              <span className="text-white text-xs font-medium">
                {isCameraOn ? 'Camera' : 'Camera Off'}
              </span>
            </div>

            {/* Screen Share Toggle */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleScreenShare}
                className={`p-5 rounded-full transition-all shadow-2xl ${
                  isScreenSharing 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
                }`}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                <MonitorUp size={28} className="text-white" />
              </button>
              <span className="text-white text-xs font-medium">
                {isScreenSharing ? 'Sharing' : 'Share'}
              </span>
            </div>

            {/* End Call */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onEndCall}
                className="p-6 bg-red-600 hover:bg-red-700 rounded-full transition-all shadow-2xl ring-2 ring-red-400/50"
                title="End call"
              >
                <PhoneOff size={32} className="text-white" />
              </button>
              <span className="text-white text-xs font-medium">End Call</span>
            </div>

            {/* Speaker Toggle */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleSpeaker}
                className={`p-5 rounded-full transition-all shadow-2xl ${
                  isSpeakerOn 
                    ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
              >
                {isSpeakerOn ? (
                  <Volume2 size={28} className="text-white" />
                ) : (
                  <VolumeX size={28} className="text-white" />
                )}
              </button>
              <span className="text-white text-xs font-medium">
                {isSpeakerOn ? 'Speaker' : 'Muted'}
              </span>
            </div>
          </div>

          {/* Call Status */}
          <div className="text-center mt-6">
            <p className="text-white/80 text-sm font-medium">
              {participantCount} participant{participantCount !== 1 ? 's' : ''} in call
              {isScreenSharing && <span className="ml-2 text-green-400">• Screen sharing</span>}
            </p>
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
  const [incomingCall, setIncomingCall] = useState(null)
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

        // Listen for incoming calls
        vClient.on('call.ring', async (event) => {
          console.log('Incoming call event:', event)
          try {
            // Get the actual call instance from the video client
            const call = vClient.call(event.call.type, event.call.id)
            await call.get() // Fetch the call details
            setIncomingCall(call)
          } catch (error) {
            console.error('Failed to setup incoming call:', error)
          }
        })

        vClient.on('call.accepted', (event) => {
          console.log('Call accepted:', event)
        })

        vClient.on('call.rejected', (event) => {
          console.log('Call rejected:', event)
          setIncomingCall(null)
        })
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
    if (!videoClient || !activeChannel) {
      console.error('Video client or active channel not available')
      alert('Unable to start call. Please refresh the page.')
      return
    }

    try {
      // Request camera and microphone permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      stream.getTracks().forEach(track => track.stop()) // Stop the test stream

      // Create a simple, short call ID
      const callId = `call_${Date.now()}`

      const call = videoClient.call('default', callId)

      // Get other members of the channel
      const members = Object.keys(activeChannel.state.members).filter(
        memberId => memberId !== user.id
      )

      console.log('Creating call with ID:', callId)
      console.log('Call members:', members)

      // Create or get the call
      await call.getOrCreate({
        ring: true,
        data: {
          created_by_id: user.id,
          members: [
            { user_id: user.id },
            ...members.map(memberId => ({ user_id: memberId }))
          ],
        },
      })

      // Join the call
      await call.join()

      setCurrentCall(call)
    } catch (error) {
      console.error('Failed to start video call:', error)
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Camera/microphone permission denied. Please allow access to use video calls.')
      } else if (error.name === 'NotFoundError') {
        alert('No camera or microphone found. Please connect a device and try again.')
      } else {
        console.error('Error details:', error.message, error.code)
        alert(`Failed to start video call: ${error.message || 'Please try again.'}`)
      }
    }
  }

  const endVideoCall = async () => {
    if (currentCall) {
      await currentCall.leave()
      setCurrentCall(null)
    }
  }

  const acceptIncomingCall = async () => {
    if (incomingCall) {
      try {
        console.log('Accepting call:', incomingCall)
        console.log('Call state:', incomingCall.state)
        
        // Check if already joined
        if (incomingCall.state.callingState === 'joined') {
          console.log('Already joined, just setting as current call')
          setCurrentCall(incomingCall)
          setIncomingCall(null)
          return
        }
        
        // Join the call
        await incomingCall.join()
        
        setCurrentCall(incomingCall)
        setIncomingCall(null)
      } catch (error) {
        console.error('Failed to accept call:', error)
        
        // If error is about already joined, still set it as current
        if (error.message && error.message.includes('shall be called only once')) {
          setCurrentCall(incomingCall)
          setIncomingCall(null)
        } else {
          alert('Failed to join the call. Please try again.')
          setIncomingCall(null)
        }
      }
    }
  }

  const rejectIncomingCall = async () => {
    if (incomingCall) {
      try {
        await incomingCall.reject()
        setIncomingCall(null)
      } catch (error) {
        console.error('Failed to reject call:', error)
        setIncomingCall(null)
      }
    }
  }

  // Get other user info from active channel
  const getOtherUser = () => {
    if (!activeChannel) return null
    const otherMembers = Object.values(activeChannel.state.members).filter(
      member => member.user?.id !== user?.id
    )
    return otherMembers[0]?.user
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

  // Custom action buttons for the composer
  const CustomInputButtons = (props) => {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 bg-white">
        <div className="ml-auto" />
        <button
          type="button"
          onClick={props?.sendMessage || (() => {})}
          className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 shadow-sm flex items-center gap-2 transition-colors"
          title="Send"
        >
          <Send size={16} />
          <span className="text-sm font-semibold">Send</span>
        </button>
      </div>
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
                    <MessageList 
                      hideDeletedMessages
                      messageActions={[]}
                    />
                    
                    {/* Message Input with improved action buttons */}
                    <MessageInput
                      InputButtons={CustomInputButtons}
                      AdditionalTextareaProps={{
                        className:
                          'border-t border-gray-200 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:outline-none',
                      }}
                    />
                  </>
                )}
              </Window>
              <Thread />
            </Channel>
          </div>
        </Chat>

        {/* Incoming Call Modal */}
        {incomingCall && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-700">
              {/* Caller Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl ring-4 ring-blue-500/30 animate-pulse">
                    {incomingCall.state?.createdBy?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                    <Video size={20} className="text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {incomingCall.state?.createdBy?.name || 'Someone'}
                </h3>
                <p className="text-gray-400 text-sm">Incoming video call...</p>
              </div>

              {/* Animated rings */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 animate-ping absolute"></div>
                  <div className="w-16 h-16 rounded-full bg-blue-500/30"></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={rejectIncomingCall}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg font-semibold text-white"
                >
                  <PhoneOff size={24} />
                  <span>Decline</span>
                </button>
                <button
                  onClick={acceptIncomingCall}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg font-semibold text-white"
                >
                  <Phone size={24} />
                  <span>Accept</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Call Modal */}
        {currentCall && videoClient && (
          <StreamVideo client={videoClient}>
            <StreamCall call={currentCall}>
              <VideoCallUI 
                call={currentCall} 
                onEndCall={endVideoCall}
                otherUser={getOtherUser()}
              />
            </StreamCall>
          </StreamVideo>
        )}
      </div>
    </DashboardLayout>
  )
}
