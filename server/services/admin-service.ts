import { getSql } from '../db/postgres.js';

export async function isAdmin(userId: string): Promise<boolean> {
  const sql = getSql();
  const result = await sql`
    SELECT private.is_admin(${userId}) AS is_admin
  `;
  return Boolean(result[0]?.is_admin);
}

export async function logIntrusionAttempt(
  email: string,
  reason: string,
  ip: string | undefined,
  userAgent: string | undefined
): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO intrusion_logs (attempted_email, reason, ip_address, user_agent, status, created_at)
      VALUES (${email}, ${reason}, ${ip || null}, ${userAgent || null}, 'flagged', NOW())
    `;
  } catch {
    // Do not throw - intrusion logging should not block the response
  }
}

export async function clearIntrusionLogs(email: string): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      UPDATE intrusion_logs
      SET status = 'dismissed'
      WHERE attempted_email = ${email}
        AND status = 'flagged'
        AND created_at >= NOW() - INTERVAL '15 minutes'
    `;
  } catch {
    // Do not throw - clearing logs should not block the response
  }
}

export async function auditLog(
  userId: string,
  action: string,
  description: string,
  type: string
): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO audit_logs (user_id, action, description, type, created_at)
      VALUES (${userId}, ${action}, ${description}, ${type}, NOW())
    `;
  } catch {
    // Do not throw - audit logging should not block the response
  }
}
