import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { PublicVideoItem } from '../types';

interface ProtectedVideoPlayerProps {
  videos: PublicVideoItem[];
  onOrderNowClick?: () => void;
}

export const ProtectedVideoPlayer: React.FC<ProtectedVideoPlayerProps> = ({
  videos,
}) => {
  const safeVideos: PublicVideoItem[] =
    videos && videos.length > 0
      ? videos
      : [
          {
            id: 'vid-1',
            title: 'Live Mist & Cooling Inspection #1',
            streamUrl: './assets/aistudio/demo_video_1.mp4',
            embedType: 'mp4',
          },
          {
            id: 'vid-2',
            title: 'Rechargeable Mist Fan Demo #2',
            streamUrl: './assets/aistudio/demo_video_2.mp4',
            embedType: 'mp4',
          },
        ];

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [hasActivatedVideo, setHasActivatedVideo] = useState<boolean>(false);
  const [fallbackMap, setFallbackMap] = useState<Record<string, string>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentVideo = safeVideos[activeIndex] || safeVideos[0];
  const resolvedStreamUrl =
    fallbackMap[currentVideo.id] || currentVideo.streamUrl;

  const posterImage =
    activeIndex % 2 === 0
      ? './assets/aistudio/2d00e22190f652d3f176e4ab6f8b7b61_91d885f9.jpeg'
      : './assets/aistudio/710a65b7b528469c3d8ffb6d3c4c4e57_e783070b.jpeg';

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    if (hasActivatedVideo && videoRef.current) {
      videoRef.current.load();
    }
  }, [activeIndex, resolvedStreamUrl, hasActivatedVideo]);

  const handleVideoError = () => {
    // If /api/videos/stream/vid-X fails (e.g. on static GitHub Pages), seamlessly switch to cached local asset
    if (fallbackMap[currentVideo.id]) return;
    if (currentVideo.id === 'vid-1') {
      setFallbackMap((prev) => ({
        ...prev,
        'vid-1': './assets/aistudio/demo_video_1.mp4',
      }));
    } else if (currentVideo.id === 'vid-2') {
      setFallbackMap((prev) => ({
        ...prev,
        'vid-2': './assets/aistudio/demo_video_2.mp4',
      }));
    }
  };

  const togglePlay = () => {
    if (!hasActivatedVideo) {
      setHasActivatedVideo(true);
      setIsPlaying(true);
      return;
    }
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsPlaying(true)).catch(() => {
        // Fallback if browser requires muted playback first
        vid.muted = true;
        setIsMuted(true);
        vid.play().then(() => setIsPlaying(true)).catch(() => {});
      });
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    setProgress((vid.currentTime / vid.duration) * 100);
  };

  const handleSelectVideo = (idx: number) => {
    const next = ((idx % safeVideos.length) + safeVideos.length) % safeVideos.length;
    setActiveIndex(next);
  };

  return (
    <div
      className="w-full flex flex-col items-center select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Multi-Video Selector Tabs (shown when multiple videos exist) */}
      {safeVideos.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {safeVideos.map((vid, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => handleSelectVideo(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-display font-bold transition-all cursor-pointer border ${
                  active
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Video {idx + 1}: {vid.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Protected Vertical 9:16 Video Frame */}
      <div
        className="w-full max-w-sm aspect-[9/16] rounded-3xl border border-slate-200 bg-slate-950 shadow-sm overflow-hidden flex flex-col justify-between relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Top Store Brand Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-slate-100 bg-white/95 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-700 text-white font-display font-extrabold text-[10px] flex flex-col items-center justify-center leading-none">
              <span>SHITTU</span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-display font-extrabold text-slate-800 leading-tight">
                AIR COOLER FAN
              </p>
              <p className="text-[11px] text-slate-500">
                ShittuStores · Advibe Studios Commerce
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Video</span>
          </div>
        </div>

        {/* Video Stream Surface with Anti-Link / Anti-Download Shield */}
        <div
          className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={togglePlay}
          onContextMenu={(e) => e.preventDefault()}
        >
          {!hasActivatedVideo ? (
            <img
              src={posterImage}
              alt={currentVideo.title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-80 pointer-events-none"
            />
          ) : currentVideo.embedType === 'youtube' ? (
            <div className="relative w-full h-full">
              <iframe
                src={resolvedStreamUrl}
                title={currentVideo.title}
                className="w-full h-full border-0 pointer-events-none"
                allow="autoplay; encrypted-media"
              />
              <div
                className="absolute inset-0 z-10"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              src={resolvedStreamUrl}
              poster={posterImage}
              autoPlay
              playsInline
              loop
              preload="metadata"
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={handleVideoError}
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-cover pointer-events-none"
            />
          )}

          {/* Protective Click Shield & Custom Controls Overlay */}
          <div
            className="absolute inset-0 z-10 flex flex-col justify-between p-4 bg-gradient-to-t from-black/70 via-transparent to-black/15"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Top-Right Mute/Unmute Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono-num font-semibold text-white/90 bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded-md">
                {activeIndex + 1} / {safeVideos.length} · Live Inspection
              </span>

              {currentVideo.embedType !== 'youtube' && (
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Center Play Button (Visible when paused) */}
            {!isPlaying && currentVideo.embedType !== 'youtube' && (
              <div className="self-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105">
                  <Play className="w-8 h-8 fill-white ml-0.5" />
                </div>
                <span className="mt-2.5 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-display font-bold backdrop-blur-xs">
                  Tap to Watch Live Demo
                </span>
              </div>
            )}

            {/* Prev / Next Video Arrows if Multiple Videos */}
            {safeVideos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectVideo(activeIndex - 1);
                  }}
                  aria-label="Previous demo video"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectVideo(activeIndex + 1);
                  }}
                  aria-label="Next demo video"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Caption & Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-white font-display font-bold text-xs sm:text-sm leading-snug">
                    {currentVideo.title}
                  </p>
                  <p className="text-slate-200 text-[11px]">
                    5-Jet Ultrasonic Cooling Mist · Real Product Footage
                  </p>
                </div>
                {currentVideo.embedType !== 'youtube' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shrink-0 cursor-pointer"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 fill-white" />
                    )}
                  </button>
                )}
              </div>

              {/* Progress Track */}
              {currentVideo.embedType !== 'youtube' && (
                <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
