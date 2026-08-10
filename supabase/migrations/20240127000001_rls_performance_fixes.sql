-- ============================================================
-- SEALIFY RLS PERFORMANCE OPTIMIZATION MIGRATION
-- Phase 1-4: Safe, backward-compatible performance improvements
-- ============================================================

-- ============================================================
-- PHASE 1: CONSOLIDATE PERMISSIVE POLICIES
-- ============================================================

-- profiles table
DROP POLICY IF EXISTS "Public profiles readable" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins full access" ON profiles;

CREATE POLICY "Profiles read access" ON profiles 
FOR SELECT USING (true);

CREATE POLICY "Profiles write access" ON profiles 
FOR ALL USING (
  (select auth.uid()) = id OR public.is_admin()
) WITH CHECK (
  (select auth.uid()) = id OR public.is_admin()
);

-- ads table
DROP POLICY IF EXISTS "Public ads readable" ON ads;
DROP POLICY IF EXISTS "Sellers manage own ads" ON ads;
DROP POLICY IF EXISTS "Admins manage all ads" ON ads;

CREATE POLICY "Ads read access" ON ads
FOR SELECT USING (
  status = 'active' 
  OR (select auth.uid()) = seller_id 
  OR public.is_admin()
);

CREATE POLICY "Ads write access" ON ads
FOR ALL USING (
  (select auth.uid()) = seller_id 
  OR public.is_admin()
) WITH CHECK (
  (select auth.uid()) = seller_id 
  OR public.is_admin()
);

-- messages table
DROP POLICY IF EXISTS "Participants read messages" ON messages;
DROP POLICY IF EXISTS "Participants send messages" ON messages;
DROP POLICY IF EXISTS "Admins read all messages" ON messages;

CREATE POLICY "Messages read access" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = (select auth.uid()) 
         OR c.participant_2 = (select auth.uid()))
  )
);

CREATE POLICY "Messages write access" ON messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = (select auth.uid()) 
         OR c.participant_2 = (select auth.uid()))
  )
);

-- conversations table
DROP POLICY IF EXISTS "Participants view conversations" ON conversations;
DROP POLICY IF EXISTS "Participants create conversations" ON conversations;

CREATE POLICY "Conversations read access" ON conversations
FOR SELECT USING (
  participant_1 = (select auth.uid()) 
  OR participant_2 = (select auth.uid())
);

CREATE POLICY "Conversations write access" ON conversations
FOR INSERT WITH CHECK (
  participant_1 = (select auth.uid()) 
  OR participant_2 = (select auth.uid())
);

-- notifications table
DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
DROP POLICY IF EXISTS "System creates notifications" ON notifications;
DROP POLICY IF EXISTS "Admins manage all notifications" ON notifications;

CREATE POLICY "Notifications access" ON notifications
FOR ALL USING (
  user_id = (select auth.uid()) 
  OR public.is_admin()
) WITH CHECK (
  user_id = (select auth.uid()) 
  OR public.is_admin()
);

-- favorites table
DROP POLICY IF EXISTS "Users manage own favorites" ON favorites;

CREATE POLICY "Favorites access" ON favorites
FOR ALL USING (
  user_id = (select auth.uid())
) WITH CHECK (
  user_id = (select auth.uid())
);

-- wallets table
DROP POLICY IF EXISTS "Users view own wallet" ON wallets;
DROP POLICY IF EXISTS "Admins manage all wallets" ON wallets;

CREATE POLICY "Wallet access" ON wallets
FOR ALL USING (
  user_id = (select auth.uid()) 
  OR public.is_admin()
) WITH CHECK (
  user_id = (select auth.uid()) 
  OR public.is_admin()
);

-- transactions table
DROP POLICY IF EXISTS "Users view own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins manage all transactions" ON transactions;

CREATE POLICY "Transactions access" ON transactions
FOR ALL USING (
  wallet_id IN (SELECT id FROM wallets WHERE user_id = (select auth.uid()))
  OR public.is_admin()
) WITH CHECK (
  wallet_id IN (SELECT id FROM wallets WHERE user_id = (select auth.uid()))
  OR public.is_admin()
);

-- verification_requests table
DROP POLICY IF EXISTS "Users view own verification" ON verification_requests;
DROP POLICY IF EXISTS "Admins manage all verifications" ON verification_requests;

CREATE POLICY "Verification access" ON verification_requests
FOR ALL USING (
  user_id = (select auth.uid()) 
  OR public.is_admin()
) WITH CHECK (
  user_id = (select auth.uid()) 
  OR public.is_admin()
);

-- reports table
DROP POLICY IF EXISTS "Users create reports" ON reports;
DROP POLICY IF EXISTS "Admins manage all reports" ON reports;

CREATE POLICY "Reports access" ON reports
FOR ALL USING (
  reporter_id = (select auth.uid()) 
  OR public.is_admin()
) WITH CHECK (
  reporter_id = (select auth.uid()) 
  OR public.is_admin()
);

-- disputes table
DROP POLICY IF EXISTS "Users create disputes" ON disputes;
DROP POLICY IF EXISTS "Admins manage all disputes" ON disputes;

CREATE POLICY "Disputes access" ON disputes
FOR ALL USING (
  user_id = (select auth.uid()) 
  OR public.is_admin()
) WITH CHECK (
  user_id = (select auth.uid()) 
  OR public.is_admin()
);

-- reviews table
DROP POLICY IF EXISTS "Users create reviews" ON reviews;
DROP POLICY IF EXISTS "Admins manage all reviews" ON reviews;

CREATE POLICY "Reviews access" ON reviews
FOR ALL USING (
  buyer_id = (select auth.uid()) 
  OR seller_id = (select auth.uid()) 
  OR public.is_admin()
) WITH CHECK (
  buyer_id = (select auth.uid()) 
  OR public.is_admin()
);

-- buyer_requests table
DROP POLICY IF EXISTS "Users manage own buyer requests" ON buyer_requests;

CREATE POLICY "Buyer requests access" ON buyer_requests
FOR ALL USING (
  user_id = (select auth.uid())
) WITH CHECK (
  user_id = (select auth.uid())
);

-- search_alerts table
DROP POLICY IF EXISTS "Users manage own search alerts" ON search_alerts;

CREATE POLICY "Search alerts access" ON search_alerts
FOR ALL USING (
  user_id = (select auth.uid())
) WITH CHECK (
  user_id = (select auth.uid())
);

-- audit_logs table
DROP POLICY IF EXISTS "Admins view audit logs" ON audit_logs;

CREATE POLICY "Audit logs access" ON audit_logs
FOR SELECT USING (
  public.is_admin()
);

-- intrusion_logs table
DROP POLICY IF EXISTS "Admins view intrusion logs" ON intrusion_logs;

CREATE POLICY "Intrusion logs access" ON intrusion_logs
FOR SELECT USING (
  public.is_admin()
);

-- ============================================================
-- PHASE 2: ADD MISSING FOREIGN KEY INDEXES
-- ============================================================

-- Critical indexes for query performance
CREATE INDEX IF NOT EXISTS idx_ads_seller_id ON ads(seller_id);
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_status_created ON ads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_featured_created ON ads(featured, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_ad_id ON conversations(ad_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorites_user_ad ON favorites(user_id, ad_id);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_created ON transactions(wallet_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_escrow_ad ON escrow_transactions(ad_id);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer ON escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller ON escrow_transactions(seller_id);

CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_reports_ad ON reports(ad_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);

CREATE INDEX IF NOT EXISTS idx_disputes_user ON disputes(user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer ON reviews(buyer_id);

CREATE INDEX IF NOT EXISTS idx_buyer_requests_user ON buyer_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_search_alerts_user ON search_alerts(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type_created ON audit_logs(type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_intrusion_logs_email_created ON intrusion_logs(attempted_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_active_created ON announcements(active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_promotion_payments_user ON promotion_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_listing ON promotion_payments(listing_id);

CREATE INDEX IF NOT EXISTS idx_password_requests_user ON password_requests(user_id);

-- ============================================================
-- PHASE 3: REMOVE DUPLICATE INDEXES (Manual Review Required)
-- ============================================================

-- Run this query to identify duplicates before dropping:
-- SELECT schemaname, tablename, indexname, indexdef
-- FROM pg_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexdef;

-- Example duplicate removal (uncomment after verification):
-- DROP INDEX IF EXISTS public.ads_seller_id_idx; -- if duplicate of idx_ads_seller_id
-- DROP INDEX IF EXISTS public.conversations_participant_1_idx; -- if duplicate of idx_conversations_participants

-- ============================================================
-- PHASE 4: OPTIMIZE AUTH.UID() EVALUATION
-- ============================================================

-- The policies above already use (select auth.uid()) instead of auth.uid()
-- This is the optimized pattern for RLS performance

-- ============================================================
-- VALIDATION
-- ============================================================

-- Run after migration to verify:
-- SELECT tablename, count(*) as policy_count
-- FROM pg_policies WHERE schemaname = 'public'
-- GROUP BY tablename ORDER BY policy_count DESC;

-- SELECT tablename, indexname 
-- FROM pg_indexes WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- Check for sequential scans:
-- SELECT relname, seq_scan, idx_scan 
-- FROM pg_stat_user_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY seq_scan DESC;