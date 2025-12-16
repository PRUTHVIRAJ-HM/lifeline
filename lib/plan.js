import { createClient } from './supabase/client'

// Feature keys used across the app
export const FEATURES = {
  feeds: 'feeds',
  interview: 'interview',
  resume: 'resume',
  community: 'community',
  analytics: 'analytics',
  cognix: 'cognix',
  arena: 'arena',
  curriculum: 'curriculum',
  assignment: 'assignment',
  conversations: 'conversations',
}

// Usage limits per plan
export const USAGE_LIMITS = {
  Free: {
    maxCourses: 5,
    maxAIQueries: 100, // per month
  },
  Pro: {
    maxCourses: 15,
    maxAIQueries: 500, // per month
  },
  Supreme: {
    maxCourses: 30,
    maxAIQueries: -1, // unlimited
  },
}

// Matrix of feature availability by plan
export const PLAN_MATRIX = {
  Free: new Set([
    FEATURES.curriculum,
    FEATURES.assignment,
    FEATURES.cognix,
    FEATURES.community,
    FEATURES.analytics,
    FEATURES.conversations,
    FEATURES.arena,
    // feeds, interview, resume are excluded
  ]),
  Pro: new Set([
    FEATURES.curriculum,
    FEATURES.assignment,
    FEATURES.cognix,
    FEATURES.community,
    FEATURES.analytics,
    FEATURES.conversations,
    FEATURES.arena,
    FEATURES.resume,
    FEATURES.feeds,
    // interview excluded
  ]),
  Supreme: new Set([
    FEATURES.curriculum,
    FEATURES.assignment,
    FEATURES.cognix,
    FEATURES.community,
    FEATURES.analytics,
    FEATURES.conversations,
    FEATURES.arena,
    FEATURES.resume,
    FEATURES.feeds,
    FEATURES.interview,
  ]),
}

export async function getCurrentPlan() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Free'
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (payments && payments.length) {
    const latest = payments.find((p) => p.status === 'success')
    if (latest?.plan_name) return latest.plan_name
  }
  return 'Free'
}

export function hasAccess(planName, featureKey) {
  const matrix = PLAN_MATRIX[planName || 'Free'] || PLAN_MATRIX.Free
  return matrix.has(featureKey)
}

export function getUsageLimit(planName, limitKey) {
  const limits = USAGE_LIMITS[planName || 'Free'] || USAGE_LIMITS.Free
  return limits[limitKey]
}

export async function getUserUsage(userId) {
  const supabase = createClient()
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  
  const { data, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching usage:', error)
    return { course_count: 0, ai_queries: 0 }
  }
  
  if (!data) {
    // Create initial usage record
    const { data: newData } = await supabase
      .from('user_usage')
      .insert({ user_id: userId, month: currentMonth, course_count: 0, ai_queries: 0 })
      .select()
      .single()
    return newData || { course_count: 0, ai_queries: 0 }
  }
  
  return data
}

export async function incrementUsage(userId, field) {
  const supabase = createClient()
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  // Ensure record exists
  await getUserUsage(userId)
  
  const { error } = await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_month: currentMonth,
    p_field: field
  })
  
  if (error) {
    console.error('Error incrementing usage:', error)
  }
}

