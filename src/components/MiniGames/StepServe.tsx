/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BowlConfig } from '../../types';
import { audio } from '../../utils/audio';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, CornerRightUp } from 'lucide-react';

interface StepServeProps {
  bowl: BowlConfig;
  targetRotation: number; // 0 or 2
  onComplete: (rotationClicks: number) => void;
}

export const StepServe: React.FC<StepServeProps> = ({
  bowl,
  targetRotation,
  onComplete
}) => {
  const [rotationClicks, setRotationClicks] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isServed, setIsServed] = useState(false);
  const [message, setMessage] = useState('お茶碗をクリックして「時計回りに回転」させ、器の正面を避けてから、奥（上部）へドラッグしてお出ししましょう。');

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartX = useRef<number>(0);

  // Degrees: 0, 90, 180, 270
  const currentDegrees = (rotationClicks * 90) % 360;

  const handleBowlClick = () => {
    if (isServed) return;
    setRotationClicks((prev) => {
      const next = prev + 1;
      audio.playThud();
      
      const norm = next % 4;
      if (norm === targetRotation) {
        if (targetRotation === 2) {
          setMessage('素晴らしいお作法です！正面（絵柄）が奥を向き、避けることができました。そのまま奥へスライドしてお出ししましょう。');
        } else {
          setMessage('ご要望に合わせた回転になりました。奥へスライドしてお出ししましょう。');
        }
      } else {
        if (norm === 0) {
          setMessage('器の正面（絵柄）が手前（自分側）を向いています。クリックで回転させましょう。');
        } else if (norm === 2) {
          setMessage('器の正面が奥（相手側）に向いています。さらに回して正面を避けましょう。');
        } else {
          setMessage('お茶碗が横を向いています。クリックしてもう少し回転させましょう。');
        }
      }
      return next;
    });
  };

  // Drag start handler for sliding bowl upward
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isServed) return;
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartX.current = clientX;
    dragStartY.current = clientY;
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || isServed) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartX.current;
    const deltaY = clientY - dragStartY.current;

    // We mainly care about dragging upward (negative Y)
    // Allow small horizontal play, restrict downward dragging
    setDragOffset({
      x: deltaX * 0.4,
      y: Math.min(20, deltaY * 0.8)
    });

    // If dragged upward significantly, trigger serve!
    if (deltaY < -100) {
      triggerServe();
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!isServed) {
      // Snap back smoothly
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerServe = () => {
    setIsServed(true);
    setIsDragging(false);
    audio.playSlide();

    // Glide animation off the top of screen
    setDragOffset({ x: 0, y: -400 });

    setTimeout(() => {
      onComplete(rotationClicks);
    }, 850);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: true });
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  return (
    <div
      id="step-serve-container"
      ref={containerRef}
      className="relative w-full h-[450px] bg-[#f2ebd9] border border-[#d6cbaf] rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4 cursor-default select-none"
    >
      {/* Guidance Header */}
      <div className="bg-white/80 backdrop-blur-xs border border-stone-200 rounded-lg px-4 py-2 text-center text-xs text-stone-700 font-medium z-10">
        {message}
      </div>

      {/* Target Serve sliding area highlight at the top */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-12 border-2 border-dashed border-amber-800/20 rounded-b-xl flex items-center justify-center gap-1.5 bg-amber-50/10 text-[11px] font-bold text-amber-900/40 pointer-events-none">
        <CornerRightUp className="w-4 h-4 animate-bounce" />
        <span>ここにスライドしてお出しする</span>
      </div>

      {/* Main interactive area */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        
        {/* The Bowl wrapper that handles click & drag */}
        <motion.div
          animate={{
            x: dragOffset.x,
            y: dragOffset.y,
            scale: isDragging ? 1.05 : 1
          }}
          transition={isServed ? { duration: 0.6, ease: 'easeOut' } : { type: 'spring', stiffness: 300, damping: 20 }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onClick={handleBowlClick}
          className="relative flex flex-col items-center group cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <div className="text-[10px] font-mono text-stone-500 mb-2 select-none pointer-events-none">
            {isServed ? 'お出ししました' : 'クリックで回転 / 上へドラッグで提供'}
          </div>

          <motion.div
            animate={{ rotate: currentDegrees }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            className="relative w-52 h-52 rounded-full flex items-center justify-center shadow-2xl border-4"
            style={{
              backgroundColor: bowl.bgColor,
              borderColor: bowl.borderColor,
              boxShadow: 'inset 0 12px 24px rgba(0,0,0,0.25), 0 10px 20px rgba(0,0,0,0.15)'
            }}
          >
            {/* Liquid creamy foam rendering */}
            <div className="relative w-44 h-44 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center">
              {/* Foam pattern */}
              <div className="absolute inset-0 bg-[#88c97c]" />
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:8px_8px] opacity-20" />
              
              {/* Beautiful ceramic crest / mark (器の正面) */}
              {/* A distinct golden circle/accent at the bottom (0 degrees) */}
              <div className="absolute bottom-3 w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-100/45 flex items-center justify-center shadow-xs">
                <span className="text-[14px] text-amber-500 select-none">🌸</span>
              </div>

              {/* Liquid depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* Footer controls & visual feedback */}
      <div className="flex items-center justify-between border-t border-stone-200/50 pt-2 text-stone-600 text-xs">
        <div className="flex items-center gap-1.5 font-sans font-medium text-amber-950 bg-amber-50 px-2.5 py-1 rounded-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>正面の回転: {currentDegrees} ° ({rotationClicks % 4}回クリック)</span>
        </div>

        {/* Fallback button if dragging is difficult on certain frames */}
        <button
          onClick={triggerServe}
          disabled={isServed}
          className="flex items-center gap-1 bg-amber-800 text-white hover:bg-amber-900 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <span>スライドせずにお茶を出す</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
export default StepServe;
