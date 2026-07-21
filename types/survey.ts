export type SurveyQuestion = {
  id: string
  type: 'text' | 'choice'
  text: string
  options?: string[]
  required?: boolean
}
