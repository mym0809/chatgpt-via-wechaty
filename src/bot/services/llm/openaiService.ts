import axios from 'axios'
import { getConfig } from '../../config'

const config = getConfig()

export async function generateText(prompt: string): Promise<string> {
  try {
    const response = await axios.post(config.openaiApiUrl, {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature
    }, {
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data.choices[0].message?.content.trim() || ''
  } catch (error) {
    console.error('Error generating text:', error)
    throw error
  }
}