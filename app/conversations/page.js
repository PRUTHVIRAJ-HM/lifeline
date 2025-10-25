'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  MessageCircle,
  Search,
  Video,
  Phone,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  X,
  Check,
  CheckCheck,
  Circle,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Users
} from 'lucide-react'

export default function ConversationsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  // Mock conversations data
  const conversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'SJ',
      lastMessage: 'Hey! Did you finish the assignment?',
      timestamp: '2m ago',
      unread: 2,
      online: true,
      type: 'direct'
    },
    {
      id: 2,
      name: 'Web Dev Study Group',
      avatar: '👥',
      lastMessage: 'John: The meeting is at 3 PM',
      timestamp: '15m ago',
      unread: 0,
      online: false,
      type: 'group',
      members: 8
    },
    {
      id: 3,
      name: 'Michael Chen',
      avatar: 'MC',
      lastMessage: 'Thanks for the notes!',
      timestamp: '1h ago',
      unread: 0,
      online: true,
      type: 'direct'
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      avatar: 'ER',
      lastMessage: 'Can we schedule a video call?',
      timestamp: '3h ago',
      unread: 1,
      online: false,
      type: 'direct'
    },
    {
      id: 5,
      name: 'UI/UX Designers',
      avatar: '🎨',
      lastMessage: 'New design resources shared',
      timestamp: '5h ago',
      unread: 0,
      online: false,
      type: 'group',
      members: 12
    },
    {
      id: 6,
      name: 'Dr. Lisa Wang',
      avatar: 'LW',
      lastMessage: 'Assignment deadline extended',
      timestamp: '1d ago',
      unread: 0,
      online: false,
      type: 'direct'
    }
  ]

  // Realtime chat state
  const [messages, setMessages] = useState([])

  // Fetch initial messages and subscribe to realtime updates
  useEffect(() => {
    if (!selectedChat) return
    let subscription
    const fetchMessages = async () => {
      // Fetch initial messages from Supabase
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', selectedChat.id)
        .order('created_at', { ascending: true })
      if (!error && data) setMessages(data)
    }
    fetchMessages()

    // Subscribe to new messages
    subscription = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      if (subscription) supabase.removeChannel(subscription)
    }
  }, [selectedChat, supabase])

  // Send message to Supabase
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return
    await supabase.from('messages').insert({
      chat_id: selectedChat.id,
      sender_id: user.id,
      text: messageInput,
      created_at: new Date().toISOString()
    })
    setMessageInput('')
  }

  const handleVideoCall = () => {
    setShowVideoCall(true)
  }

  const handleEndCall = () => {
    setShowVideoCall(false)
    setIsVideoOn(true)
    setIsMicOn(true)
    setIsScreenSharing(false)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-2rem)] flex">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Conversations</h1>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedChat?.id === conv.id ? 'bg-gray-100' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                    {conv.avatar}
                  </div>
                  {conv.online && conv.type === 'direct' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                    <span className="text-xs text-gray-500">{conv.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  {conv.type === 'group' && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Users size={12} />
                      <span>{conv.members} members</span>
                    </div>
                  )}
                </div>

                {/* Unread Badge */}
                {conv.unread > 0 && (
                  <div className="w-6 h-6 bg-[#F5C832] rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                    {selectedChat.avatar}
                  </div>
                  {selectedChat.online && selectedChat.type === 'direct' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedChat.online ? 'Active now' : selectedChat.type === 'group' ? `${selectedChat.members} members` : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleVideoCall}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Start video call"
                >
                  <Video size={20} className="text-gray-700" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Start voice call"
                >
                  <Phone size={20} className="text-gray-700" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="More options"
                >
                  <MoreVertical size={20} className="text-gray-700" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md ${
                      message.sender_id === user.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-900'
                    } rounded-2xl px-4 py-3 shadow-sm`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      message.sender_id === user.id ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ImageIcon size={20} className="text-gray-600" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type a message..."
                    rows="1"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent resize-none"
                  />
                  <button className="absolute right-3 bottom-3 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <Smile size={20} className="text-gray-600" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-[#F5C832] hover:bg-yellow-400 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-full transition-colors"
                >
                  <Send size={20} className="text-gray-900" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-600">Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}

        {/* Video Call Modal */}
        {showVideoCall && selectedChat && (
          <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
            {/* Video Area */}
            <div className="flex-1 relative">
              {/* Remote Video (Main) */}
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-4xl font-bold text-white mb-4 mx-auto">
                    {selectedChat.avatar}
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">{selectedChat.name}</h2>
                  <p className="text-gray-400">Calling...</p>
                </div>
              </div>

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-6 right-6 w-64 h-48 bg-gray-700 rounded-xl overflow-hidden border-2 border-gray-600">
                <div className="w-full h-full flex items-center justify-center">
                  {isVideoOn ? (
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-bold text-white mb-2 mx-auto">
                        {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <p className="text-white text-sm">You</p>
                    </div>
                  ) : (
                    <div className="text-white text-sm">Camera Off</div>
                  )}
                </div>
              </div>

              {/* Call Info */}
              <div className="absolute top-6 left-6 bg-black/50 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">00:45</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-900 border-t border-gray-800 px-8 py-6">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                  }`}
                  title={isMicOn ? 'Mute' : 'Unmute'}
                >
                  {isMicOn ? (
                    <Mic size={24} className="text-white" />
                  ) : (
                    <MicOff size={24} className="text-white" />
                  )}
                </button>

                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                  }`}
                  title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoOn ? (
                    <Video size={24} className="text-white" />
                  ) : (
                    <VideoOff size={24} className="text-white" />
                  )}
                </button>

                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isScreenSharing ? 'bg-[#F5C832] hover:bg-yellow-400' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                  <Monitor size={24} className={isScreenSharing ? 'text-gray-900' : 'text-white'} />
                </button>

                <button
                  onClick={handleEndCall}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                  title="End call"
                >
                  <PhoneOff size={24} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
