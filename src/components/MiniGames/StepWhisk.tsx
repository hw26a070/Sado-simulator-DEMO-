/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BowlConfig } from '../../types';
import { audio } from '../../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

interface StepWhiskProps {
  bowl: BowlConfig;
  targetWhiskType: 'LIGHT' | 'PERFECT' | 'NONE';
  onComplete: (shakeCount: number, completed: boolean, poppedCount: number, poppedCompleted: boolean) => void;
}

interface Bubble {
  id: number;
  x: number; // Percent x
  y: number; // Percent y
  size: number;
}

export const StepWhisk: React.FC<StepWhiskProps> = ({
  bowl,
  targetWhiskType,
  onComplete
}) => {
  const [shakeCount, setShakeCount] = useState(0);
  const [isWhiskingDone, setIsWhiskingDone] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [isPoppingDone, setIsPoppingDone] = useState(false);
  const [message, setMessage] = useState('茶筅（ちゃせん）をお茶碗の中で上下に素早くシャカシャカ動かして、お茶を泡立てましょう。');

  const bowlAreaRef = useRef<HTMLDivElement>(null);
  const lastY = useRef<number | null>(null);
  const lastDirection = useRef<'up' | 'down' | null>(null);
  const strokeTimer = useRef<number>(0);

  const REQUIRED_SHAKES = targetWhiskType === 'LIGHT' ? 12 : 25;

  // Track cursor movement in bowl to count rapid shaking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isWhiskingDone || !bowlAreaRef.current) return;

    // Get cursor client coordinates
    const currentY = e.clientY;
    if (lastY.current === null) {
      lastY.current = currentY;
      return;
    }

    const diffY = currentY - lastY.current;
    const threshold = 15; // Minimum travel distance to count

    if (Math.abs(diffY) > threshold) {
      const currentDir = diffY > 0 ? 'down' : 'up';

      if (lastDirection.current !== null && lastDirection.current !== currentDir) {
        // Direction changed! This represents one complete shake stroke.
        setShakeCount((prev) => {
          const next = prev + 1;
          
          // Debounce audio slightly to prevent extreme sound overlapping
          const timeNow = Date.now();
          if (timeNow - strokeTimer.current > 70) {
            // Speed factor based on stroke movement speed
            const speedFactor = Math.max(0.8, Math.min(1.8, 120 / Math.max(1, timeNow - strokeTimer.current)));
            audio.playWhiskStroke(speedFactor);
            strokeTimer.current = timeNow;
          }

          if (next >= REQUIRED_SHAKES) {
            handleWhiskingFinished();
          }
          return next;
        });
      }
      lastDirection.current = currentDir;
      lastY.current = currentY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isWhiskingDone || e.touches.length === 0) return;
    const currentY = e.touches[0].clientY;
    if (lastY.current === null) {
      lastY.current = currentY;
      return;
    }
    const diffY = currentY - lastY.current;
    const threshold = 12;

    if (Math.abs(diffY) > threshold) {
      const currentDir = diffY > 0 ? 'down' : 'up';
      if (lastDirection.current !== null && lastDirection.current !== currentDir) {
        setShakeCount((prev) => {
          const next = prev + 1;
          const timeNow = Date.now();
          if (timeNow - strokeTimer.current > 80) {
            audio.playWhiskStroke(1.1);
            strokeTimer.current = timeNow;
          }
          if (next >= REQUIRED_SHAKES) {
            handleWhiskingFinished();
          }
          return next;
        });
      }
      lastDirection.current = currentDir;
      lastY.current = currentY;
    }
  };

  // Phase transition: from whisking to bubble popping
  const handleWhiskingFinished = () => {
    setIsWhiskingDone(true);
    audio.playChime();

    if (targetWhiskType === 'LIGHT') {
      // Light foam target doesn't require popping bubbles, but let's allow proceeding directly
      setIsPoppingDone(true);
      setMessage('お見事！ふんわり軽い適度な泡立ちになりました。「おもてなしの作法へ」進みましょう。');
    } else {
      // Perfect foam requires popping the big uneven bubbles!
      setMessage('よく泡立ちました！仕上げに、表面に浮いている「大きな荒い泡（●）」をタップして潰して、きめ細かく整えましょう。');
      // Create 3 big bubbles on random positions inside the inner circle
      const randomBubbles: Bubble[] = [
        { id: 1, x: 30, y: 35, size: 24 },
        { id: 2, x: 65, y: 45, size: 28 },
        { id: 3, x: 45, y: 65, size: 20 }
      ];
      setBubbles(randomBubbles);
    }
  };

  // Pop a bubble
  const handleBubbleClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    audio.playBubblePop();
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setPoppedCount((prev) => {
      const next = prev + 1;
      if (next === 3) {
        setIsPoppingDone(true);
        setMessage('素晴らしい！荒い泡がすべて消え、クリーミーで美しい均一な泡に仕上がりました。');
        audio.playChime();
      }
      return next;
    });
  };

  const handleNext = () => {
    onComplete(shakeCount, isWhiskingDone, poppedCount, isPoppingDone);
  };

  // Calculate percentages
  const progressPercent = Math.min((shakeCount / REQUIRED_SHAKES) * 100, 100);

  // Background liquid color interpolating based on foam level (shakeCount)
  // Starts dark green (#0f4c2c), finishes pale jade green (#a3d69b)
  const foamColor = isWhiskingDone 
    ? (targetWhiskType === 'LIGHT' ? '#2e6b48' : '#88c97c') 
    : `rgb(${Math.floor(15 + (progressPercent / 100) * 120)}, ${Math.floor(76 + (progressPercent / 100) * 125)}, ${Math.floor(44 + (progressPercent / 100) * 80)})`;

  return (
    <div
      id="step-whisk-container"
      className="relative w-full h-[450px] bg-[#f2ebd9] border border-[#d6cbaf] rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4 cursor-default select-none"
    >
      {/* Guidance Header */}
      <div className="bg-white/80 backdrop-blur-xs border border-stone-200 rounded-lg px-4 py-2 text-center text-xs text-stone-700 font-medium">
        {message}
      </div>

      {/* Main interactive tray */}
      <div className="relative flex-1 w-full flex items-center justify-center gap-12 px-8">
        
        {/* The Interactive Bowl (お茶碗) */}
        <div
          ref={bowlAreaRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative flex flex-col items-center group cursor-pointer"
        >
          <div className="text-[11px] font-mono text-stone-500 mb-2">お茶碗（中をシャカシャカとなぞる）</div>

          <div
            className="relative w-52 h-52 rounded-full flex items-center justify-center shadow-2xl border-4 transition-all duration-300"
            style={{
              backgroundColor: bowl.bgColor,
              borderColor: bowl.borderColor,
              boxShadow: 'inset 0 12px 24px rgba(0,0,0,0.25), 0 10px 20px rgba(0,0,0,0.15)'
            }}
          >
            {/* The liquid content inside the bowl */}
            <div
              className="relative w-44 h-44 rounded-full overflow-hidden flex items-center justify-center shadow-inner transition-colors duration-200"
              style={{ backgroundColor: foamColor }}
            >
              {/* Dynamic bubble textures rendering when foam level increases */}
              {progressPercent > 10 && (
                <div
                  className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:10px_10px] opacity-25"
                  style={{ opacity: (progressPercent / 100) * 0.4 }}
                />
              )}
              {progressPercent > 50 && (
                <div
                  className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_2px)] bg-[size:16px_16px] opacity-20"
                  style={{ opacity: (progressPercent / 100) * 0.3 }}
                />
              )}

              {/* Big Bubbles for Popping (Phase 2) */}
              <AnimatePresence>
                {bubbles.map((b) => (
                  <motion.div
                    key={b.id}
                    onClick={(e) => handleBubbleClick(b.id, e)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.8 }}
                    exit={{ scale: 1.8, opacity: 0 }}
                    className="absolute rounded-full border-2 border-emerald-300 bg-white/20 cursor-pointer flex items-center justify-center group-hover:border-white shadow-inner"
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: `${b.size}px`,
                      height: `${b.size}px`
                    }}
                  >
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full absolute top-1 left-1" />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Inner depth shadow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
            </div>

            {/* Simulated Chasen head graphic following mouse slightly or just animating */}
            {!isWhiskingDone && (
              <motion.div
                animate={{
                  y: [0, -10, 10, -5, 5, 0],
                  rotate: [0, -5, 5, -5, 5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut"
                }}
                className="absolute w-12 h-20 pointer-events-none z-10 flex flex-col items-center opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ top: '15%' }}
              >
                {/* Bamboo whisk visual tip */}
                <div className="w-8 h-10 border-t-2 border-x-2 border-amber-400 bg-amber-200/50 rounded-t-full shadow-sm" />
                <div className="w-4 h-10 bg-amber-300/80 rounded-b-md shadow-xs border-x border-amber-400" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Level & Target info column */}
        <div className="w-48 flex flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-xs border border-stone-200 rounded-xl p-4 shadow-xs">
            <h4 className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-2">泡立ち進捗</h4>
            
            {/* Shake indicator */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone-600 font-medium">シャカシャカ:</span>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded">
                {shakeCount} / {REQUIRED_SHAKES}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200 mb-4">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Bubble pop indicator */}
            {targetWhiskType !== 'LIGHT' && (
              <div className="border-t border-stone-100 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>仕上げ(荒泡潰し):</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {poppedCount} / 3 個
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#fdfbf7] border border-amber-900/10 rounded-xl p-3 text-[11px] text-amber-900/80 leading-relaxed">
            <strong className="block text-amber-900 font-bold mb-1">💡 コツ:</strong>
            {targetWhiskType === 'LIGHT' 
              ? '実業家様はサラリとしたお茶がお好みです。過度に振りすぎず、適度なところで手を止めましょう。' 
              : '学者様や観光客様はクリーミーな泡がお好みです。往復ドラッグで点て終えたら、出てくる荒い泡をしっかりタップしてください。'}
          </div>
        </div>

      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between border-t border-stone-200/50 pt-2 text-stone-600 text-xs">
        <div className="flex items-center gap-1.5 font-sans font-medium text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>お点前状態: {isWhiskingDone ? (isPoppingDone ? 'お茶が完成しました！' : '仕上げ中') : '泡立て中'}</span>
        </div>

        <button
          onClick={handleNext}
          className={`flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
            isWhiskingDone && (targetWhiskType === 'LIGHT' || isPoppingDone)
              ? 'bg-amber-800 text-white hover:bg-amber-900 cursor-pointer'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
          disabled={!isWhiskingDone || (targetWhiskType !== 'LIGHT' && !isPoppingDone)}
        >
          <span>お客様に出す作法へ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
export default StepWhisk;
