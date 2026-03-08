# 🚀 ZAEP 项目 - GitHub上传快速参考

---

## ⚡ 3步快速上传（GitHub CLI）⭐⭐⭐

### 1. 安装GitHub CLI
```bash
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux
# 见文档: https://cli.github.com/manual/installation
```

### 2. 登录并创建仓库
```bash
# 登录GitHub（浏览器会打开授权页面）
gh auth login

# 创建仓库并上传
gh repo create zaep-three-provinces --public --source=.
```

**就这么简单！** 剩下的工作CLI会自动完成。

---

## 📋 方案对比

| 方法 | 难度 | 时间 | 推荐 |
|------|------|------|--------|
| GitHub Desktop | ⭐ | 5-10分钟 | ⭐⭐⭐⭐ |
| GitHub CLI | ⭐⭐ | 3-5分钟 | ⭐⭐⭐⭐ |
| Git命令 | ⭐⭐⭐ | 5-10分钟 | ⭐⭐⭐ |
| 网页上传 | ⭐⭐⭐ | 30-60分钟 | ⭐⭐ |

---

## 🔧 常用Git命令

### 初始化仓库
```bash
git init
git add .
git commit -m "Initial commit"
```

### 添加远程仓库
```bash
git remote add origin https://github.com/YOUR_USERNAME/zaep-three-provinces.git
```

### 推送到GitHub
```bash
# 首次推送（设置上游）
git push -u origin main

# 后续推送
git push
```

### 查看状态
```bash
git status
git log --oneline
```

---

## 🔑 认证方式

### 方式1: Personal Access Token
1. GitHub → Settings → Developer settings → Personal access tokens
2. 点击 "Generate new token"
3. 选择权限：`repo` 或 `public_repo`
4. 生成并复制token（只显示一次！）
5. 使用：
```bash
git push https://YOUR_TOKEN@github.com/YOUR_USERNAME/zaep-three-provinces.git main
```

### 方式2: SSH密钥
1. 生成SSH密钥：
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
2. 添加公钥到GitHub：https://github.com/settings/keys
3. 使用：
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/zaep-three-provinces.git
```

---

## 📦 如果文件太大

### 方案1: 使用Git LFS
```bash
# 安装Git LFS
git lfs install

# 追踪大文件
git lfs track "*.tar.gz"
git lfs track "*.zip"
git add .gitattributes
git commit -m "chore: add git lfs"
```

### 方案2: 使用GitHub Releases
1. 先推送代码（不含大文件）
2. 在GitHub上点击 "Releases"
3. 点击 "Create a new release"
4. 上传大文件作为附件

---

## 🆘 如果遇到问题

### "repository not found"
```bash
# 检查远程URL
git remote -v

# 修改为正确的URL
git remote set-url origin https://github.com/YOUR_USERNAME/zaep-three-provinces.git
```

### "Authentication failed"
```bash
# 清除旧的认证信息
git credential-osxkeychain erase
git credential-store erase

# 重新输入认证
git push -u origin main
```

### "failed to push"
```bash
# 拉取最新代码
git pull origin main --rebase

# 重新推送
git push -u origin main
```

---

## 📞 获取帮助

### GitHub文档
- [GitHub Desktop](https://docs.github.com/en/desktop/)
- [GitHub CLI](https://cli.github.com/manual/)
- [Git基础](https://git-scm.com/book/zh/v2/)

### 常见问题
- [Git常见问题](https://git-scm.com/book/zh/v2/Git-基础-常见问题)

### 社区支持
- [GitHub Community](https://github.community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/github)

---

**需要更多帮助？** 请告诉我您使用的是哪种方法以及遇到的具体错误！

---

*快速参考创建时间: 2026-03-08 22:50*
