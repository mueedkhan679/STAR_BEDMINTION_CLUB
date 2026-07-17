# Deploy Supabase Edge Function - Windows Guide

## Problem
```
Error: Entrypoint path does not exist - /supabase/functions/send-payment-email/index.ts
```

## Root Cause
The Supabase CLI is looking for the `supabase` folder in the wrong directory. Your project structure is:
```
D:\STAR-project\
├── supabase\                    ← Functions folder is here
│   └── functions\
│       └── send-payment-email\
│           └── index.ts
├── client\                      ← But you're running command from here
│   └── ...
└── supabase-go.exe
```

## Solution

### Option 1: Run from Correct Directory (Recommended)

1. **Open Command Prompt or PowerShell**

2. **Navigate to the project root** (where `supabase-go.exe` is located):
   ```cmd
   cd D:\STAR-project
   ```

3. **Verify the supabase folder exists**:
   ```cmd
   dir supabase\functions\send-payment-email
   ```
   
   You should see `index.ts` listed.

4. **Link your Supabase project** (if not already linked):
   ```cmd
   supabase link --project-ref YOUR_PROJECT_ID
   ```

5. **Set the Resend API Key**:
   ```cmd
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   ```

6. **Deploy the function**:
   ```cmd
   supabase functions deploy send-payment-email --no-verify-jwt
   ```

### Option 2: Use Full Path Specification

If you need to specify the path explicitly:

```cmd
cd D:\STAR-project
supabase functions deploy send-payment-email --no-verify-jwt --file supabase/functions/send-payment-email/index.ts
```

### Option 3: Create a Deploy Script

Create a file named `deploy-email-function.bat` in `D:\STAR-project\`:

```batch
@echo off
echo Deploying send-payment-email function...

REM Navigate to project root
cd /d D:\STAR-project

REM Set your project ID here
set PROJECT_ID=your_project_id_here

REM Link project (only needed once)
call supabase link --project-ref %PROJECT_ID%

REM Set API key (only needed once)
call supabase secrets set RESEND_API_KEY=re_your_key_here

REM Deploy function
call supabase functions deploy send-payment-email --no-verify-jwt

echo.
echo Deployment complete!
pause
```

Then run it:
```cmd
deploy-email-function.bat
```

### Option 4: Verify Folder Structure

Make sure your folder structure looks like this:

```
D:\STAR-project\
│   supabase-go.exe
│   package.json
│   README.md
│   ...
│
├───supabase\
│   ├── config.toml
│   └── functions\
│       └── send-payment-email\
│           └── index.ts
│
├───client\
│   ├── src\
│   ├── package.json
│   └── ...
│
└───server\
    └── ...
```

### Option 5: Create config.toml (if missing)

Create `D:\STAR-project\supabase\config.toml`:

```toml
project_id = "YOUR_PROJECT_ID"
functions = ["send-payment-email"]
```

## Step-by-Step Deployment

### 1. Open PowerShell as Administrator

### 2. Navigate to project root:
```powershell
cd D:\STAR-project
```

### 3. Verify Supabase CLI is installed:
```powershell
supabase --version
```

If not installed:
```powershell
npm install -g supabase
```

### 4. Login to Supabase:
```powershell
supabase login
```

### 5. Link your project:
```powershell
supabase link --project-ref YOUR_PROJECT_ID
```

Find your project ID in Supabase Dashboard:
- Go to https://app.supabase.com
- Select your project
- Go to Settings → General
- Copy the "Reference ID"

### 6. Set environment variable:
```powershell
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
```

Get your Resend API key from:
- https://resend.com
- API Keys section

### 7. Deploy the function:
```powershell
supabase functions deploy send-payment-email --no-verify-jwt
```

### 8. Verify deployment:
```powershell
supabase functions list
```

You should see `send-payment-email` in the list.

## Common Issues and Solutions

### Issue 1: "Entrypoint path does not exist"
**Solution:** Make sure you're running the command from `D:\STAR-project`, not from `D:\STAR-project\client`

### Issue 2: "Project not linked"
**Solution:** Run `supabase link --project-ref YOUR_PROJECT_ID` first

### Issue 3: "RESEND_API_KEY not set"
**Solution:** Run `supabase secrets set RESEND_API_KEY=re_your_key_here`

### Issue 4: "Permission denied"
**Solution:** Run PowerShell as Administrator

### Issue 5: "Command not found: supabase"
**Solution:** Install Supabase CLI:
```powershell
npm install -g supabase
```

## Quick Test

After deployment, test the function:

```powershell
supabase functions invoke send-payment-email --no-verify-jwt
```

## Monitor Function Logs

To see logs and debug issues:

```powershell
supabase functions logs send-payment-email
```

## Alternative: Deploy via Supabase Dashboard

If CLI continues to have issues, you can deploy via the dashboard:

1. Go to https://app.supabase.com
2. Select your project
3. Go to Edge Functions
4. Click "Create a new function"
5. Name: `send-payment-email`
6. Copy the code from `supabase/functions/send-payment-email/index.ts`
7. Paste into the editor
8. Set environment variable: `RESEND_API_KEY`
9. Click "Deploy"

## Verify the Function Works

1. Add a player with an email address in your app
2. Add a payment for that player
3. Check the player's email inbox
4. Check Supabase logs: `supabase functions logs send-payment-email`

## Summary

The key is to run the deployment command from `D:\STAR-project` (where the `supabase` folder is located), not from the `client` folder.

```powershell
# Correct:
cd D:\STAR-project
supabase functions deploy send-payment-email --no-verify-jwt

# Wrong:
cd D:\STAR-project\client
supabase functions deploy send-payment-email --no-verify-jwt
```

The function should deploy successfully once you're in the correct directory!