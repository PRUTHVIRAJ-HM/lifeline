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
