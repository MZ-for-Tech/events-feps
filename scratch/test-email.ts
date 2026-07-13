import { Resend } from 'resend'

const resend = new Resend('re_DBze7a4C_HSKsLLQshXEBDZ7c83NxdV9u')

async function run() {
  console.log('Sending test email via Resend in workspace context...')
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'mzfortechsol@gmail.com',
      subject: 'Resend Test Email',
      html: '<p>If you see this, Resend integration is working perfectly!</p>'
    })
    console.log('Email response:', data)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

run()
