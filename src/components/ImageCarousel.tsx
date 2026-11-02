import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Pause,
  Play,
} from 'lucide-react';
import { CarouselSlide, PRODUCT_IMAGES } from '../types';

interface ImageCarouselProps {
  slides?: CarouselSlide[];
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  slides = PRODUCT_IMAGES,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);
  const thumbsContainerRef = useRef<HTMLDivElement | null>(null);

  const totalSlides = slides.length;

  const goToSlide = useCallback(
    (index: number) => {
      const next = ((index % totalSlides) + totalSlides) % totalSlides;
      setCurrentIndex(next);
    },
    [totalSlides]
  );

  const handleNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (!isAutoPlaying || isHovered || lightboxOpen) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, lightboxOpen, handleNext]);

  // Keep active thumbnail visible in horizontal strip
  useEffect(() => {
    const container = thumbsContainerRef.current;
    if (!container) return;
    const activeThumb = container.children[currentIndex] as HTMLElement | undefined;
    if (activeThumb) {
      const containerLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const thumbLeft = activeThumb.offsetLeft;
      const thumbWidth = activeThumb.clientWidth;

      if (thumbLeft < containerLeft) {
        container.scrollTo({ left: thumbLeft - 12, behavior: 'smooth' });
      } else if (thumbLeft + thumbWidth > containerLeft + containerWidth) {
        container.scrollTo({
          left: thumbLeft + thumbWidth - containerWidth + 12,
          behavior: 'smooth',
        });
      }
    }
  }, [currentIndex]);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, handleNext, handlePrev]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="w-full select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Carousel Viewport */}
      <div
        className="relative w-full aspect-square sm:aspect-[4/3.6] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm group"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides Track */}
        <div
          className="flex w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="w-full h-full shrink-0 relative flex items-center justify-center bg-slate-950"
            >
              {!imageErrors[slide.id] ? (
                <img
                  src={slide.src}
                  alt={slide.title}
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  onError={() =>
                    setImageErrors((prev) => ({ ...prev, [slide.id]: true }))
                  }
                  onClick={() => setLightboxOpen(true)}
                  className="w-full h-full object-contain sm:object-cover cursor-zoom-in"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white">
                  <p className="text-lg font-display font-bold">{slide.title}</p>
                  <p className="text-sm text-slate-300 mt-1">{slide.subtitle}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Top Left Slide Counter & Tag */}
        <div className="absolute top-3.5 left-3.5 right-14 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-700/95 backdrop-blur-sm text-white text-xs sm:text-sm font-display font-bold tracking-wide shadow-sm">
            <span>{currentSlide.tag}</span>
            <span className="text-blue-200" aria-hidden="true">
              ·
            </span>
            <span className="font-mono-num text-xs text-blue-100">
              {currentIndex + 1}/{totalSlides}
            </span>
          </div>
        </div>

        {/* Top Right Controls: AutoPlay + Lightbox Zoom */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            title={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
            aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
            className="w-9 h-9 rounded-lg bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            title="View full size image"
            aria-label="View full size image"
            className="w-9 h-9 rounded-lg bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Previous / Next Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous product image"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next product image"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Scrim & Active Image Caption */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-10 pb-3.5 px-4 pointer-events-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <p className="text-white font-display font-bold text-sm sm:text-base leading-snug">
                {currentSlide.title}
              </p>
              <p className="text-slate-200 text-xs sm:text-sm line-clamp-1">
                {currentSlide.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Thumbnail Strip for All 9 Product Images */}
      <div
        ref={thumbsContainerRef}
        className="mt-3 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin"
      >
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Show image ${idx + 1}: ${slide.title}`}
              className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-blue-600 ring-2 ring-blue-600/20 scale-[1.02]'
                  : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
              }`}
            >
              <img
                src={slide.src}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute bottom-1 right-1 px-1 rounded text-[10px] font-mono-num font-semibold ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-black/60 text-white'
                }`}
              >
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Inspection Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white mb-3 px-1">
              <div>
                <span className="text-xs font-mono-num text-blue-300">
                  Image {currentIndex + 1} of {totalSlides}
                </span>
                <h4 className="text-base sm:text-lg font-display font-bold">
                  {currentSlide.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close fullscreen view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full max-h-[75vh] flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden border border-white/10">
              <img
                src={currentSlide.src}
                alt={currentSlide.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain"
              />

              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <p className="text-slate-300 text-sm mt-3 text-center">
              {currentSlide.subtitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
