# 🔐 SUPABASE LEAKED PASSWORD PROTECTION - PRODUCTION REQUIREMENT

## Current Status: DISABLED ❌

Supabase's "Leaked Password Protection" feature is currently **disabled** in the project settings.

## What It Does

When enabled, Supabase checks user passwords against the **Have I Been Pwned** database (10+ billion compromised credentials) during:
- User registration
- Password reset
- Password change

If a password appears in known breaches, the action is **blocked** with a clear error message.

## Why It's Critical for Production

1. **Credential Stuffing Prevention** - Attackers use leaked password lists to automate login attempts
2. **User Protection** - Prevents users from unknowingly using compromised passwords
3. **Compliance** - Aligns with NIST 800-63B guidelines (memorized secrets verification)
4. **Reputation** - Reduces account takeover incidents and support burden

## How to Enable

### Via Supabase Dashboard:
1. Go to **Authentication** → **Settings**
2. Scroll to **Password Security** section
3. Enable **"Leaked Password Protection"**
4. Save changes

### Via Supabase CLI:
```bash
supabase auth update --leaked-password-protection-enabled=true
```

## Configuration Options

| Setting | Recommended Value |
|---------|-------------------|
| Leaked Password Protection | **ENABLED** |
| Minimum Password Length | 8 characters (already enforced) |
| Require Uppercase/Lowercase/Number/Symbol | Optional (balance UX vs security) |
| Prevent Common Passwords | ENABLED (built-in) |

## Impact on Users

| Scenario | Behavior |
|----------|----------|
| New user signs up with "Password123" | ❌ Blocked - "This password has appeared in data breaches" |
| Existing user changes to "qwerty123" | ❌ Blocked - same reason |
| User uses unique passphrase | ✅ Allowed |
| Admin creates user via API | ✅ Allowed (bypass with service role) |

## Testing After Enable

```bash
# Test registration with known breached password
curl -X POST https://your-project.supabase.co/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Expected: 400 Bad Request with leaked password error
```

## Compliance Notes

- **NIST 800-63B Section 5.1.1.2**: "Verifiers SHALL compare prospective secrets against a list of known compromised values"
- **OWASP ASVS 2.1.1**: "Verify passwords are checked against a list of breached passwords"
- **GDPR Article 32**: "Appropriate technical measures" for credential security

## Status Tracking

| Item | Status | Target Date |
|------|--------|-------------|
| Enable Leaked Password Protection | 🔴 PENDING | Before production launch |
| Test with known breached passwords | 🔴 PENDING | After enable |
| Document in security audit | 🔴 PENDING | Post-launch |
| Add to CI/CD security checks | 🔴 PENDING | Post-launch |

## Related Security Features to Enable

1. **MFA/2FA** - Already enforced for admin (triple-factor)
2. **Rate Limiting** - Cloudflare WAF rules configured
3. **CSP Headers** - Configured in `_headers`
4. **Secure Cookies** - Supabase handles automatically
5. **Password Hashing** - Supabase uses bcrypt (cost 10)