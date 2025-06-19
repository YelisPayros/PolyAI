import { groq } from '@ai-sdk/groq'
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai'

import { customMiddleware } from './custom-middleware'

export const o4mini = wrapLanguageModel({
  model: groq('llama-3.1-8b-instant'),
  middleware: customMiddleware
})
