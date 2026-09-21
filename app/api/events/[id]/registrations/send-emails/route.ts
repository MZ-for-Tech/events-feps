import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import nodemailer from 'nodemailer'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.EVENTS_CREATE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params
  try {
    const { data: event } = await supabase.from('events').select('*').eq('id', id).single()
    if (!event) return new NextResponse('Event not found', { status: 404 })

    const { data: registrations } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', id)

    if (!registrations || registrations.length === 0) {
      return new NextResponse('No registered attendees found for this event.', { status: 400 })
    }

    const smtpUser = process.env.EMAIL_SERVER_USER
    const smtpPass = process.env.EMAIL_SERVER_PASSWORD
    if (!smtpUser || !smtpPass) {
      return new NextResponse('SMTP credentials are not configured in environment variables.', { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass }
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const mailJobs = registrations.map((r) => {
      let typeLabelAr = 'الرقم القومي'
      let typeLabelEn = 'National ID'
      if (r.identifier_type === 'CREDIT_CODE') { typeLabelAr = 'كود الساعات المعتمدة'; typeLabelEn = 'Credit Hour Code' }
      else if (r.identifier_type === 'PHONE')  { typeLabelAr = 'رقم الهاتف'; typeLabelEn = 'Phone Number' }

      const mailOptions = {
        from: `"FEPS Events" <${smtpUser}>`,
        to: r.email,
        subject: `FEPS Events: Feedback Evaluation - ${event.title}`,
        html: `
          <div style="font-family: sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; border-bottom: 2px solid #1A3A6E; padding-bottom: 15px; margin-bottom: 20px;">
              <h2 style="color: #1A3A6E; margin: 0;">كلية الاقتصاد والعلوم السياسية</h2>
              <p style="color: #bc9c65; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">جامعة القاهرة</p>
            </div>
            <p style="font-size: 16px; font-weight: bold;">عزيزنا الحاضر / الكريم،</p>
            <p>تم فتح باب استبيان التقييم للفعالية الأكاديمية: <strong>${event.title_ar || event.title}</strong>.</p>
            <div style="background: #fcf8e3; border: 1px solid #faebcc; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #8a6d3b; font-size: 14px; font-weight: bold;">رمز التحقق الخاص بك لملء الاستبيان:</p>
              <p style="font-family: monospace; font-size: 24px; color: #1A3A6E; margin: 0; font-weight: bold; letter-spacing: 2px;">${r.identifier}</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">(${typeLabelAr})</p>
            </div>
            <p style="margin: 25px 0; text-align: center;">
              <a href="${appUrl}/ar/events/${event.id}/survey"
                 style="background: #1A3A6E; color: white; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 14px;">
                الذهاب لصفحة الاستبيان والتقييم
              </a>
            </p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <div style="direction: ltr; text-align: left; font-size: 13px; color: #666;">
              <p style="font-weight: bold;">Dear Attendee,</p>
              <p>Feedback evaluation is now open for: <strong>${event.title}</strong>.</p>
              <p>Your verification code is: <strong style="color: #1A3A6E; font-family: monospace; font-size: 16px;">${r.identifier}</strong> (${typeLabelEn})</p>
              <p>Please click the button above or visit <a href="${appUrl}/en/events/${event.id}/survey" style="color: #bc9c65; font-weight: bold;">this link</a> to submit feedback.</p>
            </div>
            <p style="color: #999; font-size: 11px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
              Faculty of Economics and Political Science - Cairo University
            </p>
          </div>
        `
      }
      return () => transporter.sendMail(mailOptions)
    })

    const chunkSize = 5
    for (let i = 0; i < mailJobs.length; i += chunkSize) {
      const chunk = mailJobs.slice(i, i + chunkSize)
      await Promise.all(chunk.map((job) => job()))
    }

    return NextResponse.json({ success: true, count: registrations.length })
  } catch (error) {
    console.error('Error broadcasting survey emails:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
