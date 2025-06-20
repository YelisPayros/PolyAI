import { groq } from '@ai-sdk/groq'
import { wrapLanguageModel } from 'ai'

import { customMiddleware } from './custom-middleware'

export const o4mini = wrapLanguageModel({
  model: groq('llama-3.3-70b-versatile'),
  middleware: customMiddleware
})
