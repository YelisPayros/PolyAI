import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Validate file size and type
const validateFile = (file: File) => {
  const errors = []

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size should be less than 5MB')
  }

  // Check file type
  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
    errors.push('File type should be JPEG, PNG, or PDF')
  }

  return {
    success: errors.length === 0,
    errors
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const validatedFile = validateFile(file)

    if (!validatedFile.success) {
      const errorMessage = validatedFile.errors.join(', ')

      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const filename = file.name
    const fileBuffer = await file.arrayBuffer()

    try {
      const data = await put(`${filename}`, fileBuffer, {
        access: 'public'
      })

      return NextResponse.json(data)
    } catch {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
