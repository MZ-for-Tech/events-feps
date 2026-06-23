import { PrismaClient } from '@prisma/client'
import * as xlsx from 'xlsx'

const prisma = new PrismaClient()

async function main() {
  console.log('Reading Excel file...')
  const workbook = xlsx.readFile('./كلية_الاقتصاد_والعلوم_السياسية_MCQ_70.xlsx')
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows: Record<string, unknown>[] = xlsx.utils.sheet_to_json(sheet)

  console.log(`Found ${rows.length} questions. Clearing existing trivia...`)
  await prisma.triviaQuestion.deleteMany()

  console.log('Seeding trivia questions...')
  
  let count = 0
  for (const row of rows) {
    // Map Arabic correct answer letter to index
    const correctLetter = row['الإجابة الصحيحة']?.toString().trim()
    let correctIndex = 0
    if (correctLetter === 'أ') correctIndex = 0
    else if (correctLetter === 'ب') correctIndex = 1
    else if (correctLetter === 'ج') correctIndex = 2
    else if (correctLetter === 'د') correctIndex = 3

    const optionsAr = [
      row['أ']?.toString() || '',
      row['ب']?.toString() || '',
      row['ج']?.toString() || '',
      row['د']?.toString() || '',
    ]

    const options = optionsAr.map((opt, i) => ({
      textAr: opt,
      textEn: opt, // Fallback to Arabic if not translated
      textFr: opt, // Fallback to Arabic if not translated
      isCorrect: i === correctIndex
    }))

    const explanationAr = row['المصدر/الملاحظة']?.toString() || null

    await prisma.triviaQuestion.create({
      data: {
        textAr: row['السؤال']?.toString() || '',
        textEn: row['السؤال']?.toString() || '', // Fallback
        textFr: row['السؤال']?.toString() || '', // Fallback
        explanationAr: explanationAr,
        explanation: explanationAr,
        explanationFr: explanationAr,
        options: JSON.stringify(options)
      }
    })
    count++
  }

  console.log(`Seeded ${count} trivia questions.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
