import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url, messages, meta } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: 'Agent URL is required' },
        { status: 400 }
      )
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    console.log('🤖 Calling Agent API:', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        meta,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Agent API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return NextResponse.json(
        {
          error: errorText || 'Failed to call Agent API',
          status: response.status,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Agent API response received')

    return NextResponse.json(data)
  } catch (error: any) {
    console.log('❌ Agent API error:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Failed to call Agent API',
        status: 500,
      },
      { status: 500 }
    )
  }
}
