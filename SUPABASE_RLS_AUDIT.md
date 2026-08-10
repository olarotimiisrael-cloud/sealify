# 📊 SUPABASE RLS PERFORMANCE AUDIT & REMEDIATION PLAN

## Findings from Supabase Advisor

### 1. Multiple Permissive Policies
**Tables affected:** `profiles`, `ads`, `messages`, `notifications`, `conversations`, `wallets`, `transactions`, `favorites`, `reviews`, `reports`, `disputes`, `verification_requests`, `password_requests`, `promotion_payments`, `buyer_requests`, `search_alerts`, `safe_spots`, `categories`, `subcategories`, `system_configs`, `site_settings`, `promotion_plans`, `recent_deals`, `audit_logs`, `announcements`, `intrusion_logs`

**Issue:** Multiple permissive policies on same table cause OR logic evaluation overhead.

### 2. Repeated `auth.uid()` Evaluation
**Issue:** Each policy independently evaluates `auth.uid()` instead of using `(select auth.uid())` for subquery optimization.

### 3. Duplicate Indexes
**Tables affected:** Various tables with overlapping index definitions.

### 4. Unindexed Foreign Keys
**Tables affected:** `ads` (seller_id, category_id), `conversations` (participant_1, participant_2, ad_id), `messages` (conversation_id, sender_id, receiver_id), `notifications` (user_id), `favorites` (user_id, ad_id), `wallets` (user_id), `transactions` (wallet_id), `escrow_transactions` (ad_id, buyer_id, seller_id), `verification_requests` (user_id), `reports` (ad_id, reporter_id), `disputes` (user_id), `reviews` (seller_id, buyer_id), `buyer_requests` (user_id), `search_alerts` (user_id), `audit_logs` (user_id), `intrusion_logs` (none), `recent_deals` (none), `announcements` (created_by), `promotion_payments` (user_id, listing_id), `password_requests` (user_id).

---

## Remediation Plan

### Phase 1: Consolidate Permissive Policies (SAFE - No Behavior Change)

For each table with multiple permissive policies that evaluate the SAME condition, combine into single policy.

**Example - profiles table:**
```sql
-- BEFORE: 4 separate policies
CREATE POLICY "Public profiles readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins full access" ON profiles FOR ALL USING (public.is_admin());

-- AFTER: 2 consolidated policies
CREATE POLICY "Profiles access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles mutation" ON profiles FOR ALL USING (
  auth.uid() = id OR public.is_admin()
) WITH CHECK (
  auth.uid() = id OR public.is_admin()
);
```

### Phase 2: Optimize auth.uid() Evaluation (SAFE - Performance Only)

Replace `auth.uid()` with `(select auth.uid())` in all RLS policies.

```sql
-- BEFORE
CREATE POLICY "Users own data" ON profiles FOR ALL USING (auth.uid() = id);

-- AFTER  
CREATE POLICY "Users own data" ON profiles FOR ALL USING ((select auth.uid()) = id);
```

### Phase 3: Remove Duplicate Indexes (SAFE - No Behavior Change)

Identify and drop truly duplicate indexes (same columns, same order).

```sql
-- Find duplicates
SELECT 
  schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexdef;

-- Drop duplicates (example)
DROP INDEX IF EXISTS public.ads_seller_id_idx; -- if duplicate of ads_seller_id_created_at_idx
```

### Phase 4: Add Missing Foreign Key Indexes (SAFE - Performance Only)

Add indexes for foreign keys used in JOINs and WHERE clauses.

```sql
-- Critical indexes for query performance
CREATE INDEX IF NOT EXISTS idx_ads_seller_id ON ads(seller_id);
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_status_created ON ads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_ad ON favorites(user_id, ad_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_ad ON escrow_transactions(ad_id);
CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_ad ON reports(ad_id);
CREATE INDEX IF NOT EXISTS idx_disputes_user ON disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_user ON buyer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_user ON search_alerts(user_id);
```

### Phase 5: Optimize Specific Policies

**ads table - reduce policy count:**
```sql
-- Consolidate: active ads readable, sellers manage own, admins full access
DROP POLICY IF EXISTS "Public ads readable" ON ads;
DROP POLICY IF EXISTS "Sellers manage own ads" ON ads;
DROP POLICY IF EXISTS "Admins manage all ads" ON ads;

CREATE POLICY "Ads access" ON ads FOR SELECT USING (
  status = 'active' OR auth.uid() = seller_id OR public.is_admin()
);
CREATE POLICY "Ads mutation" ON ads FOR ALL USING (
  auth.uid() = seller_id OR public.is_admin()
) WITH CHECK (
  auth.uid() = seller_id OR public.is_admin()
);
```

**messages/conversations - consolidate:**
```sql
-- Messages: participants can read/write their conversations
DROP POLICY IF EXISTS "Participants read messages" ON messages;
DROP POLICY IF EXISTS "Participants send messages" ON messages;

CREATE POLICY "Messages access" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_id 
    AND (c.participant_1 = (select auth.uid()) OR c.participant_2 = (select auth.uid()))
  )
);
CREATE POLICY "Messages insert" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_id 
    AND (c.participant_1 = (select auth.uid()) OR c.participant_2 = (select auth.uid()))
  )
);
```

---

## Execution Order

1. **Backup current policies** → `pg_dump --schema-only --table=*`
2. **Run Phase 1** (consolidate policies) - test in staging
3. **Run Phase 2** (auth.uid optimization) - test in staging  
4. **Run Phase 3** (remove duplicate indexes) - test in staging
4. **Run Phase 4** (add FK indexes) - test in staging
5. **Run Phase 5** (optimize specific tables) - test in staging
6. **Deploy to production** after staging validation

---

## Validation Queries

```sql
-- Verify policy count reduction
SELECT tablename, count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;

-- Verify indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check for sequential scans (should be minimal)
SELECT * FROM pg_stat_user_tables 
WHERE seq_scan > 1000 
ORDER BY seq_scan DESC;
```

---

## Risk Assessment

| Phase | Risk Level | Rollback Complexity |
|-------|------------|---------------------|
| Phase 1 | LOW | Medium (recreate policies) |
| Phase 2 | LOW | Low (revert to auth.uid()) |
| Phase 3 | LOW | Medium (recreate indexes) |
| Phase 4 | LOW | Low (drop indexes) |
| Phase 5 | MEDIUM | High (complex policy changes) |

**Recommendation:** Execute Phase 1-4 first (low risk, high impact), then Phase 5 after validation.