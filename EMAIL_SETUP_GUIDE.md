# Email Notification System Setup Guide

## Overview
This guide will help you set up automatic email notifications for payment confirmations using Supabase Edge Functions and Resend.

## Prerequisites
- Supabase project (already set up)
- Resend account (free tier available)
- Players with email addresses in the database

---

## Step 1: Set Up Resend

### 1.1 Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 1.2 Get API Key
1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it "Star Badminton Club"
4. Copy the API key (starts with `re_...`)

### 1.3 Add Domain (Optional but Recommended)
For production, add and verify your custom domain:
1. Go to **Domains** in Resend
2. Click **Add Domain**
3. Follow DNS verification steps
4. Update the `from` email in the Edge Function to use your domain

**For testing**, you can use Resend's default domain:
```
from: 'Star Badminton Club <onboarding@resend.dev>'
```

---

## Step 2: Deploy Supabase Edge Function

### 2.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 2.2 Login to Supabase
```bash
supabase login
```

### 2.3 Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

Find your project ID in Supabase dashboard: **Settings** → **General** → **Reference ID**

### 2.4 Set Environment Variables
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### 2.5 Deploy the Function
```bash
supabase functions deploy send-payment-email --no-verify-jwt
```

The `--no-verify-jwt` flag allows the function to be called without authentication (since it's triggered by the app).

### 2.6 Verify Deployment
```bash
supabase functions list
```

You should see `send-payment-email` in the list.

---

## Step 3: Update Database Trigger

### 3.1 Create Database Trigger
Run this SQL in Supabase SQL Editor:

```sql
-- Create a function to call the Edge Function
CREATE OR REPLACE FUNCTION notify_payment_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Supabase Edge Function
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-payment-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_ANON_KEY'
      ),
      body := jsonb_build_object(
        'payment', jsonb_build_object(
          'installment_number', NEW.installment_number,
          'amount', NEW.amount,
          'date', NEW.date,
          'time', NEW.time
        ),
        'player', jsonb_build_object(
          'name', (SELECT name FROM players WHERE id = NEW.player_id),
          'father_name', (SELECT father_name FROM players WHERE id = NEW.player_id),
          'email', (SELECT email FROM players WHERE id = NEW.player_id)
        )
      )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on payments table
DROP TRIGGER IF EXISTS send_payment_email_trigger ON payments;
CREATE TRIGGER send_payment_email_trigger
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_created();
```

**Important:** Replace:
- `YOUR_PROJECT_ID` with your actual Supabase project ID
- `YOUR_ANON_KEY` with your Supabase anon/public key (found in Settings → API)

### 3.2 Enable HTTP Extension (if not already enabled)
```sql
CREATE EXTENSION IF NOT EXISTS http;
```

---

## Step 4: Test the System

### 4.1 Add a Player with Email
1. Go to **Players** page
2. Add a new player with an email address
3. Or edit an existing player to add their email

### 4.2 Add a Payment
1. Go to **Payments** page
2. Add a payment for the player
3. Check the player's email inbox

### 4.3 Verify Email Received
The email should contain:
- ✅ Player name and father's name
- ✅ Installment number
- ✅ Payment amount, date, and time
- ✅ Professional HTML design
- ✅ "Thank You" message

---

## Step 5: Monitor Email Logs

### 5.1 Check Supabase Logs
```bash
supabase functions logs send-payment-email
```

### 5.2 Check Resend Logs
1. Go to Resend dashboard
2. Click **Emails** to see sent emails
3. Check delivery status and any errors

---

## Troubleshooting

### Issue: Emails not sending
**Solution:**
1. Check Supabase function logs for errors
2. Verify RESEND_API_KEY is set correctly
3. Ensure player has email address in database
4. Check Resend dashboard for delivery issues

### Issue: "Player email is null"
**Solution:**
- Add email address to player profile
- Email field is optional, so only players with emails will receive notifications

### Issue: Function timeout
**Solution:**
- Increase timeout in Supabase function settings
- Default is 10 seconds, can be increased to 60 seconds

### Issue: Emails going to spam
**Solution:**
- Set up custom domain in Resend
- Add SPF and DKIM records
- Use a professional "from" address

---

## Email Template Features

The email template includes:
- 🎨 Modern gradient design
- 📱 Fully responsive
- 🏆 Trophy icon and club branding
- 💜 Purple gradient theme
- 📋 Clean payment details layout
- 💰 Highlighted payment amount
- 🙏 Thank you message
- 👨‍💻 Software credit

---

## Cost

**Resend Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for small to medium clubs

**Paid Plans:**
- Starts at $20/month for 50,000 emails
- No monthly commitment needed

---

## Security Notes

1. **API Keys**: Never expose RESEND_API_KEY in client-side code
2. **Database Trigger**: Runs server-side, secure
3. **Edge Function**: Protected by Supabase infrastructure
4. **Email Validation**: Only sends to verified player emails

---

## Support

For issues with:
- **Resend**: https://resend.com/docs
- **Supabase**: https://supabase.com/docs
- **This Application**: Contact Abdul Mueed Khan

---

## Next Steps

1. ✅ Set up Resend account
2. ✅ Deploy Edge Function
3. ✅ Configure database trigger
4. ✅ Test with a payment
5. ✅ Monitor email delivery
6. ✅ Customize email template (optional)

The system is now ready to send automatic payment confirmation emails!