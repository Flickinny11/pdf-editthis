# PDF Editor & Recreator

A professional AI-powered PDF editor and recreator tool that allows you to upload PDF documents, analyze their content, and rebrand them with your company's identity.

## Features

- **PDF Upload & Analysis**: Upload PDF files and extract text, images, and metadata
- **Real-time PDF Preview**: View PDFs directly in the browser with page navigation
- **AI-Powered Rebranding**: Automatically rebrand PDFs with company logos, colors, and text
- **Image Generation**: Generate similar images using AI (DALL-E integration)
- **Text Replacement**: Bulk text replacement for company names, emails, etc.
- **Color Customization**: Apply custom color schemes throughout the document
- **Production Ready**: Built for macOS Sequoia 15.3.2 with full production deployment

## Technology Stack

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express
- **PDF Processing**: PDF-lib, pdf-parse, pdf2pic
- **AI Integration**: OpenAI API (GPT-4, DALL-E)
- **Build System**: Vite
- **File Handling**: Multer + Sharp

## Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI features)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pdf-editthis
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Development

Run the development server:
```bash
npm run dev
```

This will start:
- Frontend server on http://localhost:3000
- Backend API server on http://localhost:3001

## Production Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Usage

1. **Upload PDF**: Drag and drop or select a PDF file
2. **Review Analysis**: View extracted text, images, and metadata
3. **Configure Rebranding**: 
   - Enter company name
   - Upload company logo
   - Select primary and secondary colors
   - Add text replacements
   - Configure AI options
4. **Generate Rebranded PDF**: Click "Rebrand PDF" to process
5. **Download**: Download the rebranded PDF file

## API Endpoints

- `POST /api/upload` - Upload and analyze PDF
- `GET /api/pdf/:id` - Serve PDF files
- `GET /api/images/:pdfId/:imageName` - Serve extracted images
- `POST /api/rebrand` - Process PDF rebranding

## Configuration

### OpenAI Integration

To enable AI features, you need an OpenAI API key:

1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env` file

### GitHub Copilot Integration

The application is designed to work with GitHub Copilot subscriptions for enhanced AI capabilities.

## File Structure

```
pdf-editthis/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── types/             # TypeScript type definitions
│   └── main.tsx           # Application entry point
├── server/                # Node.js backend
│   └── index.js          # Express server
├── public/               # Static assets
├── dist/                 # Build output
└── uploads/              # Uploaded files (gitignored)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and support, please create an issue in the repository.