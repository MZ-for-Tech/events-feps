import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('[Seed] Seeding FEPS Events Info System database...')

  await prisma.auditLog.deleteMany()
  await prisma.surveyResponse.deleteMany()
  await prisma.event.deleteMany()
  await prisma.eventCategory.deleteMany()
  await prisma.user.deleteMany()

  // ── 1. Categories ───────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.eventCategory.create({ data: { nameEn: 'Conference', nameAr: 'مؤتمر', nameFr: 'Conférence', color: '#1A3A6E', bg: 'rgba(26,58,110,0.12)' } }),
    prisma.eventCategory.create({ data: { nameEn: 'Seminar', nameAr: 'ندوة', nameFr: 'Séminaire', color: '#0E6B55', bg: 'rgba(14,107,85,0.12)' } }),
    prisma.eventCategory.create({ data: { nameEn: 'Workshop', nameAr: 'ورشة عمل', nameFr: 'Atelier', color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' } }),
    prisma.eventCategory.create({ data: { nameEn: 'Forum', nameAr: 'منتدى', nameFr: 'Forum', color: '#B45309', bg: 'rgba(180,83,9,0.12)' } }),
    prisma.eventCategory.create({ data: { nameEn: 'Lecture', nameAr: 'محاضرة', nameFr: 'Conférence magistrale', color: '#B91C1C', bg: 'rgba(185,28,28,0.12)' } }),
  ])
  console.log('[OK] Categories created:', categories.map(c => c.nameEn).join(', '))

  // ── 2. Users ─────────────────────────────────────────────────────────────
  const adminPwd = await bcrypt.hash('admin1234', 12)
  const managerPwd = await bcrypt.hash('manager123', 12)
  const editorPwd = await bcrypt.hash('editor123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@feps.edu.eg' },
    update: { name: 'System Admin' },
    create: { name: 'System Admin', email: 'admin@feps.edu.eg', password: adminPwd, role: 'SUPERADMIN' },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@feps.edu.eg' },
    update: { name: 'Events Manager' },
    create: { name: 'Events Manager', email: 'manager@feps.edu.eg', password: managerPwd, role: 'MANAGER' },
  })

  const editor = await prisma.user.upsert({
    where: { email: 'editor@feps.edu.eg' },
    update: { name: 'Content Editor' },
    create: { name: 'Content Editor', email: 'editor@feps.edu.eg', password: editorPwd, role: 'EDITOR' },
  })

  console.log('[OK] Users created:', [admin, manager, editor].map(u => u.email).join(', '))

  // ── 3. Sample Events ──────────────────────────────────────────────────────
  const now = new Date()
  await prisma.event.create({
    data: {
      title: 'Annual Economic Forum 2026',
      titleAr: 'المنتدى الاقتصادي السنوي ٢٠٢٦',
      categoryId: categories[3].id, // Forum
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 9, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 17, 0),
      location: 'Main Hall',
      description: 'The annual economic forum discussing the future of AI in macroeconomics.',
      published: true,
    }
  })

  await prisma.event.create({
    data: {
      title: 'Data Science in Public Policy Seminar',
      titleAr: 'ندوة علوم البيانات في السياسة العامة',
      categoryId: categories[1].id, // Seminar
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 12, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 14, 0),
      location: 'Room 412',
      description: 'A seminar on utilizing large datasets to inform public policy decisions.',
      published: false,
    }
  })

  console.log('[OK] Sample events created')

  console.log('\n[Done] Seed complete!\n')
  console.log('┌────────────────────────────────────────────────────────────┐')
  console.log('│  DEMO CREDENTIALS                                          │')
  console.log('├────────────────────────────────────────────────────────────┤')
  console.log('│  Superadmin admin@feps.edu.eg      / admin1234             │')
  console.log('│  Manager    manager@feps.edu.eg    / manager123            │')
  console.log('│  Editor     editor@feps.edu.eg     / editor123             │')
  console.log('└────────────────────────────────────────────────────────────┘')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
