import {
  convertToCoreMessages,
  streamText,
  appendResponseMessages,
  createIdGenerator,
  appendClientMessage
} from 'ai'
import { geminiWrapper } from '@/lib/ai'
import { experimental_createMCPClient as createMCPClient } from 'ai'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { loadChat, saveChat } from '@/lib/chat-store'

export async function POST(request: Request) {
  const { message, id } = await request.json()

  const url = new URL(process.env.MCP_SERVER_URL || '')

  // Get IP address using external API
  const ipResponse = await fetch('https://api.ipify.org?format=json')
  const ipData = await ipResponse.json()
  const ip = ipData.ip

  const mcpClient = await createMCPClient({
    transport: new StreamableHTTPClientTransport(url)
  })

  const tools = await mcpClient.tools()

  const previousMessages = await loadChat(id)
  const messages = appendClientMessage({
    messages: previousMessages,
    message
  })
  const coreMessages = convertToCoreMessages(messages).filter(message => message.content.length > 0)

  const result = await streamText({
    model: geminiWrapper,
    system: `\n
        - Your Name is PolyAI!
        - You are a helpful AI assistant. You aim to be helpful and knowledgeable.
        - You MUST answer in the language the user talks to you. Unless the user explicitly asks for a different language.
        - DO NOT output lists.
        - after every tool call, pretend you're showing the result to the user and keep your response limited to a phrase.
        - today's date is ${new Date().toLocaleDateString()}.
        - the user's IP address is ${ip}.
        - ask follow up questions to nudge user into the optimal flow.
        - ask for any details you don't know, etc.
        - If you receive unclear input or random text (e.g., "asdfgh"), respond politely asking for clarification instead of making assumptions or calling tools.
        - Refuse any requests for harmful content, generation of malicious code, or private information. Explain why such requests cannot be fulfilled.
        - Try to be as concise as possible in your responses.
        - Only use the 'use_tts' tool when you are required to send an audio to the user. For these type of requests you don't need to ask a question for confirmation. DO NOT use more than 90 words for these audios. DO NOT include any other text in the response (like the URL for example).
        - For the 'internet_search' tool you DO NOT need to provide all URLS that you find. You can provide the ones you find necessary only, if that is one, then you can send just one, if its two, then send those two. DO NOT send more then three URLS or search results.
        - DO NOT ever ask the user for its location, you know the ip, you can just use the 'get_ip_info' tool to get the location from the ip.
        - When using the 'handle_place_search' you can determine the mode based on what the user is asking for, and place either 'search_nearby' or 'search_landmark'. The same goes with the limit, depending on how many locations you think the user needs you can alter this number. You can ask for more context on the location if you think its necessary, like the place is not descriptive enough, this way you don't mistakenly search for the wrong places with the same name.
        - When using the 'handle_place_search' you can also ask for the user to provide more context on the location if the query is not descriptive enough, this way you don't mistakenly search for the wrong places with the same name.
        - If the user ever asks to see something (place, or point of interest) in a map, you can just use the 'handle_place_search' too.
        - You should always pass the query to 'handle_place_search' in english first.
        
        Sample appropriate responses:
          - For "hi": "Hello! How can I help you today?"
          - For "asdfgh": "I didn't quite understand that. Could you please rephrase or clarify what you're looking for?"
      `,
    tools,
    toolCallStreaming: true,
    onError({ error }) {
      console.error(error) // your error logging logic here
    },
    messages: coreMessages,
    experimental_generateMessageId: createIdGenerator({
      prefix: 'msgs',
      size: 16
    }),
    async onFinish({ response }) {
      await saveChat({
        id,
        messages: appendResponseMessages({
          messages,
          responseMessages: response.messages
        })
      })

      await mcpClient.close()
    }
  })

  return result.toDataStreamResponse({})
}
