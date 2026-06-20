const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const EVENT_TYPE_META = {
  CULTURAL:           { label: 'Cultural',           labelAr: 'ثقافي',           labelFr: 'Culturel',             color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
  SCIENTIFIC:         { label: 'Scientific',         labelAr: 'علمي',            labelFr: 'Scientifique',          color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)' },
  LITERARY:           { label: 'Literary',           labelAr: 'أدبي',            labelFr: 'Littéraire',            color: '#D97706', bg: 'rgba(217,119,6,0.12)'  },
  HONORS:             { label: 'Honors',             labelAr: 'تكريم',           labelFr: 'Distinctions',          color: '#F5A800', bg: 'rgba(245,168,0,0.12)'  },
  GRADUATION_PROJECT: { label: 'Graduation Project', labelAr: 'مشروع تخرج',     labelFr: 'Projet de Fin d’Études', color: '#1A3A6E', bg: 'rgba(26,58,110,0.12)' },
  VISIT:              { label: 'Campus Visit',       labelAr: 'زيارة',           labelFr: 'Visite de Campus',      color: '#059669', bg: 'rgba(5,150,105,0.12)'  },
  SEMINAR:            { label: 'Seminar',            labelAr: 'ندوة',            labelFr: 'Séminaire',             color: '#DC2626', bg: 'rgba(220,38,38,0.12)'  },
  WORKSHOP:           { label: 'Workshop',           labelAr: 'ورشة عمل',        labelFr: 'Atelier',               color: '#EA580C', bg: 'rgba(234,88,12,0.12)'  },
  PRACTICAL_TRAINING: { label: 'Practical Training', labelAr: 'تدريب عملي',      labelFr: 'Formation Pratique',     color: '#0D9488', bg: 'rgba(13,148,136,0.12)' },
  EXHIBITION:         { label: 'Exhibition',         labelAr: 'معرض',            labelFr: 'Exposition',            color: '#DB2777', bg: 'rgba(219,39,119,0.12)'  },
  CONFERENCE:         { label: 'Conference',         labelAr: 'مؤتمر',           labelFr: 'Conférence',            color: '#6366F1', bg: 'rgba(99,102,241,0.12)'  },
}

async function migrate() {
  console.log('Starting migration...')
  const categoryMap = {}

  for (const [type, meta] of Object.entries(EVENT_TYPE_META)) {
    // Check if it already exists
    let cat = await prisma.eventCategory.findFirst({
      where: { nameEn: meta.label }
    })
    
    if (!cat) {
      cat = await prisma.eventCategory.create({
        data: {
          nameEn: meta.label,
          nameAr: meta.labelAr,
          nameFr: meta.labelFr,
          color: meta.color,
          bg: meta.bg
        }
      })
      console.log(`Created category: ${meta.label}`)
    } else {
      console.log(`Category already exists: ${meta.label}`)
    }
    categoryMap[type] = cat.id
  }

  // Update events
  const events = await prisma.event.findMany()
  console.log(`Found ${events.length} events to update.`)
  
  for (const ev of events) {
    if (ev.type && categoryMap[ev.type]) {
      await prisma.event.update({
        where: { id: ev.id },
        data: { categoryId: categoryMap[ev.type] }
      })
      console.log(`Updated event ${ev.title} with category ${categoryMap[ev.type]}`)
    }
  }

  console.log('Migration complete.')
}

migrate().catch(console.error).finally(() => prisma.$disconnect())
