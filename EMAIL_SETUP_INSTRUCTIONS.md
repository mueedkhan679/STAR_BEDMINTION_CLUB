# Email Notification Setup - Complete Guide

## Current Status
The database trigger approach requires the PostgreSQL HTTP extension which isn't available on all Supabase plans. Here are two options:

---

## Option 1: Client-Side Email (RECOMMENDED - Works Immediately)

This approach sends emails directly from the browser when a payment is added, without requiring database triggers or the HTTP extension.

### Step 1: Get Resend API Key

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email
4. Go to **API Keys** → **Create API Key**
5. Name it "Star Badminton Club"
6. Copy the API key (starts with `re_...`)

### Step 2: Add API Key to Your App

1. Open `client/.env` file
2. Add this line:
   ```
   VITE_RESEND_API_KEY=re_your_actual_api_key_here
   ```
3. Save the file

### Step 3: Restart Your App

```bash
cd D:\STAR-project\client
npm run dev
```

### Step 4: Test It

1. Add a player with an email address
2. Add a payment for that player
3. Check their email inbox

**That's it!** Emails will now be sent automatically when payments are added.

---

## Option 2: Disable Email Notifications

If you don't want email notifications right now:

1. Open Supabase SQL Editor
2. Run `DISABLE_EMAIL_TRIGGER.sql`
3. Payments will work without emails

---

## How Client-Side Email Works

```
User adds payment → Supabase inserts payment → App detects success → Sends email via Resend
```

### Advantages:
- ✅ No database trigger needed
- ✅ No HTTP extension required
- ✅ Works on all Supabase plans
- ✅ Easy to debug
- ✅ Free tier: 100 emails/day

### Disadvantages:
- ⚠️ Requires API key in frontend (use environment variable)
- ⚠️ Only sends if user is online
- ⚠️ Can be blocked by ad blockers (rare)

---

## Email Template

The email includes:
- 🎨 Modern purple gradient design
- 🏆 Trophy icon
- 📋 Player details (name, father name)
- 💰 Payment amount highlighted
- 📅 Date and time
- # Installment number
- 🙏 Thank you message
- 👨‍💻 Software credit

---

## Security Note

The Resend API key is stored in an environment variable (`VITE_RESEND_API_KEY`), which is safe for client-side use. Resend allows this for their public API.

---

## Troubleshooting

### Emails not sending?
1. Check browser console (F12) for errors
2. Verify API key is correct in `.env`
3. Make sure player has email address
4. Check Resend dashboard for delivery logs

### Emails going to spam?
1. Add your domain in Resend (paid feature)
2. Use a professional email address
3. Ask players to whitelist your email

### Rate limit exceeded?
- Free tier: 100 emails/day
- Upgrade to paid plan for more

---

## Cost

**Resend Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for small clubs

**Paid Plans:**
- Starts at $20/month for 50,000 emails

---

## Next Steps

1. ✅ Sign up for Resend
2. ✅ Get API key
3. ✅ Add to `client/.env`
4. ✅ Restart app
5. ✅ Test with a payment

The email system will be fully functional!