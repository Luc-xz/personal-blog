#!/bin/bash

# 个人博客一键部署脚本
# 适用于 Ubuntu 20.04/22.04 系统

set -e

echo "🚀 开始部署个人博客系统..."
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印彩色信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "请使用 root 用户运行此脚本"
        print_info "使用命令: sudo bash deploy.sh"
        exit 1
    fi
}

# 检查系统版本
check_system() {
    print_info "检查系统版本..."
    
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "无法检测系统版本"
        exit 1
    fi
    
    print_info "系统: $OS $VER"
    
    if [[ $OS != "Ubuntu" ]]; then
        print_warning "此脚本专为 Ubuntu 设计，其他系统可能需要手动调整"
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 更新系统
update_system() {
    print_info "更新系统包..."
    apt update && apt upgrade -y
    print_success "系统更新完成"
}

# 安装 Node.js
install_nodejs() {
    print_info "安装 Node.js 18..."
    
    # 检查是否已安装
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_info "Node.js 已安装: $NODE_VERSION"
        
        # 检查版本是否符合要求
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [[ $MAJOR_VERSION -ge 18 ]]; then
            print_success "Node.js 版本符合要求"
            return
        else
            print_warning "Node.js 版本过低，需要升级"
        fi
    fi
    
    # 安装 Node.js 18
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    print_success "Node.js 安装完成: $(node --version)"
}

# 安装全局包
install_global_packages() {
    print_info "安装全局包 (PM2, pnpm)..."
    npm install -g pm2 pnpm
    print_success "全局包安装完成"
}

# 安装其他依赖
install_dependencies() {
    print_info "安装其他依赖..."
    apt install -y git nginx certbot python3-certbot-nginx ufw
    print_success "依赖安装完成"
}

# 配置防火墙
setup_firewall() {
    print_info "配置防火墙..."
    
    # 启用 UFW
    ufw --force enable
    
    # 允许 SSH
    ufw allow ssh
    
    # 允许 HTTP 和 HTTPS
    ufw allow 80
    ufw allow 443
    
    # 允许应用端口（开发用）
    ufw allow 3000
    
    print_success "防火墙配置完成"
}

# 创建项目目录
setup_project_directory() {
    print_info "设置项目目录..."
    
    PROJECT_DIR="/var/www/blog"
    
    if [[ -d $PROJECT_DIR ]]; then
        print_warning "项目目录已存在: $PROJECT_DIR"
        read -p "是否删除并重新创建? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf $PROJECT_DIR
        else
            print_info "使用现有目录"
            return
        fi
    fi
    
    mkdir -p $PROJECT_DIR
    print_success "项目目录创建完成: $PROJECT_DIR"
}

# 部署代码
deploy_code() {
    print_info "部署代码..."
    
    cd /var/www/blog
    
    # 如果当前目录有代码文件，说明是在项目目录中运行的脚本
    if [[ -f "package.json" ]]; then
        print_info "检测到当前目录有项目文件，复制到部署目录..."
        
        # 如果不是在目标目录，则复制文件
        if [[ $(pwd) != "/var/www/blog" ]]; then
            cp -r . /var/www/blog/
            cd /var/www/blog
        fi
    else
        print_error "未找到项目文件"
        print_info "请确保在项目根目录运行此脚本，或手动上传代码到 /var/www/blog"
        exit 1
    fi
    
    print_success "代码部署完成"
}

# 安装项目依赖
install_project_dependencies() {
    print_info "安装项目依赖..."
    
    cd /var/www/blog
    
    if [[ ! -f "package.json" ]]; then
        print_error "未找到 package.json 文件"
        exit 1
    fi
    
    pnpm install
    print_success "项目依赖安装完成"
}

# 配置环境变量
setup_environment() {
    print_info "配置环境变量..."
    
    cd /var/www/blog
    
    if [[ ! -f ".env" ]]; then
        if [[ -f ".env.example" ]]; then
            cp .env.example .env
            print_info "已创建 .env 文件，请手动编辑配置"
        else
            print_warning "未找到 .env.example 文件，创建默认配置"
            cat > .env << EOF
DATABASE_URL="file:./data/blog.db"
SESSION_SECRET="$(openssl rand -base64 32)"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
EOF
        fi
        
        print_warning "请编辑 .env 文件设置你的配置:"
        print_info "nano /var/www/blog/.env"
        print_info "主要需要修改:"
        print_info "- ADMIN_PASSWORD: 管理员密码"
        print_info "- NEXT_PUBLIC_SITE_URL: 你的网站地址"
        
        read -p "按 Enter 继续..."
    else
        print_info ".env 文件已存在"
    fi
    
    print_success "环境变量配置完成"
}

# 初始化数据库
init_database() {
    print_info "初始化数据库..."
    
    cd /var/www/blog
    
    # 创建数据目录
    mkdir -p data
    
    # 生成 Prisma 客户端
    pnpm run prisma:generate
    
    # 运行初始化脚本
    pnpm run init
    
    print_success "数据库初始化完成"
}

# 构建项目
build_project() {
    print_info "构建项目..."
    
    cd /var/www/blog
    pnpm run build
    
    print_success "项目构建完成"
}

# 启动应用
start_application() {
    print_info "启动应用..."
    
    cd /var/www/blog
    
    # 停止可能存在的进程
    pm2 delete personal-blog 2>/dev/null || true
    
    # 启动应用
    pm2 start ecosystem.config.js
    
    # 保存 PM2 配置
    pm2 save
    
    # 设置开机自启
    pm2 startup systemd -u root --hp /root
    
    print_success "应用启动完成"
}

# 配置 Nginx
setup_nginx() {
    print_info "配置 Nginx..."
    
    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/blog << 'EOF'
server {
    listen 80;
    server_name _;
    
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
    
    location /uploads/ {
        alias /var/www/blog/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # 启用配置
    ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
    
    # 删除默认配置
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    nginx -t
    
    # 重启 Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    print_success "Nginx 配置完成"
}

# 显示部署结果
show_result() {
    print_success "🎉 部署完成！"
    echo "================================"
    
    # 获取服务器 IP
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "未知")
    
    echo -e "${GREEN}访问信息:${NC}"
    echo "  网站地址: http://$SERVER_IP"
    echo "  后台登录: http://$SERVER_IP/login"
    echo "  管理后台: http://$SERVER_IP/admin"
    echo ""
    
    echo -e "${YELLOW}重要提醒:${NC}"
    echo "  1. 请修改 /var/www/blog/.env 中的管理员密码"
    echo "  2. 如有域名，请配置域名解析指向: $SERVER_IP"
    echo "  3. 建议配置 HTTPS 证书: certbot --nginx -d 你的域名"
    echo ""
    
    echo -e "${BLUE}常用命令:${NC}"
    echo "  查看状态: pm2 status"
    echo "  查看日志: pm2 logs personal-blog"
    echo "  重启应用: pm2 restart personal-blog"
    echo "  重启 Nginx: systemctl restart nginx"
    echo ""
    
    print_success "开始你的博客之旅吧！"
}

# 主函数
main() {
    echo "🚀 个人博客一键部署脚本"
    echo "适用于 Ubuntu 20.04/22.04"
    echo "================================"
    echo ""
    
    check_root
    check_system
    
    print_info "开始自动部署..."
    
    update_system
    install_nodejs
    install_global_packages
    install_dependencies
    setup_firewall
    setup_project_directory
    deploy_code
    install_project_dependencies
    setup_environment
    init_database
    build_project
    start_application
    setup_nginx
    
    show_result
}

# 运行主函数
main "$@"
