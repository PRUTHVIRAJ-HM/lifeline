'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Save, ExternalLink, Linkedin } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'

export default function SettingsProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [avatarUrl, setAvatarUrl] = useState('')
  const fileInputRef = useRef(null)
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bio: '',
    location: '',
    portfolioLink: '',
    linkedinProfile: ''
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (profileError && profileError.code !== 'PGRST116') console.error(profileError)
      if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || ''
          })
          .select()
          .single()
        if (insertError) console.error(insertError)
        else {
          setProfileData({
            fullName: newProfile.full_name || '',
            email: newProfile.email || user.email || '',
            bio: newProfile.bio || '',
            location: newProfile.location || '',
            portfolioLink: newProfile.portfolio_link || '',
            linkedinProfile: newProfile.linkedin_profile || ''
          })
          setAvatarUrl(newProfile.avatar_url || '')
        }
      } else {
        setProfileData({
          fullName: profile.full_name || '',
          email: profile.email || user.email || '',
          bio: profile.bio || '',
          location: profile.location || '',
          portfolioLink: profile.portfolio_link || '',
          linkedinProfile: profile.linkedin_profile || ''
        })
        setAvatarUrl(profile.avatar_url || '')
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  const handleAvatarClick = () => fileInputRef.current?.click()
  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true)
      setMessage({ type: '', text: '' })
      const file = event.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith('image/')) { setMessage({ type: 'error', text: 'Please select an image file' }); return }
      if (file.size > 2 * 1024 * 1024) { setMessage({ type: 'error', text: 'Image size should be less than 2MB' }); return }
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      if (updateError) throw updateError
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      setAvatarUrl(publicUrl)
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' })
    } catch (error) {
      console.error('Avatar upload error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to upload image' })
    } finally {
      setUploading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          bio: profileData.bio,
          location: profileData.location,
          portfolio_link: profileData.portfolioLink,
          linkedin_profile: profileData.linkedinProfile,
          avatar_url: avatarUrl,
          email: profileData.email
        })
        .eq('id', user.id)
      if (error) throw error
      await supabase.auth.updateUser({ data: { full_name: profileData.fullName, avatar_url: avatarUrl } })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>{message.text}</div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />

          <div className="mb-8 flex items-start space-x-6">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-28 h-28 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white text-4xl font-semibold">
                  {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <button type="button" onClick={handleAvatarClick} disabled={uploading} className="absolute bottom-0 right-0 p-2 bg-gray-900 rounded-full text-white hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50">
                {uploading ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<Camera className="w-4 h-4" />)}
              </button>
            </div>
            <div className="pt-2">
              <h3 className="font-semibold text-gray-900 text-lg">{profileData.fullName || 'User Name'}</h3>
              <p className="text-sm text-gray-500 mt-1">{profileData.email}</p>
              <p className="text-xs text-gray-400 mt-2">Click the camera icon to update your profile picture</p>
              <p className="text-xs text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" value={profileData.email} disabled className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none" placeholder="Tell us about yourself..." />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input type="text" value={profileData.location} onChange={(e) => setProfileData({ ...profileData, location: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" placeholder="Enter your location" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><ExternalLink className="w-4 h-4 mr-1.5" />Portfolio/Resume Link</label>
                <input type="url" value={profileData.portfolioLink} onChange={(e) => setProfileData({ ...profileData, portfolioLink: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" placeholder="https://your-portfolio.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Linkedin className="w-4 h-4 mr-1.5 text-blue-600" />LinkedIn Profile URL</label>
              <input type="url" value={profileData.linkedinProfile} onChange={(e) => setProfileData({ ...profileData, linkedinProfile: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" placeholder="https://linkedin.com/in/your-profile" />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="flex items-center space-x-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
  )
}
