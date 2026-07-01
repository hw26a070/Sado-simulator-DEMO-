/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BowlConfig } from '../../types';
import { audio } from '../../utils/audio';
import { motion, useAnimation } from 'motion/react';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

interface StepWaterProps {
  bowl: BowlConfig;
  targetLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  onComplete: (level: number) => void;
}

export const StepWater: React.FC<StepWaterProps> = ({
  bowl,
  targetLevel,
  onComplete
}) => {
  const [waterLevel, setWaterLevel] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [hasPoured, setHasPoured] = useState(false);
  const [message, setMessage] = useState('やか長押し（クリック長押し）してお湯を注ぎます。目標の位置で指を離しましょう。');

  const pourInterval = useRef<NodeJS.Timeout | null>(null);

  // Targets definition
  const targetRanges = {
    LOW: { min: 25, max: 35, label: '少なめ (25%〜35%)' },
    MEDIUM: { min: 48, max: 58, label: '中量 (48%〜58%)' },
    HIGH: { min: 73, max: 83, label: 'たっぷり (73%〜83%)' }
  };

  const range = targetRanges[targetLevel];

  // Start pouring
  const startPouring = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (waterLevel >= 100) return;
    setIsPouring(true);
    setHasPoured(true);
    audio.startWaterPour();
    setMessage('注いでいます……！タイミングよく離してください！');

    pourInterval.current = setInterval(() => {
      setWaterLevel((prev) => {
        const next = Math.min(prev + 1, 100);
        audio.updateWaterPour(next);

        if (next >= 100) {
          stopPouring();
          setMessage('ああっ、お湯が溢れてしまいました！');
        }
        return next;
      });
    }, 45); // Takes about 4.5 seconds to fill completely
  };

  // Stop pouring
  const stopPouring = () => {
    if (pourInterval.current) {
      clearInterval(pourInterval.current);
      pourInterval.current = null;
    }
    if (isPouring) {
      setIsPouring(false);
      audio.stopWaterPour();

      // Check current accuracy
      setWaterLevel((finalLevel) => {
        if (finalLevel >= range.min && finalLevel <= range.max) {
          setMessage('素晴らしい！まさに完璧なお湯加減です。茶筅（ちゃせん）を振る工程へ進みましょう。');
        } else if (finalLevel < range.min) {
          setMessage('少しお湯が少なすぎるようです。もう少し足しますか？（再度長押しで追加できます）');
        } else if (finalLevel > range.max && finalLevel < 100) {
          setMessage('少しお湯が多くなってしまいました。おもてなしとしてお茶を点て進めましょう。');
        }
        return finalLevel;
      });
    }
  };

  // Handle global mouse release to prevent getting stuck
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPouring) stopPouring();
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isPouring]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pourInterval.current) clearInterval(pourInterval.current);
      audio.stopWaterPour();
    };
  }, []);

  // Helper to reset water for retries
  const handleReset = () => {
    setWaterLevel(0);
    setHasPoured(false);
    setMessage('お湯を注ぎ直します。長押しして再挑戦してください。');
    audio.playThud();
  };

  return (
    <div
      id="step-water-container"
      className="relative w-full h-[450px] bg-[#f2ebd9] border border-[#d6cbaf] rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4 cursor-default select-none"
    >
      {/* Guidance Header */}
      <div className="bg-white/80 backdrop-blur-xs border border-stone-200 rounded-lg px-4 py-2 text-center text-xs text-stone-700 font-medium">
        {message}
      </div>

      {/* Main interactive area */}
      <div className="relative flex-1 w-full flex items-center justify-around px-8">
        
        {/* Left Side: Vertical Level Gauge */}
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-[10px] font-mono text-stone-500">お湯の量ゲージ</span>
          
          <div className="relative w-12 h-64 bg-stone-100 rounded-full border-2 border-stone-300 shadow-inner overflow-hidden flex flex-col justify-end">
            
            {/* Target Ideal Spot Highlight */}
            <div
              className="absolute w-full bg-amber-500/25 border-y-2 border-dashed border-amber-600/60 flex items-center justify-center text-[10px] font-bold text-amber-900"
              style={{
                bottom: `${range.min}%`,
                height: `${range.max - range.min}%`
              }}
            >
              適量
            </div>

            {/* Rising Water level inside gauge */}
            <div
              className="w-full bg-gradient-to-t from-sky-400 to-sky-300 rounded-b-full transition-all duration-75 relative flex items-center justify-center"
              style={{ height: `${waterLevel}%` }}
            >
              {waterLevel > 8 && (
                <span className="absolute bottom-2 text-[9px] font-mono font-bold text-sky-950/70">
                  {waterLevel}%
                </span>
              )}
            </div>

            {/* Indicator markings */}
            <div className="absolute top-1/4 w-full border-t border-stone-300/40 pointer-events-none" />
            <div className="absolute top-1/2 w-full border-t border-stone-300/40 pointer-events-none" />
            <div className="absolute top-3/4 w-full border-t border-stone-300/40 pointer-events-none" />
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-sm mt-1">
            目標: {range.label}
          </span>
        </div>

        {/* Center: The Bowl & Pouring Stream */}
        <div className="relative flex flex-col items-center">
          <div className="text-[11px] font-mono text-stone-500 mb-2">お茶碗</div>
          
          {/* Animated steam rising from the bowl when water is present */}
          {waterLevel > 5 && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none flex justify-around opacity-60 z-20">
              <div className="w-1.5 h-12 bg-white/40 rounded-full filter blur-md animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
              <div className="w-1.5 h-12 bg-white/40 rounded-full filter blur-md animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '4s' }} />
              <div className="w-1.5 h-12 bg-white/40 rounded-full filter blur-md animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }} />
            </div>
          )}

          {/* Water stream from kettle */}
          {isPouring && (
            <div className="absolute -top-32 right-12 w-8 h-36 pointer-events-none z-10">
              <svg className="w-full h-full" viewBox="0 0 100 200">
                <path
                  d="M 80 0 Q 30 100 50 200"
                  fill="none"
                  stroke="rgba(240, 248, 255, 0.85)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                <path
                  d="M 80 0 Q 30 100 50 200"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          {/* Bowl container */}
          <div
            className="relative w-44 h-44 rounded-full flex items-center justify-center shadow-xl border-4"
            style={{
              backgroundColor: bowl.bgColor,
              borderColor: bowl.borderColor,
              boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.2), 0 10px 15px rgba(0,0,0,0.15)'
            }}
          >
            {/* Liquid contents representation */}
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center overflow-hidden">
              {/* Green Matcha powder pile */}
              <div className="absolute w-20 h-20 bg-emerald-800 rounded-full filter blur-[1.5px] opacity-80" />
              
              {/* Overlapping hot water pool */}
              {waterLevel > 0 && (
                <div
                  className="absolute bottom-0 left-0 w-full bg-emerald-900/60 transition-all duration-75 flex items-center justify-center"
                  style={{
                    height: `${waterLevel}%`,
                    borderTop: '2px solid rgba(167, 243, 208, 0.4)'
                  }}
                >
                  {/* Gentle water ripples */}
                  {isPouring && (
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-emerald-800/20 to-transparent animate-pulse" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tilt Kettle (やかん) interactive controller */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-stone-500">水注（やかん）</span>
          
          <motion.div
            onMouseDown={startPouring}
            onTouchStart={startPouring}
            onMouseUp={stopPouring}
            onTouchEnd={stopPouring}
            animate={isPouring ? { rotate: -35, x: -45, y: -20 } : { rotate: 0, x: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className={`w-28 h-28 cursor-pointer rounded-full border-2 border-stone-400 bg-linear-to-br from-stone-300 via-stone-200 to-stone-400 shadow-md flex items-center justify-center relative select-none ${
              isPouring ? 'shadow-inner' : 'hover:scale-105 hover:border-amber-500'
            }`}
          >
            {/* Kettle spout design */}
            <div className="absolute -left-3 top-8 w-6 h-4 bg-stone-300 rounded-l-full border-l border-stone-400" />
            {/* Handle */}
            <div className="absolute -top-3 w-16 h-8 border-4 border-stone-400 rounded-t-full bg-transparent" />
            
            <div className="flex flex-col items-center justify-center text-center px-2">
              <span className="text-2xl select-none">🫖</span>
              <span className="text-[9px] font-bold text-stone-600 tracking-tight">押し続ける</span>
            </div>
          </motion.div>

          {/* Reset button to clear level and retry */}
          {hasPoured && (
            <button
              onClick={handleReset}
              className="mt-3 flex items-center gap-1 px-2.5 py-1 rounded border border-stone-300 bg-stone-50 hover:bg-stone-100 text-[10px] font-semibold text-stone-600 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>注ぎ直す</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between border-t border-stone-200/50 pt-2 text-stone-600 text-xs">
        <div className="flex items-center gap-1.5 font-sans font-medium text-sky-900 bg-sky-50 px-2.5 py-1 rounded-md">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>お湯の量: {waterLevel} %</span>
        </div>

        <button
          onClick={() => onComplete(waterLevel)}
          className={`flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
            waterLevel > 0
              ? 'bg-amber-800 text-white hover:bg-amber-900 cursor-pointer'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
          disabled={waterLevel === 0}
        >
          <span>お茶を点てる工程へ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
export default StepWater;
