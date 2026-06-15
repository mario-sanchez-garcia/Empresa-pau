"use client";
import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";

export interface SmoothScrollHeroProps {
  /** Height of the scroll section in pixels @default 1500 */
  scrollHeight?: number;
  /** Background image URL for desktop @default Unsplash landscape */
  desktopImage?: string;
  /** Background image URL for mobile @default Unsplash portrait */
  mobileImage?: string;
  /** Initial clip path percentage @default 25 */
  initialClipPercentage?: number;
  /** Final clip path percentage @default 75 */
  finalClipPercentage?: number;
  /** Content rendered in a sticky overlay on top of the background */
  children?: React.ReactNode;
}

const SmoothScrollHeroBackground: React.FC<Required<Omit<SmoothScrollHeroProps, "children">>> = ({
  scrollHeight,
  desktopImage,
  mobileImage,
  initialClipPercentage,
  finalClipPercentage,
}) => {
  const { scrollY } = useScroll();

  const clipStart = useTransform(
    scrollY,
    [0, scrollHeight],
    [initialClipPercentage, 0],
  );
  const clipEnd = useTransform(
    scrollY,
    [0, scrollHeight],
    [finalClipPercentage, 100],
  );

  const clipPath = useMotionTemplate`polygon(${clipStart}% ${clipStart}%, ${clipEnd}% ${clipStart}%, ${clipEnd}% ${clipEnd}%, ${clipStart}% ${clipEnd}%)`;

  const backgroundSize = useTransform(
    scrollY,
    [0, scrollHeight + 500],
    ["170%", "100%"],
  );

  return (
    <motion.div
      className="sticky top-0 h-screen w-full bg-slate-950"
      style={{ clipPath, willChange: "transform, opacity" }}
    >
      {/* Mobile background */}
      <motion.div
        className="absolute inset-0 md:hidden"
        style={{
          backgroundImage: `url(${mobileImage})`,
          backgroundSize,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Desktop background */}
      <motion.div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage: `url(${desktopImage})`,
          backgroundSize,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/60" />
    </motion.div>
  );
};

/**
 * Smooth scroll hero with parallax clip-path reveal effect.
 * Pass `children` to render content in a sticky overlay on top of the background.
 */
const SmoothScrollHero: React.FC<SmoothScrollHeroProps> = ({
  scrollHeight = 1500,
  desktopImage = "https://images.unsplash.com/photo-1511884642898-4c92249e20b6",
  mobileImage = "https://images.unsplash.com/photo-1511207538754-e8555f2bc187?q=80&w=2412&auto=format&fit=crop",
  initialClipPercentage = 25,
  finalClipPercentage = 75,
  children,
}) => {
  return (
    <div
      style={{ height: `calc(${scrollHeight}px + 100vh)` }}
      className="relative w-full"
    >
      <SmoothScrollHeroBackground
        scrollHeight={scrollHeight}
        desktopImage={desktopImage}
        mobileImage={mobileImage}
        initialClipPercentage={initialClipPercentage}
        finalClipPercentage={finalClipPercentage}
      />
      {/* Sticky overlay — stacks on top of background via negative margin */}
      {children != null && (
        <div
          className="sticky top-0 h-screen w-full pointer-events-none"
          style={{ marginTop: "-100vh", zIndex: 20 }}
        >
          <div className="pointer-events-auto w-full h-full flex flex-col items-center justify-center px-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmoothScrollHero;
