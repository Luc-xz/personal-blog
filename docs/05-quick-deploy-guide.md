# ⚡ 5分钟快速部署指南

> 最简单的部署方式，适合急着上线的小白用户

## 🎯 一键部署（推荐）

### 方法一：使用自动化脚本

1. **上传代码到服务器**
   ```bash
   # 在服务器上执行
   cd /var/www
   # 上传你的项目文件到这里
   ```

2. **运行一键部署脚本**
   ```bash
   cd /var/www/blog
   chmod +x scripts/deploy.sh
   sudo bash scripts/deploy.sh
   ```

3. **等待完成**
   - 脚本会自动安装所有依赖
   - 自动配置环境
   - 自动启动服务

4. **访问网站**
   - 打开浏览器访问：`http://你的服务器IP`
   - 后台登录：`http://你的服务器IP/login`

### 方法二：手动快速部署

如果自动脚本失败，可以手动执行：

```bash
# 1. 更新系统
apt update && apt upgrade -y

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 3. 安装工具
npm install -g pm2 pnpm

# 4. 进入项目目录
cd /var/www/blog

# 5. 安装依赖
pnpm install

# 6. 配置环境
cp .env.example .env
nano .env  # 修改管理员密码和网站地址

# 7. 初始化
pnpm run init

# 8. 构建
pnpm run build

# 9. 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔧 必须修改的配置

编辑 `.env` 文件：
```bash
nano /var/www/blog/.env
```

**必须修改的项目：**
```env
# 改成强密码
ADMIN_PASSWORD="你的强密码123"

# 改成你的域名或IP
NEXT_PUBLIC_SITE_URL="http://你的域名或IP"

# 改成随机字符串
SESSION_SECRET="随机生成的长字符串"
```

## 🌐 配置域名访问（可选）

### 1. 域名解析
在域名服务商添加 A 记录：
- 主机记录：@
- 记录值：你的服务器IP

### 2. 安装 Nginx
```bash
apt install nginx -y
```

### 3. 配置 Nginx
```bash
cat > /etc/nginx/sites-available/blog << 'EOF'
server {
    listen 80;
    server_name 你的域名.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 4. 配置 HTTPS
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d 你的域名.com
```

## ✅ 验证部署

访问以下地址确认：
- [ ] 首页：`http://你的域名或IP`
- [ ] 登录：`http://你的域名或IP/login`
- [ ] 后台：`http://你的域名或IP/admin`

## 🆘 常见问题

### 网站无法访问
```bash
# 检查服务状态
pm2 status

# 重启服务
pm2 restart personal-blog

# 查看日志
pm2 logs personal-blog
```

### 端口被占用
```bash
# 查看端口占用
netstat -tlnp | grep :3000

# 杀死进程
kill -9 进程ID
```

### 权限问题
```bash
# 修复权限
chown -R root:root /var/www/blog
chmod -R 755 /var/www/blog
```

## 🎉 完成！

现在你的博客已经成功上线了！

**下一步：**
1. 登录后台开始写文章
2. 在后台设置站点信息
3. 定期备份数据

**重要提醒：**
- 定期更新管理员密码
- 定期导出备份
- 监控服务器资源使用情况

---

🚀 **开始你的博客之旅吧！**
