import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

// Disable body parser for file uploads
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Method 1: Try Gemini's native PDF parsing first (fastest)
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

      const base64 = buffer.toString('base64')
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64,
            mimeType: "application/pdf"
          }
        },
        "Extract all text content from this resume PDF. Return the complete text content preserving structure and formatting as much as possible. Include all sections like personal info, experience, education, skills, etc."
      ])

      const response = await result.response
      const extractedText = response.text()
      
      if (extractedText && extractedText.trim().length > 50) {
        console.log("✅ PDF extracted successfully using Gemini 2.5 Flash")
        return NextResponse.json({ 
          text: extractedText,
          success: true,
          method: 'gemini-2.5-flash'
        })
      }
    } catch (geminiErr) {
      console.error("Gemini PDF extraction failed:", geminiErr)
    }

    // Method 2: Use Tesseract OCR for scanned/image PDFs
    console.log("📄 Attempting OCR extraction with Tesseract...")
    
    let tempDir = null
    try {
      const { createWorker } = await import('tesseract.js')
      const { fromBuffer } = await import('pdf2pic')
      
      // Create temporary directory for PDF conversion
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-extract-'))
      const pdfPath = path.join(tempDir, 'input.pdf')
      await fs.writeFile(pdfPath, buffer)

      // Convert PDF pages to images
      const options = {
        density: 200,
        saveFilename: "page",
        savePath: tempDir,
        format: "png",
        width: 2000,
        height: 2000
      }

      const convert = fromBuffer(buffer, options)
      
      // Initialize Tesseract worker without custom paths (use defaults)
      const worker = await createWorker('eng')
      
      let ocrText = ''
      let pageNum = 1
      let hasMorePages = true

      // Process each page
      while (hasMorePages && pageNum <= 10) { // Limit to 10 pages for performance
        try {
          const pageResult = await convert(pageNum, { responseType: "image" })
          
          if (pageResult && pageResult.path) {
            console.log(`Processing page ${pageNum}...`)
            const { data: { text } } = await worker.recognize(pageResult.path)
            ocrText += `\n--- Page ${pageNum} ---\n${text}\n`
            pageNum++
          } else {
            hasMorePages = false
          }
        } catch (pageErr) {
          // No more pages
          hasMorePages = false
        }
      }

      await worker.terminate()

      // Clean up temp files
      if (tempDir) {
        await fs.rm(tempDir, { recursive: true, force: true })
      }

      if (ocrText.trim().length > 50) {
        console.log("✅ PDF extracted successfully using Tesseract OCR")
        return NextResponse.json({
          text: ocrText,
          success: true,
          method: 'tesseract-ocr',
          pages: pageNum - 1
        })
      }
    } catch (ocrErr) {
      console.error('Tesseract OCR extraction failed:', ocrErr)
      // Clean up temp files on error
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true })
        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr)
        }
      }
    }

    return NextResponse.json({ 
      error: "Failed to extract text from PDF. The PDF might be empty, corrupted, or in an unsupported format. Please try pasting the text manually instead." 
    }, { status: 500 })

  } catch (error) {
    console.error("PDF extraction error:", error)
    return NextResponse.json({ 
      error: "An error occurred while processing the PDF: " + error.message 
    }, { status: 500 })
  }
}
