"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { AshokChakra } from "./independence-day-banner";

const SLIDES = [
  {
    src: "/images/15aug1.jpeg",
    alt: "Independence Day Celebration 1",
    quote: "“Freedom is not given — it is won.”",
    author: "— A. Philip Randolph",
  },
  {
    src: "/images/15aug2.jpeg",
    alt: "Independence Day Celebration 2",
    quote: "“Let new India arise out of peasants’ cottages, grasping the plough.”",
    author: "— Swami Vivekananda",
  },
  {
    src: "/images/15aug3.jpeg",
    alt: "Independence Day Celebration 3",
    quote:
      "“You must be the change you wish to see in the world.”",
    author: "— Mahatma Gandhi",
  },
  {
    src: "/images/15aug4.jpeg",
    alt: "Independence Day Celebration 4",
    quote:
      "“Education is the most powerful weapon which you can use to change the world.”",
    author: "— Nelson Mandela",
  },
  {
    src: "/images/15aug5.jpeg",
    alt: "Independence Day Celebration 5",
    quote: "“Sare Jahan Se Accha, Hindustan Hamara.”",
    author: "— Muhammad Iqbal",
  },
];

const AUTO_SLIDE_INTERVAL = 5000;

export function IndependenceDayCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<number>(0);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning],
  );

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length);
  }, [current, goTo]);

  // Auto-slide
  useEffect(() => {
    timeoutRef.current = setTimeout(next, AUTO_SLIDE_INTERVAL);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, next]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  return (
    <section
      className="relative w-full h-[92vh] overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Independence Day Image Carousel"
    >
      {/* ── Slides ── */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-all duration-[800ms] ease-in-out"
          style={{
            opacity: current === i ? 1 : 0,
            transform: current === i ? "scale(1)" : "scale(1.08)",
            zIndex: current === i ? 10 : 0,
          }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      {/* ── Cinematic Overlay ── */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Dark gradient from bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        {/* Tricolor side glow accents */}
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#FF9933] via-white to-[#138808] opacity-80" />
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[#FF9933] via-white to-[#138808] opacity-80" />
        {/* Tricolor top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      </div>

      {/* ── Central Content ── */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-16 sm:pb-20 px-4 sm:px-8 text-center">
        {/* Ashok Chakra badge */}
        <div className="mb-4 sm:mb-6 animate-[spin_20s_linear_infinite]">
          <AshokChakra
            className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]"
            size={100}
          />
        </div>

        {/* Badge */}
        <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-amber-200 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
          <span>🇮🇳</span>
          <span>15th August 2026 • 80th Independence Day</span>
          <span>🇮🇳</span>
        </div>

        {/* Heading */}
        <h2
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-white to-[#138808] uppercase tracking-tight leading-tight drop-shadow-lg transition-all duration-700"
          key={`heading-${current}`}
          style={{
            animation: "fadeSlideUp 0.8s ease-out both",
          }}
        >
          Happy Independence Day!
        </h2>

        {/* Quote */}
        <p
          className="mt-3 sm:mt-5 max-w-2xl text-sm sm:text-lg text-white/90 font-light italic leading-relaxed transition-all duration-700"
          key={`quote-${current}`}
          style={{
            animation: "fadeSlideUp 0.8s ease-out 0.15s both",
          }}
        >
          {SLIDES[current].quote}
          <span className="block text-[10px] sm:text-xs text-amber-300/80 mt-1 not-italic font-semibold tracking-wider">
            {SLIDES[current].author}
          </span>
        </p>

        {/* College Wishes */}
        <div
          className="mt-5 sm:mt-7 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 max-w-lg"
          style={{
            animation: "fadeSlideUp 0.8s ease-out 0.3s both",
          }}
          key={`wish-${current}`}
        >
          <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
            Warm wishes to all students, faculty & staff on this historic day.
            <br />
            Let us honour the sacrifices of our freedom fighters and pledge
            to build a better tomorrow.
          </p>
          <p className="mt-2 text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-[0.15em]">
            — Sant Sandhya Das Mahila College, Barh
          </p>
        </div>
      </div>

      {/* ── Navigation Arrows ── */}
      <button
        onClick={prev}
        disabled={isTransitioning}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 transition-all duration-300 hover:scale-110 disabled:opacity-50"
        aria-label="Previous slide"
        type="button"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={next}
        disabled={isTransitioning}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 transition-all duration-300 hover:scale-110 disabled:opacity-50"
        aria-label="Next slide"
        type="button"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* ── Dot Indicators ── */}
      <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3">
        {SLIDES.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            type="button"
            className="group relative"
          >
            <span
              className={`block rounded-full transition-all duration-500 ${
                current === i
                  ? "w-8 sm:w-10 h-2 sm:h-2.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                  : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          </button>
        ))}
      </div>

      {/* ── Progress Bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-40 h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"
          style={{
            animation: `progressFill ${AUTO_SLIDE_INTERVAL}ms linear`,
            animationIterationCount: 1,
          }}
          key={`progress-${current}`}
        />
      </div>

      {/* ── Keyframe Animations ── */}
      <style>{`
        @keyframes fadeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes progressFill {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
