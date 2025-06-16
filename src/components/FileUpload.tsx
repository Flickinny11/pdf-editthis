import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, Typography, Paper, Button } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  disabled?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0])
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled
  })

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 4,
        textAlign: 'center',
        cursor: disabled ? 'default' : 'pointer',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': disabled ? {} : {
          borderColor: 'primary.main',
          bgcolor: 'action.hover'
        }
      }}
      elevation={isDragActive ? 3 : 1}
    >
      <input {...getInputProps()} />
      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDragActive ? 'Drop the PDF here' : 'Upload PDF Document'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Drag and drop a PDF file here, or click to select
      </Typography>
      <Button variant="outlined" disabled={disabled}>
        Choose File
      </Button>
    </Paper>
  )
}

export default FileUpload