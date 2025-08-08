/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // 关闭 typedRoutes 以简化路由处理，后续再按需开启
    serverActions: { allowedOrigins: ['localhost:3000'] }
  }
};

export default nextConfig;

