# 🚀 个人博客网站上线教程（小白版）

> 本教程专为不懂技术的小白用户编写，每一步都有详细说明，跟着做就能成功上线你的博客网站！

## 📋 准备工作清单

在开始之前，你需要准备以下物品：

### 必需品
- [ ] 一台云服务器（推荐阿里云、腾讯云、华为云）
- [ ] 一个域名（可选，没有也能用 IP 访问）
- [ ] 一台能上网的电脑
- [ ] 耐心和细心 😊

### 推荐配置
- **服务器配置**：2核4G内存，40G硬盘（最低1核2G也可以）
- **操作系统**：Ubuntu 20.04 或 22.04（推荐）
- **预算**：服务器约 100-300元/年，域名约 50-100元/年

## 🎯 第一步：购买和设置云服务器

### 1.1 购买云服务器

以阿里云为例（其他云服务商类似）：

1. **注册账号**
   - 访问 [阿里云官网](https://www.aliyun.com)
   - 注册账号并完成实名认证

2. **购买 ECS 服务器**
   - 进入"云服务器ECS"产品页
   - 选择"立即购买"
   - 配置选择：
     - **地域**：选择离你最近的（如华东、华北）
     - **实例规格**：2核4G（或1核2G入门版）
     - **镜像**：Ubuntu 20.04 64位
     - **存储**：40GB 高效云盘
     - **网络**：默认VPC，分配公网IP
     - **安全组**：默认安全组
   - 设置登录密码（记住这个密码！）
   - 购买时长：建议先买1个月测试

3. **配置安全组**
   - 进入 ECS 控制台
   - 找到你的服务器，点击"更多" → "网络和安全组" → "安全组配置"
   - 添加规则：
     - 端口范围：80/80，授权对象：0.0.0.0/0
     - 端口范围：443/443，授权对象：0.0.0.0/0
     - 端口范围：3000/3000，授权对象：0.0.0.0/0

### 1.2 连接到服务器

**Windows 用户：**
1. 下载 [PuTTY](https://www.putty.org/) 或使用 Windows Terminal
2. 打开 PuTTY，输入服务器公网IP
3. 端口：22，连接类型：SSH
4. 点击"Open"连接
5. 用户名输入：`root`
6. 密码输入：你设置的服务器密码

**Mac 用户：**
1. 打开"终端"应用
2. 输入：`ssh root@你的服务器IP`
3. 输入密码

连接成功后，你会看到类似这样的界面：
```
root@iZ2ze***:~#
```

## 🛠️ 第二步：安装必要软件

复制粘贴以下命令到服务器终端（一行一行执行）：

### 2.1 更新系统
```bash
apt update && apt upgrade -y
```
> 这一步可能需要几分钟，耐心等待

### 2.2 安装 Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

### 2.3 安装 PM2 和 pnpm
```bash
npm install -g pm2 pnpm
```

### 2.4 安装 Git
```bash
apt install git -y
```

### 2.5 验证安装
```bash
node --version
npm --version
pnpm --version
git --version
```
> 如果都显示版本号，说明安装成功

## 📦 第三步：部署博客代码

### 3.1 创建网站目录
```bash
mkdir -p /var/www
cd /var/www
```

### 3.2 下载博客代码

**方法一：如果你有 Git 仓库**
```bash
git clone https://github.com/你的用户名/personal-blog.git blog
```

**方法二：如果没有 Git 仓库**
1. 在你的电脑上，将博客文件夹打包成 zip
2. 使用 WinSCP（Windows）或 Cyberduck（Mac）上传到服务器
3. 解压到 `/var/www/blog` 目录

### 3.3 进入项目目录
```bash
cd /var/www/blog
```

### 3.4 安装项目依赖
```bash
pnpm install
```
> 这一步需要几分钟，下载所有必要的代码包

## ⚙️ 第四步：配置博客

### 4.1 创建环境配置文件
```bash
cp .env.example .env
```

### 4.2 编辑配置文件
```bash
nano .env
```

修改以下内容（用方向键移动，直接输入修改）：
```env
# 数据库文件位置
DATABASE_URL="file:./data/blog.db"

# JWT 密钥（改成你自己的随机字符串）
SESSION_SECRET="your-super-secret-key-change-this-to-random-string"

# 管理员账号（改成你想要的用户名和密码）
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-password-123"

# 网站地址（改成你的域名或服务器IP）
NEXT_PUBLIC_SITE_URL="http://你的域名或IP:3000"
```

按 `Ctrl + X`，然后按 `Y`，再按 `Enter` 保存文件。

### 4.3 初始化数据库
```bash
pnpm run init
```

### 4.4 构建网站
```bash
pnpm run build
```
> 这一步需要几分钟，将代码编译成生产版本

## 🚀 第五步：启动网站

### 5.1 使用 PM2 启动
```bash
pm2 start ecosystem.config.js
```

### 5.2 设置开机自启
```bash
pm2 save
pm2 startup
```
> 按照提示执行显示的命令

### 5.3 检查运行状态
```bash
pm2 status
```
> 应该显示 "online" 状态

## 🌐 第六步：访问你的网站

### 6.1 通过 IP 访问
在浏览器中输入：`http://你的服务器IP:3000`

你应该能看到博客首页！

### 6.2 登录后台管理
访问：`http://你的服务器IP:3000/login`
使用你在 `.env` 文件中设置的用户名和密码登录。

## 🔧 第七步：绑定域名（可选）

如果你有域名，可以让访问更方便：

### 7.1 域名解析
1. 登录你的域名服务商（如阿里云、腾讯云）
2. 进入域名管理 → DNS 解析
3. 添加 A 记录：
   - 主机记录：@ 或 www
   - 记录值：你的服务器公网IP
   - TTL：600

### 7.2 安装 Nginx（推荐）
```bash
apt install nginx -y
```

### 7.3 配置 Nginx
```bash
nano /etc/nginx/sites-available/blog
```

输入以下内容（替换 `your-domain.com` 为你的域名）：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.4 启用配置
```bash
ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

现在你可以通过域名直接访问：`http://your-domain.com`

## 🔒 第八步：配置 HTTPS（推荐）

### 8.1 安装 Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 8.2 获取 SSL 证书
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```
> 按照提示输入邮箱，同意条款

### 8.3 设置自动续期
```bash
crontab -e
```
选择编辑器（推荐选择 nano），然后添加：
```
0 12 * * * /usr/bin/certbot renew --quiet
```

现在你的网站支持 HTTPS 了：`https://your-domain.com`

## ✅ 第九步：验证部署

### 9.1 检查网站功能
- [ ] 首页能正常访问
- [ ] 能够登录后台 `/login`
- [ ] 能够创建和发布文章
- [ ] 能够上传图片
- [ ] 评论功能正常

### 9.2 检查服务状态
```bash
pm2 status
systemctl status nginx
```

## 🎉 恭喜！你的博客已经上线了！

现在你可以：
1. 登录后台开始写文章
2. 分享你的网站给朋友
3. 开始你的博客之旅

## 📚 日常维护

### 重启网站
```bash
pm2 restart personal-blog
```

### 查看日志
```bash
pm2 logs personal-blog
```

### 备份数据
定期在后台管理中导出备份，保存到本地。

### 更新代码
```bash
cd /var/www/blog
git pull  # 如果使用 Git
pnpm run build
pm2 restart personal-blog
```

## 🆘 遇到问题怎么办？

### 常见问题

**1. 网站无法访问**
- 检查服务器是否运行：`pm2 status`
- 检查端口是否开放：安全组配置
- 检查防火墙：`ufw status`

**2. 无法登录后台**
- 检查用户名密码是否正确
- 重新运行：`pnpm run init`

**3. 图片上传失败**
- 检查 uploads 目录权限：`chmod 755 uploads`
- 检查磁盘空间：`df -h`

**4. 需要帮助**
- 查看错误日志：`pm2 logs`
- 重启服务：`pm2 restart all`
- 联系技术支持

---

🎊 **恭喜你完成了博客部署！现在开始享受写作的乐趣吧！**
