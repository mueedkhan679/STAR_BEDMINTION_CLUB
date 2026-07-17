import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

interface PaymentData {
  player_name: string
  father_name: string
  installment_number: number
  amount: number
  date: string
  time: string
  email: string
}

const generateEmailTemplate = (data: PaymentData): string => {
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation - Star Badminton Club</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            width: 100%;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .trophy-icon {
            font-size: 60px;
            margin-bottom: 20px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }
        
        .player-info {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 25px;
            border-left: 5px solid #667eea;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
            font-size: 14px;
        }
        
        .info-value {
            color: #333;
            font-size: 14px;
            font-weight: 600;
        }
        
        .amount-highlight {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            margin: 25px 0;
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .amount-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .amount-value {
            font-size: 36px;
            font-weight: bold;
        }
        
        .thank-you {
            text-align: center;
            padding: 20px;
            background: #fff3cd;
            border-radius: 15px;
            margin-top: 25px;
            border: 2px solid #ffc107;
        }
        
        .thank-you h2 {
            color: #856404;
            font-size: 20px;
            margin-bottom: 10px;
        }
        
        .thank-you p {
            color: #856404;
            font-size: 14px;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        .club-name {
            font-weight: bold;
            color: #667eea;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="trophy-icon">🏆</div>
            <h1>Star Badminton Club</h1>
            <p>Payment Confirmation Receipt</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Dear <strong>${data.player_name}</strong>,
            </div>
            
            <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
                Thank you for your payment! We have successfully received your installment payment.
                Here are your payment details:
            </p>
            
            <div class="player-info">
                <div class="info-row">
                    <span class="info-label">Player Name:</span>
                    <span class="info-value">${data.player_name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Father's Name:</span>
                    <span class="info-value">${data.father_name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Installment Number:</span>
                    <span class="info-value">#${data.installment_number}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Date:</span>
                    <span class="info-value">${formattedDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Time:</span>
                    <span class="info-value">${data.time}</span>
                </div>
            </div>
            
            <div class="amount-highlight">
                <div class="amount-label">Payment Amount</div>
                <div class="amount-value">Rs. ${data.amount.toFixed(2)}</div>
            </div>
            
            <div class="thank-you">
                <h2>🙏 Thank You!</h2>
                <p>We appreciate your prompt payment and continued support of Star Badminton Club.</p>
            </div>
        </div>
        
        <div class="footer">
            <p class="club-name">Star Badminton Club</p>
            <p>Management System</p>
            <p style="margin-top: 10px; font-size: 11px;">Software made by Abdul Mueed Khan</p>
        </div>
    </div>
</body>
</html>
  `
}

serve(async (req) => {
  try {
    const { payment, player } = await req.json()
    
    console.log('Received payment data:', { payment, player })

    // Check if player has email
    if (!player?.email) {
      console.log('No email provided for player, skipping email send')
      return new Response(
        JSON.stringify({ message: 'No email provided, skipping' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const emailData: PaymentData = {
      player_name: player.name,
      father_name: player.father_name,
      installment_number: payment.installment_number || 1,
      amount: payment.amount,
      date: payment.date,
      time: payment.time,
      email: player.email
    }

    const emailHtml = generateEmailTemplate(emailData)

    console.log('Sending email to:', emailData.email)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Star Badminton Club <onboarding@resend.dev>', // Replace with your verified domain
      to: [emailData.email],
      subject: `Payment Confirmation - Installment #${emailData.installment_number} - Star Badminton Club`,
      html: emailHtml
    })

    if (error) {
      console.error('Error sending email:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('Email sent successfully:', data)
    return new Response(
      JSON.stringify({ message: 'Email sent successfully', data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-payment-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})