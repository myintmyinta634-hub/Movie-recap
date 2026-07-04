import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Volume2, Play, Pause, StopCircle, Loader2, Copy, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TTSVoice {
  id: string;
  name: string;
  gender: "male" | "female";
  engine: "edge-tts" | "gtts";
  language: string;
}

export default function Home() {
  const [movieRecap, setMovieRecap] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("my-MM-NilarNeural");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch available voices
  const { data: voices = [] } = trpc.movieRecap.getVoices.useQuery();

  // Translation mutation
  const translateMutation = trpc.movieRecap.translate.useMutation({
    onSuccess: (data) => {
      setTranslatedText(data.translatedText);
      setError("");
      setSuccessMessage("Translation completed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (err) => {
      setError(err.message || "Translation failed. Please try again.");
      setTranslatedText("");
    },
  });

  // TTS generation mutation
  const ttsMutation = trpc.movieRecap.generateTTS.useMutation({
    onSuccess: (data) => {
      if (audioRef.current) {
        const audioBlob = new Blob([Buffer.from(data.audio, "base64")], { type: data.mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        setAudioGenerated(true);
        setIsPlaying(true);
        setIsPaused(false);
        audioRef.current.play();
        setError("");
        setSuccessMessage("Audio generated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    },
    onError: (err) => {
      setError(err.message || "Audio generation failed. Please try again.");
      setIsPlaying(false);
      setAudioGenerated(false);
    },
  });

  const handleTranslate = () => {
    if (!movieRecap.trim()) {
      setError("Please enter a movie recap first.");
      return;
    }
    setError("");
    translateMutation.mutate({ text: movieRecap });
  };

  const handleGenerateTTS = () => {
    if (!translatedText.trim()) {
      setError("Please translate the movie recap first.");
      return;
    }
    setError("");
    ttsMutation.mutate({
      text: translatedText,
      voiceId: selectedVoiceId,
      speed,
      pitch,
    });
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying && !isPaused) {
      audioRef.current.pause();
      setIsPaused(true);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  };

  const handleCopyTranslation = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setSuccessMessage("Translation copied to clipboard!");
      setTimeout(() => setSuccessMessage(""), 2000);
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const selectedVoice = voices.find((v: TTSVoice) => v.id === selectedVoiceId);
  const maleVoices = voices.filter((v: TTSVoice) => v.gender === "male");
  const femaleVoices = voices.filter((v: TTSVoice) => v.gender === "female");

  // Format time display
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Movie Recap Myanmar</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Translate and synthesize movie recaps to Myanmar AI voice</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input and Translation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Movie Recap Input */}
            <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Movie Recap or Summary
                  </label>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Enter or paste a movie plot summary in any language
                  </p>
                  <Textarea
                    placeholder="Enter your movie recap here... You can paste content in any language."
                    value={movieRecap}
                    onChange={(e) => setMovieRecap(e.target.value)}
                    className="min-h-32 resize-none border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
                <Button
                  onClick={handleTranslate}
                  disabled={translateMutation.isPending || !movieRecap.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 h-10"
                >
                  {translateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Translating to Myanmar...
                    </>
                  ) : (
                    "Translate to Myanmar"
                  )}
                </Button>
              </div>
            </Card>

            {/* Translated Text Display */}
            {translatedText && (
              <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-slate-50 dark:bg-slate-900">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Myanmar Translation
                    </label>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 min-h-24 text-slate-900 dark:text-white text-sm leading-relaxed">
                      {translatedText}
                    </div>
                  </div>
                  <Button
                    onClick={handleCopyTranslation}
                    variant="outline"
                    className="w-full border-slate-300 dark:border-slate-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Translation
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Voice Controls and Player */}
          <div className="space-y-6">
            {/* Voice Selection */}
            <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Select Voice
                  </label>
                  <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                    <SelectTrigger className="border-slate-300 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {femaleVoices.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Female Voices
                          </div>
                          {femaleVoices.map((voice: TTSVoice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name} ({voice.engine === "edge-tts" ? "Native" : "gTTS"})
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {maleVoices.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Male Voices
                          </div>
                          {maleVoices.map((voice: TTSVoice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name} ({voice.engine === "edge-tts" ? "Native" : "gTTS"})
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedVoice && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      {selectedVoice.gender === "female" ? "👩" : "👨"} {selectedVoice.name}
                      {selectedVoice.engine === "gtts" && (
                        <span className="block text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Note: Speed and pitch adjustments not available for this voice
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Speed Control - Only for Edge-TTS */}
            {selectedVoice?.engine === "edge-tts" && (
              <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Speed: {speed.toFixed(1)}x
                    </label>
                    <Slider
                      value={[speed]}
                      onValueChange={(value) => setSpeed(value[0])}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
                      <span>0.5x</span>
                      <span>2.0x</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Pitch Control - Only for Edge-TTS */}
            {selectedVoice?.engine === "edge-tts" && (
              <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Pitch: {pitch > 0 ? "+" : ""}{pitch}Hz
                    </label>
                    <Slider
                      value={[pitch]}
                      onValueChange={(value) => setPitch(value[0])}
                      min={-20}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
                      <span>-20Hz</span>
                      <span>+20Hz</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Generate TTS Button */}
            <Button
              onClick={handleGenerateTTS}
              disabled={ttsMutation.isPending || !translatedText.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2 h-10"
            >
              {ttsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Audio...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Generate Audio
                </>
              )}
            </Button>

            {/* Audio Player - Persistent */}
            {audioGenerated && (
              <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <div className="space-y-4">
                  <audio
                    ref={audioRef}
                    onEnded={() => {
                      setIsPlaying(false);
                      setIsPaused(false);
                    }}
                    onPlay={() => {
                      setIsPlaying(true);
                      setIsPaused(false);
                    }}
                    onPause={() => setIsPaused(true)}
                    onTimeUpdate={() => {
                      if (audioRef.current) {
                        setCurrentTime(audioRef.current.currentTime);
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (audioRef.current) {
                        setDuration(audioRef.current.duration);
                      }
                    }}
                    className="hidden"
                  />

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      onValueChange={handleProgressChange}
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePlayPause}
                      size="sm"
                      className="flex-1 bg-purple-500 hover:bg-purple-600"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleStop}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-purple-300 dark:border-purple-700"
                    >
                      <StopCircle className="w-4 h-4 mr-1" />
                      Stop
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>Movie Recap Myanmar • Powered by Gemini API & Free TTS Engines</p>
          <p className="text-xs mt-2">Uses Edge-TTS and gTTS for high-quality Myanmar voice synthesis</p>
        </div>
      </footer>
    </div>
  );
}
