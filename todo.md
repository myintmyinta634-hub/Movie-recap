# Movie Recap Myanmar TTS Web Application - TODO

## Core Features

- [x] Movie recap input area with paste/enter functionality
- [x] Gemini API translation integration (Myanmar language)
- [x] GEMINI_API_KEY environment variable validation and error handling
- [x] Edge-TTS backend API endpoint (primary TTS engine)
- [x] gTTS fallback backend API endpoint
- [x] Voice selector UI with up to 8 Myanmar voices (2 Edge-TTS + 6 gTTS)
- [x] Voice speed control slider (0.5x - 2.0x)
- [x] Voice pitch control slider
- [x] Audio playback player with controls (play, pause, stop)
- [x] Progress bar for TTS audio playback

## Deployment & Infrastructure

- [x] Docker containerization (Dockerfile)
- [x] docker-compose.yml for local development
- [x] Railway deployment configuration
- [x] Render deployment configuration
- [x] Environment variables setup for deployment
- [x] Health check endpoint
- [x] GitHub repository sync to main branch

## Design & UX

- [x] Elegant and polished UI design
- [x] Refined typography and color scheme
- [x] Smooth interactions and transitions
- [x] Cohesive visual presentation
- [x] Responsive layout for desktop and mobile
- [x] Clear error messaging for missing/invalid GEMINI_API_KEY
- [x] Persistent audio player with progress bar
- [x] Conditional speed/pitch controls (Edge-TTS only)

## Testing & Quality

- [x] Unit tests for Gemini API key validation
- [ ] Integration tests for Gemini API translation
- [ ] Error handling and edge cases
- [ ] Browser compatibility testing

## Documentation

- [ ] README with setup instructions
- [ ] Environment variable documentation
- [ ] Deployment guide for Railway and Render
- [ ] API endpoint documentation
