import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
import { PDFDocument, rgb } from 'pdf-lib'
import { fromPath } from 'pdf2pic'
import sharp from 'sharp'
import OpenAI from 'openai'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.static(path.join(__dirname, '../client')))

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
})

// Store for PDF processing results
const pdfStore = new Map()

// Helper function to extract images from PDF
async function extractImagesFromPDF(pdfPath, pdfId) {
  try {
    const options = {
      density: 150,
      saveFilename: `page`,
      savePath: path.join(__dirname, '../uploads', pdfId),
      format: 'png',
      width: 800,
      height: 1200
    }

    if (!fs.existsSync(options.savePath)) {
      fs.mkdirSync(options.savePath, { recursive: true })
    }

    const convert = fromPath(pdfPath, options)
    const results = await convert.bulk(-1)
    
    return results.map(result => `/api/images/${pdfId}/${result.name}`)
  } catch (error) {
    console.error('Error extracting images:', error)
    return []
  }
}

// Helper function to generate similar image using AI
async function generateSimilarImage(description, originalImagePath) {
  try {
    if (!openai.apiKey) {
      console.warn('OpenAI API key not configured, skipping image generation')
      return null
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a professional image similar to this description: ${description}. Make it suitable for business documentation, clean and modern style.`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    })

    return response.data[0].url
  } catch (error) {
    console.error('Error generating image:', error)
    return null
  }
}

// Routes

// Upload and process PDF
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' })
    }

    const pdfId = Date.now().toString()
    const pdfPath = req.file.path
    const pdfBuffer = fs.readFileSync(pdfPath)

    // Parse PDF for text content
    let pdfText = ''
    try {
      // Try to extract text using pdf-lib first
      const existingPdfBytes = fs.readFileSync(pdfPath)
      const tempPdfDoc = await PDFDocument.load(existingPdfBytes)
      pdfText = `PDF processed successfully with ${tempPdfDoc.getPageCount()} pages`
    } catch (error) {
      console.warn('Could not extract text from PDF:', error.message)
      pdfText = 'Text extraction not available'
    }
    
    // Load PDF for page count
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pageCount = pdfDoc.getPageCount()

    // Extract images as page screenshots
    const images = await extractImagesFromPDF(pdfPath, pdfId)

    const result = {
      id: pdfId,
      filename: req.file.originalname,
      url: `/api/pdf/${pdfId}`,
      pages: pageCount,
      text: pdfText,
      images,
      metadata: {}
    }

    // Store PDF data for later processing
    pdfStore.set(pdfId, {
      ...result,
      filePath: pdfPath,
      buffer: pdfBuffer,
      originalText: pdfText
    })

    res.json(result)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Failed to process PDF' })
  }
})

// Serve PDF files
app.get('/api/pdf/:id', (req, res) => {
  const pdfData = pdfStore.get(req.params.id)
  if (!pdfData) {
    return res.status(404).json({ error: 'PDF not found' })
  }

  res.setHeader('Content-Type', 'application/pdf')
  res.sendFile(path.resolve(pdfData.filePath))
})

// Serve extracted images
app.get('/api/images/:pdfId/:imageName', (req, res) => {
  const imagePath = path.join(__dirname, '../uploads', req.params.pdfId, req.params.imageName)
  if (fs.existsSync(imagePath)) {
    res.sendFile(path.resolve(imagePath))
  } else {
    res.status(404).json({ error: 'Image not found' })
  }
})

// Rebrand PDF
app.post('/api/rebrand', upload.single('logo'), async (req, res) => {
  try {
    const { pdfId, companyName, primaryColor, secondaryColor, fontFamily, textReplacements, generateSimilarImages, aiPrompt } = req.body
    
    const pdfData = pdfStore.get(pdfId)
    if (!pdfData) {
      return res.status(404).json({ error: 'PDF not found' })
    }

    // Load the original PDF
    const pdfDoc = await PDFDocument.load(pdfData.buffer)
    
    // Parse colors
    const primaryRgb = hexToRgb(primaryColor || '#1976d2')
    const secondaryRgb = hexToRgb(secondaryColor || '#dc004e')

    // Process text replacements
    let modifiedText = pdfData.originalText || ''
    if (textReplacements) {
      const replacements = typeof textReplacements === 'string' 
        ? JSON.parse(textReplacements) 
        : textReplacements
      
      Object.entries(replacements).forEach(([oldText, newText]) => {
        modifiedText = modifiedText.replace(new RegExp(oldText, 'g'), newText)
      })
    }

    // For this MVP, we'll create a new PDF with rebranded content
    // In a full implementation, this would involve more sophisticated PDF manipulation
    
    const pages = pdfDoc.getPages()
    
    // Add watermark or branding elements to each page
    pages.forEach((page, index) => {
      const { width, height } = page.getSize()
      
      // Add company name if provided
      if (companyName) {
        page.drawText(companyName, {
          x: 50,
          y: height - 50,
          size: 12,
          color: rgb(primaryRgb.r / 255, primaryRgb.g / 255, primaryRgb.b / 255),
        })
      }
      
      // Add a colored header bar
      page.drawRectangle({
        x: 0,
        y: height - 30,
        width: width,
        height: 30,
        color: rgb(primaryRgb.r / 255, primaryRgb.g / 255, primaryRgb.b / 255),
        opacity: 0.1
      })
    })

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save()
    
    // Generate filename for the rebranded PDF
    const rebrandedFilename = `rebranded-${pdfId}.pdf`
    const rebrandedPath = path.join(__dirname, '../uploads', rebrandedFilename)
    
    fs.writeFileSync(rebrandedPath, modifiedPdfBytes)

    // Send the rebranded PDF
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${rebrandedFilename}"`)
    res.send(Buffer.from(modifiedPdfBytes))

  } catch (error) {
    console.error('Rebrand error:', error)
    res.status(500).json({ error: 'Failed to rebrand PDF' })
  }
})

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 25, g: 118, b: 210 } // Default blue
}

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'))
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`OpenAI API configured: ${!!process.env.OPENAI_API_KEY}`)
})