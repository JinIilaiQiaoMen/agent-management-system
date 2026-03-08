# 📤 推送到 GitHub 快速指南

## 🚀 快速开始

### 1. 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com/new) 创建新仓库
2. 仓库名称：`agent-management-system`
3. 选择 Public 或 Private
4. **不要**初始化 README、.gitignore 或 LICENSE
5. 点击 "Create repository"

### 2. 连接并推送代码

```bash
# 替换 YOUR_USERNAME 为你的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/agent-management-system.git

# 推送代码到 GitHub
git push -u origin main
```

### 3. 验证

访问你的 GitHub 仓库：
```
https://github.com/YOUR_USERNAME/agent-management-system
```

## 🔐 使用个人访问令牌（推荐）

如果使用 HTTPS 认证，建议使用个人访问令牌：

### 创建个人访问令牌

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 选择权限：
   - `repo`（完整仓库访问权限）
   - `workflow`（GitHub Actions）
4. 复制生成的令牌

### 使用令牌推送

```bash
# 推送时使用令牌
git push https://YOUR_TOKEN@github.com/YOUR_USERNAME/agent-management-system.git main
```

## 🔄 推送后续更新

```bash
# 添加所有修改
git add .

# 提交修改
git commit -m "描述你的修改"

# 推送到 GitHub
git push origin main
```

## 📋 推送前检查清单

- [ ] 所有修改已提交（`git status` 显示干净）
- [ ] 敏感信息未包含（检查 `.env` 文件）
- [ ] `.gitignore` 已正确配置
- [ ] 提交信息清晰明确
- [ ] 测试已通过（如有需要）

## ❓ 常见问题

### 错误：remote: Permission denied

**原因**: 认证失败

**解决方案**:
```bash
# 使用个人访问令牌
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/agent-management-system.git
git push origin main
```

### 错误：failed to push some refs

**原因**: 远程有新的提交

**解决方案**:
```bash
# 拉取远程更新
git pull origin main --rebase

# 推送本地更改
git push origin main
```

### 错误：fatal: 'origin' does not appear to be a git repository

**原因**: 未配置远程仓库

**解决方案**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/agent-management-system.git
```

## 📚 相关文档

- [完整的部署指南](./DEPLOYMENT.md)
- [GitHub 官方文档](https://docs.github.com/)
- [Git 官方文档](https://git-scm.com/docs)
