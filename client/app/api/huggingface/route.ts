import { NextRequest, NextResponse } from 'next/server'
import { HF_TOKEN } from '@/config/server'

export async function POST(req: NextRequest) {
  try {
    const { url, messages, meta } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: 'HuggingFace URL is required' },
        { status: 400 }
      )
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Thêm token nếu có
    if (HF_TOKEN) {
      headers['Authorization'] = `Bearer ${HF_TOKEN}`
    }

    console.log('🤗 Calling HuggingFace API:', url)

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        meta,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ HuggingFace API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return NextResponse.json(
        {
          error: errorText || 'Failed to call HuggingFace API',
          status: response.status,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ HuggingFace API response received')

    return NextResponse.json(data)
  } catch (error: any) {
    console.log('❌ HuggingFace API error:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Failed to call HuggingFace API',
        status: 500,
      },
      { status: 500 }
    )
  }
}
