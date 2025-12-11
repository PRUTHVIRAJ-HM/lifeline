import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(request) {
  try {
    const { amount, currency, courseId, courseName } = await request.json()

    if (!amount || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret || keyId === 'your_key_id' || keySecret === 'your_key_secret') {
      console.error('Razorpay keys not configured properly')
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please add valid Razorpay keys.' },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency || 'INR',
      receipt: `order_${courseId}_${Date.now()}`,
      notes: {
        courseId: String(courseId),
        courseName: courseName || 'Course Purchase',
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    )
  }
}
