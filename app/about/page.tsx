import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于',
  description: '了解更多关于本站和作者的信息',
}

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <article className="prose dark:prose-invert max-w-none">
        <h1>关于本站</h1>
        
        <p>
          欢迎来到我的个人博客！这里是我分享技术心得、生活感悟和学习笔记的地方。
        </p>

        <h2>技术栈</h2>
        <p>
          本站使用现代化的技术栈构建：
        </p>
        <ul>
          <li><strong>Next.js 15</strong> - React 全栈框架，支持 SSR/SSG</li>
          <li><strong>SQLite + Prisma</strong> - 轻量级数据库与 ORM</li>
          <li><strong>Tailwind CSS 3</strong> - 原子化 CSS 框架</li>
          <li><strong>Framer Motion</strong> - 流畅的动画效果</li>
          <li><strong>TypeScript</strong> - 类型安全的开发体验</li>
        </ul>

        <h2>功能特色</h2>
        <ul>
          <li>📝 Markdown 编辑器，支持代码高亮</li>
          <li>🖼️ 图片拖拽上传</li>
          <li>💬 评论系统（本地自建）</li>
          <li>🏷️ 分类和标签管理</li>
          <li>🔍 全文搜索功能</li>
          <li>📱 响应式设计，移动端友好</li>
          <li>🎨 炫酷动画效果，支持无障碍访问</li>
          <li>📡 RSS 订阅支持</li>
          <li>🔍 SEO 优化</li>
        </ul>

        <h2>设计理念</h2>
        <p>
          本站秉承"简洁大方、细节精致"的设计理念：
        </p>
        <ul>
          <li><strong>简洁</strong> - 去除冗余，专注内容</li>
          <li><strong>精致</strong> - 注重细节，提升体验</li>
          <li><strong>高效</strong> - 快速加载，流畅交互</li>
          <li><strong>包容</strong> - 支持无障碍访问，照顾不同用户需求</li>
        </ul>

        <h2>联系方式</h2>
        <p>
          如果你对本站有任何建议或想要交流技术问题，欢迎通过以下方式联系我：
        </p>
        <ul>
          <li>📧 邮箱：your-email@example.com</li>
          <li>🐙 GitHub：<a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">@yourusername</a></li>
          <li>🐦 Twitter：<a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">@yourusername</a></li>
        </ul>

        <h2>版权声明</h2>
        <p>
          本站所有原创内容采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a> 协议进行许可。
          转载请注明出处并保持相同许可协议。
        </p>

        <hr />
        
        <p className="text-center text-gray-500 text-sm">
          感谢你的访问，希望在这里能找到对你有用的内容！
        </p>
      </article>
    </main>
  )
}
