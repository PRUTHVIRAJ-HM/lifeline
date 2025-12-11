import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      userId,
    } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification fields' },
        { status: 400 }
      )
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')

    const isValid = expectedSignature === razorpay_signature

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Store enrollment in Supabase
    if (courseId && userId) {
      const supabase = await createClient()
      
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          status: 'completed',
          enrolled_at: new Date().toISOString(),
        })

      if (enrollError) {
        console.error('Enrollment storage error:', enrollError)
        // Payment is valid, but enrollment failed - log for manual intervention
        return NextResponse.json({
          success: true,
          warning: 'Payment successful but enrollment storage failed',
          paymentId: razorpay_payment_id,
        })
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: error.message },
      { status: 500 }
    )
  }
}
