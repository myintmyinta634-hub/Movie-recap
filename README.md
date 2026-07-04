# Movie Recap Myanmar TTS Web Application

A sophisticated web application that translates movie recaps into Myanmar language and synthesizes them using free AI voice engines. Built with React 19, Express, tRPC, and integrated with Google Gemini API for translation and Edge-TTS/gTTS for voice synthesis.

## Features

- **Movie Recap Input**: Enter or paste movie plot summaries in any language
- **Gemini API Translation**: Translate content to Myanmar language using Google Gemini API
- **Free Myanmar TTS Voices**: 
  - 2 native Edge-TTS voices (Nilar - Female, Thiha - Male)
  - 1 gTTS fallback voice for Myanmar
- **Voice Controls**:
  - Voice selector with gender-based grouping
  - Speed control (0.5x - 2.0x) for Edge-TTS voices
  - Pitch control (-20Hz to +20Hz) for Edge-TTS voices
- **Audio Playback**: Persistent audio player with progress bar, play/pause/stop controls
- **Elegant UI**: Modern, responsive design with smooth interactions and refined typography
- **Error Handling**: Clear error messaging for missing or invalid configuration

## Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui components
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **TTS Engines**: Edge-TTS (primary), gTTS (fallback)
- **Translation**: Google Gemini API
- **Containerization**: Docker
- **Deployment**: Railway, Render

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker (for containerized deployment)
- Google Gemini API key
- MySQL/TiDB database connection string

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=mysql://user:password@host:port/database

# Optional (auto-configured by Manus platform)
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
```

## Installation

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/myintmyinta634-hub/Movie-recap.git
   cd Movie-recap
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

### Docker Development

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

   The application will be available at `http://localhost:3000`

2. **Stop the container**:
   ```bash
   docker-compose down
   ```

## Deployment

### Railway Deployment

1. **Connect your GitHub repository** to Railway
2. **Set environment variables** in Railway dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `DATABASE_URL`: Your MySQL/TiDB connection string
   - `NODE_ENV`: `production`
3. **Railway will automatically**:
   - Build using the `Dockerfile`
   - Start the application with `pnpm start`
   - Monitor health checks at `/api/health`

### Render Deployment

1. **Connect your GitHub repository** to Render
2. **Create a new Web Service** with:
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
3. **Set environment variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `DATABASE_URL`: Your MySQL/TiDB connection string
   - `NODE_ENV`: `production`
4. **Render will automatically**:
   - Deploy the application
   - Monitor health checks at `/api/health`

## API Endpoints

### tRPC Procedures

All endpoints are under `/api/trpc`:

#### Movie Recap Features

- **`movieRecap.getVoices`** (Query)
  - Returns available Myanmar TTS voices
  - Response: Array of voice objects with id, name, gender, engine, language

- **`movieRecap.translate`** (Mutation)
  - Input: `{ text: string }`
  - Translates text to Myanmar using Gemini API
  - Response: `{ originalText, translatedText, language }`

- **`movieRecap.generateTTS`** (Mutation)
  - Input: `{ text: string, voiceId: string, speed?: number, pitch?: number }`
  - Generates audio from text using selected voice
  - Response: `{ audio: string (base64), mimeType: string }`

#### Health Check

- **`GET /api/health`**
  - Returns `ok` if the service is running
  - Used by deployment platforms for health monitoring

## Project Structure

```
Movie-recap/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities and helpers
│   │   └── index.css         # Global styles
│   └── index.html            # HTML entry point
├── server/                    # Express backend
│   ├── _core/                # Core infrastructure
│   ├── routers.ts            # tRPC procedure definitions
│   ├── tts.ts                # TTS service (Edge-TTS, gTTS)
│   ├── translation.ts        # Gemini translation service
│   └── db.ts                 # Database helpers
├── drizzle/                   # Database schema and migrations
├── Dockerfile                 # Docker image configuration
├── docker-compose.yml         # Local development setup
├── railway.json               # Railway deployment config
├── render.yaml                # Render deployment config
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Development Workflow

### Adding Features

1. **Update database schema** (if needed):
   ```bash
   # Edit drizzle/schema.ts
   pnpm drizzle-kit generate
   # Apply migration via webdev_execute_sql
   ```

2. **Add tRPC procedures** in `server/routers.ts`:
   ```typescript
   myFeature: publicProcedure
     .input(z.object({ /* ... */ }))
     .query(async ({ input }) => {
       // Implementation
     }),
   ```

3. **Build frontend** in `client/src/pages/`:
   ```typescript
   const { data } = trpc.myFeature.useQuery(params);
   ```

4. **Write tests** in `server/*.test.ts`:
   ```bash
   pnpm test
   ```

## Troubleshooting

### Missing GEMINI_API_KEY

If you see an error about missing `GEMINI_API_KEY`:
1. Obtain a free API key from [https://ai.google.dev/](https://ai.google.dev/)
2. Add it to your `.env` file or environment variables
3. Restart the application

### TTS Generation Fails

- **Edge-TTS fails**: The application automatically falls back to gTTS
- **Both fail**: Check your internet connection and API rate limits
- **Voice not found**: Ensure the selected voice ID is valid (use `movieRecap.getVoices` to list available voices)

### Database Connection Issues

- Verify `DATABASE_URL` is correct and the database is accessible
- Check network connectivity to the database server
- Ensure the database user has proper permissions

## Performance Optimization

- **Voice caching**: Generated audio is cached in the browser
- **Lazy loading**: UI components are loaded on demand
- **Optimized TTS**: Edge-TTS is preferred for better quality; gTTS is fallback
- **Responsive design**: Mobile-first approach with optimized breakpoints

## Security Considerations

- **GEMINI_API_KEY**: Never commit API keys to version control
- **Environment variables**: Use secure secret management in production
- **CORS**: Configured for safe cross-origin requests
- **Input validation**: All user inputs are validated with Zod schemas

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub: [https://github.com/myintmyinta634-hub/Movie-recap/issues](https://github.com/myintmyinta634-hub/Movie-recap/issues)
- Check existing documentation in the `references/` folder

## Acknowledgments

- **Edge-TTS**: Microsoft Edge's text-to-speech service
- **gTTS**: Google Text-to-Speech
- **Gemini API**: Google's generative AI platform
- **shadcn/ui**: Beautiful React components
- **Tailwind CSS**: Utility-first CSS framework

---

**Built with ❤️ by Manus AI**
