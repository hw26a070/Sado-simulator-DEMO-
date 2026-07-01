/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BowlConfig, NatsumeConfig } from '../../types';
import { audio } from '../../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface StepMatchaProps {
  bowl: BowlConfig;
  natsume: NatsumeConfig;
  targetCups: number;
  onComplete: (cupsCount: number) => void;
}

export const StepMatcha: React.FC<StepMatchaProps> = ({
  bowl,
  natsume,
  targetCups,
  onComplete
}) => {
  const [natsumeOpen, setNatsumeOpen] = useState(false);
  const [hasScooped, setHasScooped] = useState(false);
  const [isHoldingChashaku, setIsHoldingChashaku] = useState(false);
  const [cupsCount, setCupsCount] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 150, y: 150 });
  const [message, setMessage] = useState<string>('まずは棗（なつめ）をクリックしてフタを開けましょう。');

  const containerRef = useRef<HTMLDivElement>(null);
  const natsumeRef = useRef<HTMLDivElement>(null);
  const bowlRef = useRef<HTMLDivElement>(null);

  // Mouse move handler when holding Chashaku
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isHoldingChashaku || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isHoldingChashaku || !containerRef.current || e.touches.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isHoldingChashaku]);

  const handleNatsumeClick = () => {
    if (!natsumeOpen) {
      setNatsumeOpen(true);
      audio.playThud();
      setMessage('茶杓（ちゃしゃく）をクリックして手に持ちましょう。');
    }
  };

  const handleChashakuPickup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!natsumeOpen) {
      setMessage('先に棗のフタを開けてくださいね。');
      return;
    }
    setIsHoldingChashaku(true);
    audio.playScoop();
    setMessage('茶杓を棗（抹茶の容器）へ運び、抹茶をすくいましょう。');
  };

  // Hover or click Natsume area to scoop powder
  const handleNatsumeScoop = () => {
    if (isHoldingChashaku && !hasScooped) {
      setHasScooped(true);
      audio.playScoop();
      setMessage('お茶碗の上まで運び、クリックしてお茶の葉を入れましょう。');
    }
  };

  // Click bowl to drop powder
  const handleBowlDrop = () => {
    if (isHoldingChashaku && hasScooped) {
      setCupsCount((prev) => {
        const next = prev + 1;
        audio.playPowderDrop();
        setHasScooped(false);
        setIsHoldingChashaku(false);

        if (next === targetCups) {
          setMessage(`ちょうど${targetCups}杯入りました！「次の工程へ」進みましょう。`);
        } else if (next > targetCups) {
          setMessage(`お茶の葉が${next}杯になりました。少し濃いお味になりそうです。`);
        } else {
          setMessage(`お茶の葉を${next}杯入れました。もう一度茶杓を持って、すくいましょう。`);
        }
        return next;
      });
    }
  };

  return (
    <div
      id="step-matcha-container"
      ref={containerRef}
      className="relative w-full h-[450px] bg-[#f2ebd9] border border-[#d6cbaf] rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4 cursor-default select-none"
    >
      {/* Dynamic guidance header */}
      <div className="bg-white/80 backdrop-blur-xs border border-stone-200 rounded-lg px-4 py-2 text-center text-xs text-stone-700 font-medium">
        {message}
      </div>

      {/* Main tray arena (お盆) */}
      <div className="relative flex-1 w-full flex items-center justify-around px-8">
        {/* Natsume (薄茶器) */}
        <div
          ref={natsumeRef}
          onClick={handleNatsumeClick}
          onMouseEnter={handleNatsumeScoop}
          onTouchStart={handleNatsumeScoop}
          className="relative flex flex-col items-center cursor-pointer group"
          style={{ transform: 'translateY(-20px)' }}
        >
          <div className="text-[11px] font-mono text-stone-500 mb-1">棗 (なつめ)</div>

          {/* Lid container with smooth animation */}
          <div className="relative w-20 h-24 flex flex-col items-center">
            {/* Lid */}
            <motion.div
              animate={natsumeOpen ? { y: -35, x: 25, rotate: 15, opacity: 0.8 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              className="absolute top-0 w-16 h-8 rounded-t-xl z-20 shadow-md border border-stone-800/40"
              style={{ backgroundColor: natsume.color }}
            >
              {/* Gold Accent */}
              <div
                className="absolute bottom-1 w-full h-1"
                style={{ backgroundColor: natsume.accentColor }}
              />
            </motion.div>

            {/* Body */}
            <div
              className="absolute bottom-2 w-16 h-16 rounded-b-2xl shadow-lg border border-stone-800/40 flex items-center justify-center overflow-hidden z-10"
              style={{ backgroundColor: natsume.color }}
            >
              {/* Inner Matcha powder visible when open */}
              <AnimatePresence>
                {natsumeOpen && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-12 h-12 rounded-full bg-emerald-700 border-4 border-emerald-800/60 shadow-inner flex items-center justify-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600/90 filter blur-[2px]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Outside gold detail */}
              {!natsumeOpen && (
                <div
                  className="w-8 h-8 rounded-full border border-dashed opacity-40"
                  style={{ borderColor: natsume.accentColor }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Chashaku (茶杓) placement (when NOT held) */}
        {!isHoldingChashaku && (
          <div
            onClick={handleChashakuPickup}
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-150 p-2 rounded-lg bg-stone-200/40 border border-stone-300/30 z-20 ${
              natsumeOpen && cupsCount < targetCups ? 'animate-pulse border-amber-500/50' : ''
            }`}
          >
            <div className="text-[10px] font-mono text-stone-500 mb-1">茶杓 (ちゃしゃく)</div>
            {/* Beautiful Bamboo Spoon graphic */}
            <div className="relative w-36 h-4 bg-[#ebd4a0] rounded-full border border-[#cca15e] flex items-center justify-start pl-2">
              <div className="w-4 h-3 bg-[#dfbf7f] rounded-l-full border-r border-[#bfa268]" />
              <div className="absolute right-2 w-2 h-2 rounded-full bg-[#ae8640]/50" />
            </div>
          </div>
        )}

        {/* Central Bowl (お茶碗) */}
        <div
          ref={bowlRef}
          onClick={handleBowlDrop}
          className="relative flex flex-col items-center"
        >
          <div className="text-[11px] font-mono text-stone-500 mb-2">お茶碗 ({bowl.name})</div>

          {/* Bowl interactive area */}
          <div
            className={`relative w-44 h-44 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 ${
              isHoldingChashaku && hasScooped ? 'ring-4 ring-amber-500/40 scale-[1.02] cursor-pointer' : ''
            }`}
            style={{
              backgroundColor: bowl.bgColor,
              borderColor: bowl.borderColor,
              boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.2), 0 10px 15px rgba(0,0,0,0.15)'
            }}
          >
            {/* Visual Matcha powder pile accumulating in the bowl */}
            <AnimatePresence>
              {cupsCount > 0 && (
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-24 h-24 rounded-full flex items-center justify-center"
                >
                  {/* Outer powder spill blur */}
                  <div className="absolute inset-0 bg-emerald-800/20 filter blur-md rounded-full" />

                  {/* Layered powder peaks based on cupsCount */}
                  <div
                    className="bg-emerald-800 rounded-full flex items-center justify-center shadow-md relative filter blur-[1px]"
                    style={{
                      width: `${Math.min(45 + cupsCount * 12, 85)}px`,
                      height: `${Math.min(45 + cupsCount * 12, 85)}px`,
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <div className="absolute w-2/3 h-2/3 bg-emerald-700 rounded-full filter blur-[0.5px] opacity-90" />
                    <div className="absolute w-1/3 h-1/3 bg-emerald-600 rounded-full opacity-80" />

                    {/* Show beautiful number indicator inside powder pile */}
                    <span className="absolute text-[11px] font-mono font-bold text-emerald-100/75 select-none">
                      {cupsCount}杯
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating Chashaku tool following cursor when held */}
      {isHoldingChashaku && (
        <div
          className="fixed pointer-events-none z-50 flex flex-col items-center"
          style={{
            left: cursorPos.x + (containerRef.current?.getBoundingClientRect().left || 0) - 72,
            top: cursorPos.y + (containerRef.current?.getBoundingClientRect().top || 0) - 20,
            transform: 'rotate(-15deg)',
            transition: 'transform 0.1s ease'
          }}
        >
          <div className="relative w-36 h-4 bg-[#ebd4a0] rounded-full border border-[#cca15e] flex items-center justify-start pl-2 shadow-lg">
            {/* Powder load tip */}
            {hasScooped ? (
              <div className="absolute -left-1 -top-1.5 w-6 h-6 bg-emerald-700 border border-emerald-800 rounded-full flex items-center justify-center shadow-sm">
                <div className="w-4 h-4 bg-emerald-600 rounded-full filter blur-[1px]" />
              </div>
            ) : (
              <div className="w-4 h-3 bg-[#dfbf7f] rounded-l-full border-r border-[#bfa268]" />
            )}
            <div className="absolute right-2 w-2 h-2 rounded-full bg-[#ae8640]/30" />
          </div>
        </div>
      )}

      {/* Footer controls */}
      <div className="flex items-center justify-between border-t border-stone-200/50 pt-2 text-stone-600 text-xs">
        <div className="flex items-center gap-1.5 font-sans font-medium text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>お茶の葉: {cupsCount} / {targetCups} 杯</span>
        </div>

        <button
          onClick={() => onComplete(cupsCount)}
          className={`flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
            cupsCount > 0
              ? 'bg-amber-800 text-white hover:bg-amber-900 cursor-pointer'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
          disabled={cupsCount === 0}
        >
          <span>お湯を入れる工程へ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
export default StepMatcha;
