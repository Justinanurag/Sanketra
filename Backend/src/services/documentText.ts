import mammoth from 'mammoth'
import WordExtractor from 'word-extractor'
import type { Worker } from 'tesseract.js'
import type { PDFParse } from 'pdf-parse'

const MIN_TEXT = 40

let ocrWorker: Promise<Worker> | null = null

async function recognize(image: Buffer) {
  if (!ocrWorker) {
    ocrWorker = import('tesseract.js').then(({ createWorker }) => createWorker('eng'))
  }
  const worker = await ocrWorker
  const result = await worker.recognize(image)
  return result.data.text ?? ''
}

function ensurePdfDom() {
  const target = globalThis as Record<string, unknown>
  if (typeof target.DOMMatrix === 'undefined') target.DOMMatrix = class DOMMatrix {}
  if (typeof target.ImageData === 'undefined') {
    target.ImageData = class ImageData {
      width: number
      height: number
      data: Uint8ClampedArray
      constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.data = new Uint8ClampedArray(width * height * 4)
      }
    }
  }
  if (typeof target.Path2D === 'undefined') target.Path2D = class Path2D {}
}

async function loadPdfParser() {
  ensurePdfDom()
  const loaded = await import('pdf-parse')
  return loaded.PDFParse
}

async function readPdf(data: Buffer) {
  const PDFParser = await loadPdfParser()
  const parser: PDFParse = new PDFParser({ data })
  try {
    const text = (await parser.getText()).text?.trim() ?? ''
    if (text.length >= MIN_TEXT) return text
    try {
      const shots = await parser.getScreenshot({
        partial: [1, 2],
        imageBuffer: true,
        imageDataUrl: false,
        scale: 1.5,
      })
      const pages: string[] = []
      for (const page of shots.pages) {
        if (!page.data?.byteLength) continue
        const recognized = await recognize(Buffer.from(page.data))
        if (recognized.trim()) pages.push(recognized.trim())
      }
      return [text, ...pages].filter(Boolean).join('\n\n').trim()
    } catch {
      return text
    }
  } finally {
    await parser.destroy()
  }
}

export async function readDocument(fileName: string, content: Buffer) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (extension === 'txt') return content.toString('utf8').replace(/^\uFEFF/, '').trim()
  if (extension === 'docx') {
    const result = await mammoth.extractRawText({ buffer: content })
    return result.value.trim()
  }
  if (extension === 'doc') {
    const extracted = await new WordExtractor().extract(content)
    return extracted.getBody().trim()
  }
  if (extension === 'pdf') return readPdf(content)
  if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') return (await recognize(content)).trim()
  throw new Error('Unsupported file type')
}
