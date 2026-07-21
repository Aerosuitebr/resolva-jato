'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

const VIDEO_SRC = '/videos/resolvajato-final.mp4';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PromoVideoPlayer({
  className,
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [started, setStarted] = useState(false);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (video && !video.paused) setControlsVisible(false);
    }, 2500);
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      setFullscreen(Boolean(document.fullscreenElement || doc.webkitFullscreenElement));
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    const video = videoRef.current;
    const onBeginNative = () => setFullscreen(true);
    const onEndNative = () => setFullscreen(false);
    video?.addEventListener('webkitbeginfullscreen', onBeginNative);
    video?.addEventListener('webkitendfullscreen', onEndNative);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      video?.removeEventListener('webkitbeginfullscreen', onBeginNative);
      video?.removeEventListener('webkitendfullscreen', onEndNative);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setStarted(true);
    } else {
      video.pause();
    }
    showControls();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    showControls();
  }

  function restart() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play();
    setStarted(true);
    showControls();
  }

  async function toggleFullscreen() {
    const container = containerRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void })
      | null;
    const video = videoRef.current as
      | (HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
        })
      | null;
    if (!container || !video) return;

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };

    try {
      if (document.fullscreenElement || doc.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
      } else if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        await container.webkitRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch {
      video.webkitEnterFullscreen?.();
    }
    showControls();
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
    setCurrentTime(video.currentTime);
  }

  function handleSeek(event: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = Number(event.target.value);
    video.currentTime = (pct / 100) * video.duration;
    setProgress(pct);
    showControls();
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-sky-950/50',
        fullscreen ? 'flex items-center justify-center' : 'aspect-video w-full',
        className
      )}
      onMouseMove={showControls}
      onMouseLeave={() => {
        const video = videoRef.current;
        if (video && !video.paused) setControlsVisible(false);
      }}
    >
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        className="h-full w-full object-contain"
        playsInline
        muted={muted}
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onEnded={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />

      {!started ? (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent transition hover:from-slate-950/70"
          aria-label="Reproduzir vídeo"
        >
          <span
            className={cn(
              'grid place-items-center rounded-full bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/30 transition group-hover:scale-105',
              compact ? 'h-14 w-14' : 'h-20 w-20'
            )}
          >
            <Play className={cn(compact ? 'ml-0.5 h-6 w-6' : 'ml-1 h-9 w-9')} fill="currentColor" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/90 sm:text-sm">
            {compact ? 'Ver em 60s' : 'Assistir apresentação'}
          </span>
        </button>
      ) : null}

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-3 pb-2.5 pt-8 transition-opacity duration-300 sm:px-4 sm:pb-3 sm:pt-10',
          controlsVisible || !playing ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={handleSeek}
          aria-label="Progresso do vídeo"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-amber-400 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
        />
        <div className="mt-2 flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
          >
            {playing ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            onClick={restart}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label="Recomeçar"
            title="Recomeçar"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label={muted ? 'Ativar som' : 'Silenciar'}
            title={muted ? 'Ativar som' : 'Silenciar'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <span className="ml-1 text-[11px] font-semibold tabular-nums text-slate-200 sm:text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            title={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Seção full-width opcional (páginas que ainda usam o bloco isolado). */
export function PromoVideoSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#020617_0%,#0f172a_55%,#082f49_100%)] py-16 text-white sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Veja em 60 segundos</p>
          <h2 className="rj-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            O Resolva Jato em ação
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
            Currículo, orçamento e Pix — veja o fluxo antes de criar sua conta.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <PromoVideoPlayer />
        </div>
      </div>
    </section>
  );
}
