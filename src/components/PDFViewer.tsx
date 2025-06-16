import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Box, Button, Typography, IconButton } from '@mui/material'
import { NavigateBefore, NavigateNext } from '@mui/icons-material'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFViewerProps {
  pdfUrl: string
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error)
    setLoading(false)
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  return (
    <Box sx={{ width: '100%', maxHeight: 600, overflow: 'auto' }}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography>Loading PDF...</Typography>
          </Box>
        }
        error={
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography color="error">Failed to load PDF</Typography>
          </Box>
        }
      >
        <Page
          pageNumber={pageNumber}
          width={Math.min(500, window.innerWidth * 0.4)}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>

      {!loading && numPages > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          mt: 2, 
          gap: 1 
        }}>
          <IconButton 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1}
            size="small"
          >
            <NavigateBefore />
          </IconButton>
          
          <Typography variant="body2">
            Page {pageNumber} of {numPages}
          </Typography>
          
          <IconButton 
            onClick={goToNextPage} 
            disabled={pageNumber >= numPages}
            size="small"
          >
            <NavigateNext />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}

export default PDFViewer