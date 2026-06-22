import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const MIN_TEXT_LENGTH = 30
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']
const ALLOWED_MIMETYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

function getExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx >= 0 ? filename.slice(idx).toLowerCase() : ''
}

export async function POST(request) {
  try {
    // 1. Parse multipart/form-data
    let formData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request — expected multipart/form-data.' },
        { status: 400 }
      )
    }

    const file = formData.get('file')

    // 2. Validate file presence
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file received. Please select a PDF or DOCX file.' },
        { status: 400 }
      )
    }

    const filename = file.name || ''
    const ext = getExtension(filename)
    const mimetype = file.type || ''

    // 3. Validate extension
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file type "${ext || '(none)'}". Please upload a PDF (.pdf) or Word document (.docx).`,
        },
        { status: 400 }
      )
    }

    // 4. Validate size (server-side guard)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Please upload a file under 5 MB, or paste the text directly.`,
        },
        { status: 400 }
      )
    }

    // 5. Read file into a Buffer (no disk writes)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 6. Parse by type
    let extractedText = ''

    if (ext === '.pdf') {
      try {
        // pdf-parse works with a Buffer directly
        const pdfParse = (await import('pdf-parse')).default
        const result = await pdfParse(buffer)
        extractedText = result.text || ''
      } catch (pdfError) {
        console.error('pdf-parse error:', pdfError)
        return NextResponse.json(
          {
            error:
              'Could not extract text from this PDF. It may be a scanned image without selectable text, or the file may be corrupted.',
          },
          { status: 422 }
        )
      }
    } else if (ext === '.docx') {
      try {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        extractedText = result.value || ''
      } catch (docxError) {
        console.error('mammoth error:', docxError)
        return NextResponse.json(
          {
            error:
              'Could not extract text from this DOCX file. The file may be corrupted or in an unsupported format.',
          },
          { status: 422 }
        )
      }
    }

    // 7. Guard against empty / image-only results
    const trimmed = extractedText.trim()
    if (trimmed.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            ext === '.pdf'
              ? 'This PDF appears to contain no selectable text — it may be a scanned image. Please paste the text manually instead.'
              : 'Could not extract meaningful text from this file. Please paste the text manually instead.',
        },
        { status: 422 }
      )
    }

    // 8. Return the extracted text
    return NextResponse.json({ text: trimmed }, { status: 200 })
  } catch (unexpectedError) {
    console.error('Unexpected error in /api/parse-file:', unexpectedError)
    return NextResponse.json(
      { error: 'An unexpected error occurred while parsing the file. Please try again.' },
      { status: 500 }
    )
  }
}
