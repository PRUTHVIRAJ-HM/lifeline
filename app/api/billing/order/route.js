import { NextResponse } from 'next/server'

// Create Razorpay order using test keys
export async function POST(req) {
  try {
    const { amount } = await req.json()
    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay env keys missing' }, { status: 500 })
    }

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount, // in paise
        currency: 'INR',
        payment_capture: 1,
        notes: { purpose: 'Academix Membership' },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Razorpay order failed', details: text }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ orderId: data.id, key: keyId })
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
