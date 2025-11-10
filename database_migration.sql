-- ============================================================
-- SIMTA Database Migration
-- Date: 2025-11-10
-- Description: Migration untuk 3 fitur prioritas tinggi:
--   1. File Storage (tambah kolom file_path)
--   2. Notifications System (create table)
-- ============================================================

-- ============================================================
-- 1. UPDATE PROPOSALS TABLE
-- ============================================================
-- Tambah kolom file_path untuk menyimpan path file di Supabase Storage
-- Kolom ini diperlukan untuk delete file ketika proposal dihapus

ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Update existing rows (optional - jika sudah ada data)
-- Uncomment jika perlu update data lama
-- UPDATE proposals
-- SET file_path = 'uploads/' || file_name
-- WHERE file_path IS NULL AND file_url IS NOT NULL;

-- ============================================================
-- 2. CREATE NOTIFICATIONS TABLE
-- ============================================================
-- Table untuk menyimpan notifikasi in-app

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'proposal_reviewed', 'ta_status_changed', etc
  data JSONB, -- Additional data (proposal_id, ta_id, etc) in JSON format
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 3. CREATE INDEXES
-- ============================================================
-- Indexes untuk performa query notifications

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read)
  WHERE is_read = FALSE;

-- ============================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Enable RLS untuk notifications table (security)

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. CREATE RLS POLICIES
-- ============================================================
-- Policies untuk notifications table
-- CATATAN: Karena kita pakai custom JWT auth (bukan Supabase Auth),
-- kita skip RLS policies. Authorization dihandle di backend.
-- Jika ingin pakai Supabase Auth di masa depan, uncomment policies di bawah:

/*
-- Policy: Users can read own notifications
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Policy: Backend can insert notifications
CREATE POLICY "Backend can insert notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());
*/

-- ============================================================
-- 6. VERIFICATION QUERIES
-- ============================================================
-- Run these queries to verify the migration

-- Check if file_path column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'proposals' AND column_name = 'file_path';

-- Check if notifications table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'notifications';

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename = 'notifications';

-- ============================================================
-- ROLLBACK (jika diperlukan)
-- ============================================================
-- Uncomment dan run jika ingin rollback migration

/*
-- Drop notifications table
DROP TABLE IF EXISTS notifications CASCADE;

-- Remove file_path column from proposals
ALTER TABLE proposals DROP COLUMN IF EXISTS file_path;
*/

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Setelah run migration ini, lakukan:
-- 1. Setup Supabase Storage bucket 'proposals' (lihat SETUP_FITUR_BARU.md)
-- 2. Update environment variables (SUPABASE_KEY dengan service_role key)
-- 3. Deploy backend ke Vercel (atau restart local server)
-- 4. Rebuild mobile app: npx expo start --clear
-- ============================================================
