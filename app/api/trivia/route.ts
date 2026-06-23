import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const questions = await prisma.triviaQuestion.findMany()
    
    if (questions.length === 0) {
      return NextResponse.json([])
    }

    // Shuffle questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    
    // Pick exactly 5 questions (or all if less than 5)
    const count = Math.min(5, questions.length)
    const selected = shuffled.slice(0, count)

    // For public API, we don't return which one is correct to prevent cheating via devtools
    // Actually, we can return it because this is a simple trivia game, not an exam.
    // Let's just return the whole object, the options contain `isCorrect`.
    
    return NextResponse.json(selected)
  } catch (error) {
    console.error('Failed to fetch trivia:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
