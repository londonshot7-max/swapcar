import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const { to, subject, html } = await request.json()

  const { data, error } = await resend.emails.send({
    from: 'SwapCar.sk <noreply@swapcar.sk>',
    to,
    subject,
    html,
  })

  if (error) return Response.json({ error }, { status: 400 })
  return Response.json({ data })
}