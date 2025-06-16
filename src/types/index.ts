export interface PDFData {
  id: string
  filename: string
  url: string
  pages: number
  text?: string
  images?: string[]
  metadata?: {
    title?: string
    author?: string
    subject?: string
    creator?: string
  }
}

export interface RebrandOptions {
  companyName?: string
  logo?: File
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  textReplacements?: { [key: string]: string }
  generateSimilarImages?: boolean
  aiPrompt?: string
}