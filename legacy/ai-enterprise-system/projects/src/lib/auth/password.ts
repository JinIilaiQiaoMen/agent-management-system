import bcrypt from 'bcryptjs';

/**
 * 密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * 生成随机 token（用于会话管理）
 */
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * 验证 email 格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证密码强度
 */
export function isStrongPassword(password: string): boolean {
  // 至少 6 个字符
  if (password.length < 6) return false;
  return true;
}
