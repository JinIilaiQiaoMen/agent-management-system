import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword } from '@/lib/auth/password';

/**
 * 创建默认管理员账户
 * 邮箱：admin@example.com
 * 密码：admin123
 */
export async function createDefaultAdmin() {
  const supabase = getSupabaseClient();

  const email = 'admin@example.com';
  const password = 'admin123';
  const name = '管理员';

  // 检查是否已存在
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    console.log('管理员账户已存在');
    return;
  }

  // 哈希密码
  const passwordHash = await hashPassword(password);

  // 创建管理员
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      name,
      role: 'admin',
      is_active: true
    })
    .select('id, email, name, role')
    .single();

  if (error) {
    console.error('创建管理员失败:', error);
    return;
  }

  console.log('✅ 默认管理员账户创建成功！');
  console.log('邮箱：admin@example.com');
  console.log('密码：admin123');
  console.log('请在生产环境中修改默认密码！');
}

// 如果直接运行此脚本
if (require.main === module) {
  createDefaultAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
