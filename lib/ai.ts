import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { wrapLanguageModel } from 'ai'

import { customMiddleware } from './custom-middleware'

const google = createGoogleGenerativeAI({
  // custom settings
})

export const geminiWrapper = wrapLanguageModel({
  model: google('gemini-2.5-flash'),
  middleware: customMiddleware
})
