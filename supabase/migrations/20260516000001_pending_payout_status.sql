-- Add pending_payout to claim_status enum.
-- Claims auto-created from HMAC-verified QR scans skip the manual review
-- step and land directly in pending_payout (ready for CSV export).
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'pending_payout';
