/**
 * Scoring System for Student Leaderboard
 * 
 * Base Points:
 * - Correct Answer: 10 points per question
 * 
 * Bonuses:
 * - Perfect Score (100%): +50 bonus points
 * - High Score (80-99%): +25 bonus points
 * - Good Score (60-79%): +10 bonus points
 * - Streak Bonus: +5 points per consecutive assignment completed
 * 
 * Example: 5/5 questions = 50 base + 50 perfect bonus = 100 points
 */

import { createClient } from '@/lib/supabase/client'

const POINTS_PER_QUESTION = 10
const PERFECT_SCORE_BONUS = 50
const HIGH_SCORE_BONUS = 25
const GOOD_SCORE_BONUS = 10
const STREAK_BONUS = 5

/**
 * Calculate points from a quiz result
 */
export function calculateAssignmentPoints(quizResult) {
  if (!quizResult || !quizResult.score || !quizResult.total) {
    return { basePoints: 0, bonusPoints: 0, totalPoints: 0 }
  }

  const { score, total, percentage } = quizResult
  
  // Base points for correct answers
  const basePoints = score * POINTS_PER_QUESTION
  
  // Performance bonus
  let bonusPoints = 0
  if (percentage === 100) {
    bonusPoints = PERFECT_SCORE_BONUS
  } else if (percentage >= 80) {
    bonusPoints = HIGH_SCORE_BONUS
  } else if (percentage >= 60) {
    bonusPoints = GOOD_SCORE_BONUS
  }
  
  const totalPoints = basePoints + bonusPoints
  
  return { basePoints, bonusPoints, totalPoints }
}

/**
 * Update user's total score in the database
 */
export async function updateUserScore(userId) {
  const supabase = createClient()
  
  // Get all completed assignments for this user
  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('quiz_result, created_at, status')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .not('quiz_result', 'is', null)
    .order('created_at', { ascending: true })

  if (assignmentsError) {
    console.error('Error fetching assignments:', assignmentsError)
    return { success: false, error: assignmentsError }
  }

  if (!assignments || assignments.length === 0) {
    // No completed assignments yet, initialize with 0 score
    const { error: upsertError } = await supabase
      .from('user_scores')
      .upsert({
        user_id: userId,
        total_score: 0,
        assignment_score: 0,
        bonus_points: 0,
        assignments_completed: 0,
        perfect_scores: 0,
        current_streak: 0,
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_id' })

    return { success: !upsertError, error: upsertError }
  }

  // Calculate total score from all assignments
  let totalAssignmentScore = 0
  let totalBonusPoints = 0
  let perfectScoreCount = 0
  let currentStreak = 0
  let consecutiveCompletions = 0

  assignments.forEach((assignment, index) => {
    const points = calculateAssignmentPoints(assignment.quiz_result)
    totalAssignmentScore += points.basePoints
    totalBonusPoints += points.bonusPoints
    
    if (assignment.quiz_result.percentage === 100) {
      perfectScoreCount++
    }

    // Check for consecutive completions (streak)
    if (index === 0) {
      consecutiveCompletions = 1
    } else {
      const prevDate = new Date(assignments[index - 1].created_at)
      const currDate = new Date(assignment.created_at)
      const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24))
      
      // If completed within 2 days of previous, continue streak
      if (daysDiff <= 2) {
        consecutiveCompletions++
      } else {
        consecutiveCompletions = 1
      }
    }
    
    currentStreak = Math.max(currentStreak, consecutiveCompletions)
  })

  // Add streak bonus
  const streakBonus = (currentStreak - 1) * STREAK_BONUS // -1 because first assignment doesn't get streak bonus
  totalBonusPoints += streakBonus

  const totalScore = totalAssignmentScore + totalBonusPoints

  // Update or insert user score
  const { data, error: upsertError } = await supabase
    .from('user_scores')
    .upsert({
      user_id: userId,
      total_score: totalScore,
      assignment_score: totalAssignmentScore,
      bonus_points: totalBonusPoints,
      assignments_completed: assignments.length,
      perfect_scores: perfectScoreCount,
      current_streak: currentStreak,
      last_updated: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (upsertError) {
    console.error('Error updating user score:', upsertError)
    return { success: false, error: upsertError }
  }

  return { success: true, data, scoreBreakdown: {
    totalScore,
    assignmentScore: totalAssignmentScore,
    bonusPoints: totalBonusPoints,
    perfectScores: perfectScoreCount,
    streak: currentStreak,
    assignmentsCompleted: assignments.length
  }}
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(limit = 10) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_scores')
    .select('*')
    .order('total_score', { ascending: false })
    .order('last_updated', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return { success: false, error }
  }

  // Fetch profiles separately for each user
  if (data && data.length > 0) {
    const userIds = data.map(u => u.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)

    // Merge profiles into leaderboard data
    const enrichedData = data.map(user => ({
      ...user,
      profiles: profiles?.find(p => p.id === user.user_id) || null
    }))

    return { success: true, data: enrichedData }
  }

  return { success: true, data }
}

/**
 * Get user's rank and score
 */
export async function getUserRank(userId) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_scores')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  // If error or no data, return null (user hasn't completed any assignments yet)
  if (error) {
    console.error('Error fetching user rank:', error)
    return { success: false, error }
  }

  if (!data) {
    // User has no score entry yet
    return { 
      success: true, 
      data: null
    }
  }

  // Fetch user profile separately
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', userId)
    .single()

  // Dynamic rank: count users with higher score
  let dynamicRank = null
  if (data?.total_score !== undefined) {
    const { count: higherCount } = await supabase
      .from('user_scores')
      .select('id', { count: 'exact', head: true })
      .gt('total_score', data.total_score)
    dynamicRank = (higherCount || 0) + 1
  }

  return { 
    success: true, 
    data: {
      ...data,
      profiles: profile || null,
      dynamic_rank: dynamicRank,
      effective_rank: data.rank || dynamicRank
    }
  }
}
