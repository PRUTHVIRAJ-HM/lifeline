'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'

export default function SettingsBillingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [payMessage, setPayMessage] = useState('')
  const [payments, setPayments] = useState([])
  const [currentPlanName, setCurrentPlanName] = useState('Free')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      await fetchPayments(user)
      setLoading(false)
    }
    getUser()
    const scriptId = 'razorpay-checkout'
    if (typeof window !== 'undefined' && !document.getElementById(scriptId)) {
      const s = document.createElement('script')
      s.id = scriptId
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.async = true
      document.body.appendChild(s)
    }
  }, [router, supabase])

  async function createOrder(amount) {
    const res = await fetch('/api/billing/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    if (!res.ok) throw new Error('Unable to create order')
    return res.json()
  }

  async function fetchPayments(currentUser = user) {
    if (!currentUser) return
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
    if (!error && data) {
      setPayments(data)
      const latest = data.find((p) => p.status === 'success')
      if (latest?.plan_name) setCurrentPlanName(latest.plan_name)
    }
  }

  async function startCheckout(planName, amountInRupees) {
    try {
      setPaying(true)
      setPayMessage('')
      const amount = amountInRupees * 100
      const { orderId, key } = await createOrder(amount)
      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'Academix',
        description: `${planName} Membership`,
        order_id: orderId,
        theme: { color: '#0EA5E9' },
        handler: async function (response) {
          try {
            const { error } = await supabase
              .from('payments')
              .insert({
                user_id: user?.id,
                plan_name: planName,
                amount_rupees: amountInRupees,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_signature: response.razorpay_signature,
                status: 'success'
              })
            if (error) throw error
            setPayMessage('Payment successful! Membership activated.')
            await fetchPayments()
          } catch (err) {
            setPayMessage('Payment succeeded but logging failed: ' + (err.message || 'Unknown error'))
          }
        },
        modal: {
          ondismiss: function () { setPayMessage('Payment cancelled') },
        },
        prefill: {
          name: user?.user_metadata?.full_name || 'Academix User',
          email: user?.email || 'user@example.com',
          contact: '9999999999',
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      setPayMessage(e.message || 'Payment failed')
    } finally {
      setPaying(false)
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
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-300 mb-1">Current Plan</p>
                <h3 className="text-2xl font-bold">{currentPlanName === 'Free' ? 'Free Plan' : `${currentPlanName} Plan`}</h3>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">{currentPlanName === 'Free' ? 'Free Tier' : 'Paid Tier'}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all">
                <div className="mb-4"><h4 className="text-lg font-bold text-gray-900">Free</h4><p className="text-sm text-gray-600 mt-1">Perfect for beginners</p></div>
                <div className="mb-6"><div className="flex items-baseline"><span className="text-3xl font-bold text-gray-900">Free</span><span className="text-gray-600 ml-2">/year</span></div></div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Access to 5 courses</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">AI assistance (100 queries/month)</span></div>
                  <div className="flex items-start space-x-2"><X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Interview Preperation</span></div>
                  <div className="flex items-start space-x-2"><X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Resume Builder</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Community</span></div>
                  <div className="flex items-start space-x-2"><X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Feeds</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Analytics</span></div>
                </div>
                <button className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">Free</button>
              </div>
              <div className="border-2 border-[#F5C832] rounded-xl p-6 relative shadow-xl transform scale-105">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F5C832] text-gray-900 px-4 py-1 rounded-full text-xs font-bold">MOST POPULAR</div>
                <div className="mb-4"><h4 className="text-lg font-bold text-gray-900">Pro</h4><p className="text-sm text-gray-600 mt-1">For serious learners</p></div>
                <div className="mb-6"><div className="flex items-baseline"><span className="text-3xl font-bold text-gray-900">₹999</span><span className="text-gray-600 ml-2">/year</span></div></div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Access to 15 courses</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">AI assistance (500 queries/month)</span></div>
                  <div className="flex items-start space-x-2"><X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Interview Preperation</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Resume Builder</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Community</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Feeds</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Analytics</span></div>
                </div>
                <button disabled={paying} onClick={() => startCheckout('Pro', 999)} className="w-full py-3 bg-[#F5C832] text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors font-bold disabled:opacity-50">{paying ? 'Processing...' : 'Upgrade to Pro'}</button>
              </div>
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all">
                <div className="mb-4"><h4 className="text-lg font-bold text-gray-900">Supreme</h4><p className="text-sm text-gray-600 mt-1">Advanced learners</p></div>
                <div className="mb-6"><div className="flex items-baseline"><span className="text-3xl font-bold text-gray-900">₹1699</span><span className="text-gray-600 ml-2">/year</span></div></div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Access to 30 courses</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">AI assistance (Unlimited queries/month)</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Interview Preperation</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Resume Builder</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Community</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Feeds</span></div>
                  <div className="flex items-start space-x-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-700">Analytics</span></div>
                </div>
                <button disabled={paying} onClick={() => startCheckout('Supreme', 1699)} className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50">{paying ? 'Processing...' : 'Upgrade to Supreme'}</button>
              </div>
            </div>
            {payMessage && (<div className="mt-4 p-3 rounded-lg border border-gray-200 text-sm text-gray-700">{payMessage}</div>)}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                  <div>Date</div>
                  <div>Description</div>
                  <div>Payment ID</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
              </div>
              {payments && payments.length > 0 ? (
                <div>
                  {payments.map((p) => (
                    <div key={p.id} className="px-6 py-3 border-t border-gray-100">
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div className="text-gray-700">{new Date(p.created_at).toLocaleString()}</div>
                        <div className="text-gray-900 font-medium">{p.plan_name} Membership</div>
                        <div className="text-gray-700 truncate">{p.razorpay_payment_id || '-'}</div>
                        <div className="text-gray-900 font-semibold">₹{p.amount_rupees}</div>
                        <div className={`font-semibold ${p.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{p.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center"><p className="text-gray-500">No billing history available</p></div>
              )}
            </div>
          </div>
        </div>
  )
}
