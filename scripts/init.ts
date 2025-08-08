import 'dotenv/config'
import { prisma } from '../lib/db'
import * as fs from 'fs'
import bcrypt from 'bcryptjs'

async function main() {
  const uploadDir = process.env.UPLOAD_DIR || './uploads'
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  await prisma.siteConfig.upsert({
    where: { key: 'site' },
    update: {},
    create: { key: 'site', value: JSON.stringify({ title: '个人博客', description: 'Hello' }) },
  })

  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  if (username && password) {
    const existing = await prisma.user.findUnique({ where: { username } })
    if (!existing) {
      const hash = await bcrypt.hash(password, 10)
      await prisma.user.create({ data: { username, password: hash } })
      console.log(`Admin user created: ${username}`)
    } else {
      console.log(`Admin user exists: ${username}`)
    }
  } else {
    console.warn('ADMIN_USERNAME/ADMIN_PASSWORD not set, skip admin creation')
  }

  console.log('Initialized uploads dir, site config, admin user')
}

main().catch((e) => { console.error(e); process.exit(1) })

