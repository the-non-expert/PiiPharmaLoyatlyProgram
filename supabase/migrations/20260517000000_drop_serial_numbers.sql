-- Drop the legacy serial_numbers table.
-- Replaced entirely by qr_serials (QR registry) + coupon_submissions (scan records).
-- 0 rows in production; no application code references it.
drop table if exists serial_numbers;
