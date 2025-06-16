import React, { useState } from 'react'
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Alert,
  CircularProgress
} from '@mui/material'
import { CloudUpload, AutoFixHigh, Download } from '@mui/icons-material'
import FileUpload from './components/FileUpload'
import PDFViewer from './components/PDFViewer'
import RebrandingPanel from './components/RebrandingPanel'
import { PDFData } from './types'

function App() {
  const [pdfData, setPdfData] = useState<PDFData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rebrandedPdf, setRebrandedPdf] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload PDF')
      }
      
      const data = await response.json()
      setPdfData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRebrand = async (rebrandOptions: any) => {
    if (!pdfData) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/rebrand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pdfId: pdfData.id,
          ...rebrandOptions
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to rebrand PDF')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setRebrandedPdf(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rebranding failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (rebrandedPdf) {
      const a = document.createElement('a')
      a.href = rebrandedPdf
      a.download = 'rebranded_document.pdf'
      a.click()
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <AutoFixHigh sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PDF Editor & Recreator
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Upload PDF
              </Typography>
              <FileUpload onFileUpload={handleFileUpload} disabled={loading} />
              
              {pdfData && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Document Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pages: {pdfData.pages}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Images found: {pdfData.images?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Text extracted: {pdfData.text ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                PDF Preview
              </Typography>
              {pdfData ? (
                <PDFViewer pdfUrl={pdfData.url} />
              ) : (
                <Box
                  sx={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    borderRadius: 1
                  }}
                >
                  <Typography color="text.secondary">
                    Upload a PDF to see preview
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {pdfData && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Rebranding Options
                </Typography>
                <RebrandingPanel
                  onRebrand={handleRebrand}
                  disabled={loading}
                />
                
                {rebrandedPdf && (
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={handleDownload}
                      size="large"
                    >
                      Download Rebranded PDF
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  )
}

export default App