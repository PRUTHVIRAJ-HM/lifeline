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
  Users,
  Download,
  File,
  Trash2
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
  const [peopleSearch, setPeopleSearch] = useState('')
  const [peopleResults, setPeopleResults] = useState([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const [showChatOptions, setShowChatOptions] = useState(null)

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

  // Conversations from Supabase
  const [conversations, setConversations] = useState([])

  // Realtime chat state
  const [messages, setMessages] = useState([])
  // Load user conversations and subscribe to new memberships
  useEffect(() => {
    if (!user) return
    let membershipChannel
    ;(async () => {
      const { data, error } = await supabase
        .from('chat_members')
        .select(`
          chat_id,
          chats:chat_id (id, type, title, created_at, created_by)
        `)
        .eq('user_id', user.id)
      if (!error && data) {
        // Fetch other user profiles for direct chats
        const normalized = await Promise.all(data.map(async (d) => {
          let chatName = d.chats?.title || (d.chats?.type === 'group' ? 'Group Chat' : 'Direct Chat')
          let chatAvatar = (d.chats?.title || 'C').slice(0, 2).toUpperCase()
          
          // For direct chats, get the other user's name
          if (d.chats?.type === 'direct') {
            // First get the other user's ID
            const { data: otherMember } = await supabase
              .from('chat_members')
              .select('user_id')
              .eq('chat_id', d.chat_id)
              .neq('user_id', user.id)
              .maybeSingle()
            
            // Then get their profile
            if (otherMember?.user_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', otherMember.user_id)
                .maybeSingle()
              
              if (profile?.full_name) {
                chatName = profile.full_name
                chatAvatar = profile.full_name.slice(0, 2).toUpperCase()
              }
            }
          }
          
          return {
            id: d.chat_id,
            name: chatName,
            avatar: chatAvatar,
            type: d.chats?.type || 'direct',
            created_by: d.chats?.created_by || null,
            lastMessage: '',
            timestamp: '',
            unread: 0,
            online: false
          }
        }))
        setConversations(normalized)
      }

      membershipChannel = supabase
        .channel('public:chat_members')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_members', filter: `user_id=eq.${user.id}` },
          async (payload) => {
            const { data: chat } = await supabase
              .from('chats')
              .select('*')
              .eq('id', payload.new.chat_id)
              .maybeSingle()
            if (chat) {
              let chatName = chat.title || (chat.type === 'group' ? 'Group Chat' : 'Direct Chat')
              let chatAvatar = (chat.title || 'C').slice(0, 2).toUpperCase()
              
              // For direct chats, get the other user's name
              if (chat.type === 'direct') {
                // First get the other user's ID
                const { data: otherMember } = await supabase
                  .from('chat_members')
                  .select('user_id')
                  .eq('chat_id', chat.id)
                  .neq('user_id', user.id)
                  .maybeSingle()
                
                // Then get their profile
                if (otherMember?.user_id) {
                  const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', otherMember.user_id)
                    .maybeSingle()
                  
                  if (profile?.full_name) {
                    chatName = profile.full_name
                    chatAvatar = profile.full_name.slice(0, 2).toUpperCase()
                  }
                }
              }
              
              setConversations(prev => {
                if (prev.find(c => c.id === chat.id)) return prev
                return [...prev, {
                  id: chat.id,
                  name: chatName,
                  avatar: chatAvatar,
                  type: chat.type,
                  created_by: chat.created_by || null,
                  lastMessage: '',
                  timestamp: '',
                  unread: 0,
                  online: false
                }]
              })
            }
          }
        )
        .subscribe()
    })()

    return () => { if (membershipChannel) supabase.removeChannel(membershipChannel) }
  }, [user, supabase])

  // People search
  useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      if (!peopleSearch.trim()) {
        setPeopleResults([])
        return
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .neq('id', user.id)
        .ilike('full_name', `%${peopleSearch}%`)
        .order('full_name', { ascending: true })
        .limit(25)
      
      if (error) console.error('People search error:', error)
      if (!error && active) setPeopleResults(data || [])
    })()
    return () => { active = false }
  }, [peopleSearch, user, supabase])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowChatOptions(null)
    if (showChatOptions) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showChatOptions])

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
      if (!error && data) {
        setMessages(data)
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
    fetchMessages()

    // Subscribe to new messages and typing indicators
    subscription = supabase
      .channel(`chat:${selectedChat.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
      )
      .subscribe()

    return () => {
      if (subscription) supabase.removeChannel(subscription)
    }
  }, [selectedChat, supabase, user])

  // Send message to Supabase
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return
    setIsTyping(false)
    await supabase.from('messages').insert({
      chat_id: selectedChat.id,
      sender_id: user.id,
      text: messageInput
    })
    setMessageInput('')
  }

  // Handle typing indicator
  const handleTyping = (value) => {
    setMessageInput(value)
    if (!selectedChat) return
    
    setIsTyping(true)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedChat || !user) return

    setUploadingFile(true)
    setUploadProgress(0)

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${selectedChat.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100
            setUploadProgress(Math.round(percent))
          }
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath)

      // Send message with file
      await supabase.from('messages').insert({
        chat_id: selectedChat.id,
        sender_id: user.id,
        text: messageInput.trim() || null,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      })

      setMessageInput('')
      setUploadProgress(0)
    } catch (error) {
      console.error('File upload error:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
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

  // Delete chat
  const deleteChat = async (chatId) => {
    if (!confirm('Are you sure you want to delete this chat? This will remove all messages and files.')) return

    try {
      const res = await fetch(`/api/chats/${chatId}/delete`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Delete failed')
      }

      // Update local state
      setConversations(prev => prev.filter(c => c.id !== chatId))

      if (selectedChat?.id === chatId) {
        setSelectedChat(null)
        setMessages([])
      }

      setShowChatOptions(null)
    } catch (error) {
      console.error('Error deleting chat:', error)
      alert('Failed to delete chat. Please try again.')
    }
  }

  // Leave chat (remove only current user's membership)
  const leaveChat = async (chatId) => {
    if (!confirm('Leave this chat? You can be re-added later.')) return
    try {
      await supabase.from('chat_members').delete().match({ chat_id: chatId, user_id: user.id })
      setConversations(prev => prev.filter(c => c.id !== chatId))
      if (selectedChat?.id === chatId) {
        setSelectedChat(null)
        setMessages([])
      }
      setShowChatOptions(null)
    } catch (error) {
      console.error('Error leaving chat:', error)
      alert('Failed to leave chat. Please try again.')
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const startDirectChat = async (otherUserId) => {
    console.log('Starting direct chat with:', otherUserId)
    if (!user || !otherUserId) {
      console.error('Missing user or otherUserId')
      return
    }
    
    // First, get the other user's profile
    const { data: otherProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', otherUserId)
      .maybeSingle()
    
    console.log('Other profile:', otherProfile, 'Error:', profileErr)

    const chatName = otherProfile?.full_name || 'Direct Chat'
    const chatAvatar = otherProfile?.full_name?.slice(0, 2).toUpperCase() || 'DC'

    const { data: chat, error: chatErr } = await supabase
      .from('chats')
      .insert({ type: 'direct', title: null, created_by: user.id })
      .select()
      .maybeSingle()
    
    console.log('Chat created:', chat, 'Error:', chatErr)
    if (chatErr || !chat) {
      console.error('Failed to create chat:', chatErr)
      return
    }

    const { error: memErr } = await supabase
      .from('chat_members')
      .insert([
        { chat_id: chat.id, user_id: user.id, role: 'member' },
        { chat_id: chat.id, user_id: otherUserId, role: 'member' }
      ])
    
    console.log('Members added, error:', memErr)
    if (memErr) {
      console.error('Failed to add members:', memErr)
      return
    }
    if (memErr) return

    const newChat = {
      id: chat.id,
      name: chatName,
      avatar: chatAvatar,
      type: 'direct',
      created_by: user.id,
      lastMessage: '',
      timestamp: '',
      unread: 0,
      online: false
    }

    setConversations(prev => {
      if (prev.find(c => c.id === chat.id)) return prev
      return [...prev, newChat]
    })
    
    // Immediately select the chat
    setSelectedChat(newChat)
  }

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

          {/* Find People */}
          <div className="p-4 border-b border-gray-200">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Find people</label>
            <input
              type="text"
              value={peopleSearch}
              onChange={(e) => setPeopleSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C832] focus:border-transparent"
            />
            <div className="mt-3 max-h-40 overflow-y-auto space-y-2">
              {peopleResults.map(p => (
                <button
                  key={p.id}
                  onClick={() => startDirectChat(p.id)}
                  className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {(p.full_name || 'U').slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm text-gray-900">{p.full_name || 'User'}</div>
                    {p.email && <div className="text-xs text-gray-500">{p.email}</div>}
                  </div>
                </button>
              ))}
              {peopleResults.length === 0 && (
                <div className="text-xs text-gray-500">No users found</div>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`relative w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedChat?.id === conv.id ? 'bg-gray-100' : ''
                }`}
              >
                <button
                  onClick={() => setSelectedChat(conv)}
                  className="flex-1 flex items-start gap-3"
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
                
                {/* Options Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowChatOptions(showChatOptions === conv.id ? null : conv.id)
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <MoreVertical size={16} className="text-gray-500" />
                  </button>
                  
                  {showChatOptions === conv.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                      {conv.created_by === user?.id ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(conv.id)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 transition-colors text-sm"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            leaveChat(conv.id)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-gray-700 transition-colors text-sm"
                        >
                          <X size={14} />
                          <span>Leave chat</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-md ${
                      message.sender_id === user.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-900'
                    } rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    {message.file_url && (
                      <div className="mb-2">
                        {message.file_type?.startsWith('image/') ? (
                          <img 
                            src={message.file_url} 
                            alt={message.file_name}
                            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.file_url, '_blank')}
                          />
                        ) : (
                          <a
                            href={message.file_url}
                            download={message.file_name}
                            className={`flex items-center gap-2 p-3 rounded-lg ${
                              message.sender_id === user.id ? 'bg-gray-800' : 'bg-gray-100'
                            } hover:opacity-80 transition-opacity`}
                          >
                            <File size={20} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{message.file_name}</div>
                              <div className="text-xs opacity-70">
                                {message.file_size ? `${(message.file_size / 1024).toFixed(1)} KB` : 'File'}
                              </div>
                            </div>
                            <Download size={18} />
                          </a>
                        )}
                      </div>
                    )}
                    {message.text && <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>}
                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      message.sender_id === user.id ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-gray-100 rounded-2xl px-6 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {uploadingFile && (
                <div className="mb-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Uploading file...</span>
                    <span className="text-sm font-medium text-gray-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#F5C832] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="flex items-end gap-3">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
                <label 
                  htmlFor="file-upload"
                  className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${uploadingFile ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Paperclip size={20} className="text-gray-600" />
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
                <label 
                  htmlFor="image-upload"
                  className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${uploadingFile ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <ImageIcon size={20} className="text-gray-600" />
                </label>
                
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => handleTyping(e.target.value)}
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
