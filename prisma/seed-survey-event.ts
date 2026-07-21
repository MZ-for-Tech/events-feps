import { prisma } from '../lib/prisma'

async function main() {
  // Create Category
  const category = await prisma.eventCategory.create({
    data: {
      nameEn: 'Tech Conference',
      nameAr: 'مؤتمر تقني',
      nameFr: 'Conférence Technique'
    }
  })

  // Create Event
  const event = await prisma.event.create({
    data: {
      title: 'Future of AI 2026',
      titleAr: 'مستقبل الذكاء الاصطناعي ٢٠٢٦',
      titleFr: 'Avenir de l\'IA 2026',
      categoryId: category.id,
      startDate: new Date('2026-08-01T10:00:00Z'),
      endDate: new Date('2026-08-01T18:00:00Z'),
      published: true,
      surveyEnabled: true,
      registrationEnabled: true,
      surveyQuestions: JSON.stringify([
        {
          id: 'q1',
          type: 'choice',
          text: 'How would you rate the event?',
          options: ['Excellent', 'Good', 'Average', 'Poor'],
          required: true
        },
        {
          id: 'q2',
          type: 'text',
          text: 'Any additional feedback?',
          required: false
        }
      ])
    }
  })

  // Create Registration
  const reg = await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      identifier: '123456789',
      identifierType: 'NATIONAL_ID',
      name: 'Ezz Eldin',
      email: 'test@example.com'
    }
  })

  console.log(`\n✅ Seeded Event: ${event.title}`)
  console.log(`✅ Event ID: ${event.id}`)
  console.log(`✅ Registration Identifier: ${reg.identifier} (Use this to submit the survey if required)`)
  console.log(`\n🔗 Survey URL: /en/events/${event.id}/survey`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
