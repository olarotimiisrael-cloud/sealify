-- ============================================================
-- get_user_role() FUNCTION USAGE AUDIT
-- ============================================================
-- DO NOT MODIFY until all callers are identified and migration plan exists

-- Function Definition (SECURITY DEFINER)
-- CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
-- RETURNS text
-- LANGUAGE sql
-- SECURITY DEFINER
-- AS $$
--   SELECT role FROM public.profiles WHERE id = user_id;
-- $$;

-- ============================================================
-- CODEBASE USAGE SEARCH RESULTS
-- ============================================================

-- 1. Admin Dashboard - User Management
-- File: src/admin/pages/AdminDashboard.tsx
-- Usage: Checks if current user is admin for UI rendering
-- Caller: useSealify() context → isAdmin state
-- Safe to restrict: YES - only checks current user's role

-- 2. Admin Settings Modal - Root Credentials
-- File: src/components/AdminSettingsModal.tsx  
-- Usage: Displays current admin email for credential updates
-- Caller: AdminSettingsModal component
-- Safe to restrict: YES - only reads current admin user

-- 3. Admin Login Page
-- File: src/pages/AdminLogin.tsx
-- Usage: Verifies admin credentials against environment variables
-- Caller: adminLogin() function
-- Safe to restrict: NO - validates against env vars, not DB function

-- 4. API Routes - Admin Authorization
-- File: src/api/admin.ts (middleware)
-- Usage: requireAdmin() checks profiles table directly via SQL
-- Caller: adminRoutes.use("/*", requireAdmin)
-- Safe to restrict: N/A - uses direct SQL query, not function

-- 5. Navbar - Admin Badge
-- File: src/components/Navbar.tsx
-- Usage: Shows "Admin" badge based on isAdmin context
-- Caller: useSealify() → isAdmin
-- Safe to restrict: YES - derived from user profile

-- 6. Seller Profile Page
-- File: src/pages/SellerProfile.tsx
-- Usage: Checks if user is admin for edit permissions
-- Caller: useSealify() → isAdmin
-- Safe to restrict: YES - current user only

-- 7. Various Admin Modals
-- Files: AdminEditUserModal, AdminSettingsModal, etc.
-- Usage: Check isAdmin for UI visibility
-- Caller: useSealify() → isAdmin
-- Safe to restrict: YES - current user only

-- ============================================================
-- DIRECT SQL QUERIES (Bypass Function)
-- ============================================================

-- Most admin authorization uses direct SQL:
-- sql`SELECT role FROM profiles WHERE id = ${user.id}`

-- NOT the get_user_role() function.

-- ============================================================
-- RECOMMENDATION
-- ============================================================

-- 1. The get_user_role() function appears to be UNUSED in the codebase
-- 2. All admin checks use: direct SQL query OR isAdmin context state
-- 3. isAdmin is set during login: setIsAdmin(user.role === 'admin')

-- ACTION: 
-- - Function can be SAFELY DROPPED or RESTRICTED
-- - No code migration needed
-- - If keeping for external API: Restrict to (select auth.uid())

-- SAFE RESTRICTION:
-- ALTER FUNCTION public.get_user_role(uuid) SECURITY DEFINER SET search_path = public;
-- CREATE POLICY "Restrict get_user_role" ON public.profiles 
-- FOR SELECT USING (id = (select auth.uid()));