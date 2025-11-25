'use client'

import { useEffect, useState } from 'react'
import { getLeaderboard, getUserRank } from '@/lib/scoring'
import { Trophy, Medal, Award, TrendingUp, Zap, Target } from 'lucide-react'

export default function Leaderboard({ userId, showTop = 10, compact = false }) {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [userRankData, setUserRankData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [userId])

  const loadLeaderboard = async () => {
    setLoading(true)
    
    // Load top users
    const { success, data } = await getLeaderboard(showTop)
    if (success && data) {
      setLeaderboardData(data)
    }

    // Load current user's rank if not in top
    if (userId) {
      const { success: userSuccess, data: userData } = await getUserRank(userId)
      if (userSuccess && userData) {
        setUserRankData(userData)
      }
    }

    setLoading(false)
  }

  const getMedalIcon = (rank) => {
    switch(rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-400">#{rank}</span>
    }
  }

  const getBadges = (user) => {
    const badges = []
    if (user.perfect_scores >= 5) badges.push({ icon: <Zap className="w-3 h-3" />, color: 'text-yellow-500', tooltip: `${user.perfect_scores} Perfect Scores` })
    if (user.current_streak >= 3) badges.push({ icon: <TrendingUp className="w-3 h-3" />, color: 'text-blue-500', tooltip: `${user.current_streak} Day Streak` })
    if (user.assignments_completed >= 10) badges.push({ icon: <Target className="w-3 h-3" />, color: 'text-green-500', tooltip: `${user.assignments_completed} Completed` })
    return badges
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Top Performers</h3>
          <Trophy className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="space-y-2">
          {leaderboardData.slice(0, 3).map((user, index) => (
            <div key={user.user_id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getMedalIcon(index + 1)}
                <span className="text-sm font-medium text-gray-700">
                  {user.profiles?.full_name || user.profiles?.email?.split('@')[0] || 'Anonymous'}
                </span>
              </div>
              <span className="text-sm font-bold text-[#FF8A65]">{user.total_score}</span>
            </div>
          ))}
        </div>
        {userRankData && userRankData.rank > 3 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">#{userRankData.rank}</span>
                <span className="text-sm font-medium text-gray-700">You</span>
              </div>
              <span className="text-sm font-bold text-blue-600">{userRankData.total_score}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Leaderboard</h3>
        <button 
          onClick={loadLeaderboard}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      {leaderboardData.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No scores yet. Complete assignments to join the leaderboard!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {leaderboardData.map((user, index) => {
              const isCurrentUser = user.user_id === userId
              const badges = getBadges(user)
              
              return (
                <div 
                  key={user.user_id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    isCurrentUser 
                      ? 'bg-blue-50 border-2 border-blue-500' 
                      : index < 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                        : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    {getMedalIcon(index + 1)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold truncate ${
                        isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {user.profiles?.full_name || user.profiles?.email?.split('@')[0] || 'Anonymous'}
                        {isCurrentUser && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                      </p>
                      {badges.map((badge, i) => (
                        <span key={i} className={badge.color} title={badge.tooltip}>
                          {badge.icon}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{user.assignments_completed} assignments</span>
                      {user.perfect_scores > 0 && (
                        <span className="text-yellow-600">★ {user.perfect_scores} perfect</span>
                      )}
                      {user.current_streak > 1 && (
                        <span className="text-blue-600">🔥 {user.current_streak} streak</span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-2xl font-bold ${
                      isCurrentUser ? 'text-blue-600' : 'text-[#FF8A65]'
                    }`}>
                      {user.total_score}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current user's position if not in top */}
          {userRankData && !leaderboardData.find(u => u.user_id === userId) && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Your Position</p>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 border-2 border-blue-500">
                <div className="flex-shrink-0">
                  <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-blue-600">
                    #{userRankData.rank}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">
                    {userRankData.profiles?.full_name || 'You'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {userRankData.assignments_completed} assignments completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{userRankData.total_score}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
