import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { GROQ_API_KEY } from '@/config/server'

const groq = new Groq({
  apiKey: GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'groq/compound', temperature = 0.7, max_tokens = 1000, response_format } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      ...(response_format && { response_format }),
    })

    return NextResponse.json({
      content: completion.choices[0]?.message?.content || '',
      model: completion.model,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.log('❌ Groq API error:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Failed to call Groq API',
        status: error?.status || 500,
      },
      { status: error?.status || 500 }
    )
  }
}

