-- Update Installment Tracking to Use Name + Father Name
-- Run this in Supabase SQL Editor

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS set_installment_number_trigger ON payments;
DROP FUNCTION IF EXISTS set_installment_number();

-- Create new function that uses player name + father name
CREATE OR REPLACE FUNCTION set_installment_number()
RETURNS TRIGGER AS $$
DECLARE
  player_name_val TEXT;
  father_name_val TEXT;
  installment_count INTEGER;
BEGIN
  -- Get player name and father name from the players table
  SELECT p.name, p.father_name INTO player_name_val, father_name_val
  FROM players p
  WHERE p.id = NEW.player_id;

  -- Count existing payments for this specific player (by name + father name)
  SELECT COUNT(*) + 1 INTO installment_count
  FROM payments p
  JOIN players pl ON p.player_id = pl.id
  WHERE pl.name = player_name_val 
    AND pl.father_name = father_name_val;

  -- Set the installment number
  NEW.installment_number := installment_count;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set installment number
CREATE TRIGGER set_installment_number_trigger
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_installment_number();

-- Update existing records to use name + father name matching
UPDATE payments 
SET installment_number = sub.rn
FROM (
  SELECT 
    pay.id,
    ROW_NUMBER() OVER (
      PARTITION BY pl.name, pl.father_name 
      ORDER BY pay.date
    ) as rn
  FROM payments pay
  JOIN players pl ON pay.player_id = pl.id
) sub
WHERE payments.id = sub.id;

-- Verify the update
SELECT 
  pl.name,
  pl.father_name,
  pay.installment_number,
  pay.amount,
  pay.date
FROM payments pay
JOIN players pl ON pay.player_id = pl.id
ORDER BY pl.name, pl.father_name, pay.date;