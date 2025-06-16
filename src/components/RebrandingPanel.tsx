import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  Input,
  InputLabel,
  FormControl,
  Paper,
  Divider
} from '@mui/material'
import { AutoFixHigh, Image, Palette } from '@mui/icons-material'
import { RebrandOptions } from '../types'

interface RebrandingPanelProps {
  onRebrand: (options: RebrandOptions) => void
  disabled?: boolean
}

const RebrandingPanel: React.FC<RebrandingPanelProps> = ({ onRebrand, disabled }) => {
  const [companyName, setCompanyName] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#1976d2')
  const [secondaryColor, setSecondaryColor] = useState('#dc004e')
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif')
  const [generateSimilarImages, setGenerateSimilarImages] = useState(true)
  const [aiPrompt, setAiPrompt] = useState('')
  const [textReplacements, setTextReplacements] = useState('')

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogo(file)
    }
  }

  const handleSubmit = () => {
    const replacements: { [key: string]: string } = {}
    
    // Parse text replacements
    if (textReplacements) {
      textReplacements.split('\n').forEach(line => {
        const [original, replacement] = line.split('->').map(s => s.trim())
        if (original && replacement) {
          replacements[original] = replacement
        }
      })
    }

    const options: RebrandOptions = {
      companyName: companyName || undefined,
      logo: logo || undefined,
      primaryColor,
      secondaryColor,
      fontFamily,
      generateSimilarImages,
      aiPrompt: aiPrompt || undefined,
      textReplacements: Object.keys(replacements).length > 0 ? replacements : undefined
    }

    onRebrand(options)
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Company Branding */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Palette sx={{ mr: 1 }} />
              <Typography variant="h6">Company Branding</Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Enter your company name to replace existing company references"
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink>Company Logo</InputLabel>
              <Input
                type="file"
                inputProps={{ accept: 'image/*' }}
                onChange={handleLogoUpload}
              />
              {logo && (
                <Typography variant="caption" color="text.secondary">
                  Selected: {logo.name}
                </Typography>
              )}
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Font Family"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              sx={{ mt: 2 }}
              helperText="CSS font family (e.g., 'Helvetica, Arial, sans-serif')"
            />
          </Paper>
        </Grid>

        {/* AI Options */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AutoFixHigh sx={{ mr: 1 }} />
              <Typography variant="h6">AI Enhancement</Typography>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={generateSimilarImages}
                  onChange={(e) => setGenerateSimilarImages(e.target.checked)}
                />
              }
              label="Generate similar images with AI"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="AI Rebranding Prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe how you want the document to be rebranded (e.g., 'Make it more modern and professional, use blue color scheme, replace all images with tech-related imagery')"
              helperText="Optional: Provide specific instructions for AI-powered rebranding"
            />
          </Paper>
        </Grid>

        {/* Text Replacements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Text Replacements
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Text Replacements"
              value={textReplacements}
              onChange={(e) => setTextReplacements(e.target.value)}
              placeholder="Old Company Name -> New Company Name&#10;Old Product -> New Product&#10;support@oldcompany.com -> support@newcompany.com"
              helperText="Enter text replacements, one per line in format: 'old text -> new text'"
            />
          </Paper>
        </Grid>

        {/* Action Button */}
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={disabled}
              startIcon={<AutoFixHigh />}
              sx={{ px: 4, py: 1.5 }}
            >
              Rebrand PDF
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default RebrandingPanel