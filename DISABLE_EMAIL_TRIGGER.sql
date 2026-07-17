-- Disable Email Trigger (Temporary Solution)
-- Run this if you're getting "schema net does not exist" error
-- This will allow payments to work without email notifications

-- Drop the email trigger and function
DROP TRIGGER IF EXISTS send_payment_email_trigger ON payments;
DROP FUNCTION IF EXISTS notify_payment_created();

-- Verify trigger is removed
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'payments';

-- You should see no triggers for the payments table
-- Payments will now work without sending emails