/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BowlConfig, NatsumeConfig, Customer } from '../types';
import { audio } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, CornerRightUp, RefreshCw, Zap, AlertCircle } from 'lucide-react';

interface TabletopBoardProps {
  bowl: BowlConfig;
  natsume: NatsumeConfig;
  customer: Customer | null;
  mode: 'OMOTENASHI' | 'ORDER';
  onComplete: (result: {
    matchaCups: number;
    waterLevel: number;
    waterAccuracy: 'LOW' | 'MEDIUM' | 'HIGH'; // For compatibility or safety
    whiskShakeCount: number;
    whiskCompleted: boolean;
    bubblePoppedCount: number;
    bubblePoppedCompleted: boolean;
    serveRotationClicks: number;
    isServed: boolean;
  }) => void;
}

interface Bubble {
  id: number;
  x: number; // Percent x
  y: number; // Percent y
  size: number;
}

export const TabletopBoard: React.FC<TabletopBoardProps> = ({
  bowl,
  natsume,
  customer,
  mode,
  onComplete
}) => {
  // Target Configurations based on Mode / Customer
  const targetMatcha = mode === 'ORDER' ? customer?.order.matchaCups || 2 : 2;
  const targetWater = mode === 'ORDER' ? customer?.order.waterLevel || 'MEDIUM' : 'MEDIUM';
  const targetWhisk = mode === 'ORDER' ? customer?.order.whiskType || 'PERFECT' : 'PERFECT';
  const targetRotation = mode === 'ORDER' ? customer?.order.serveRotation || 2 : 2;

  // Active step manager: 'matcha' | 'water' | 'whisk' | 'serve'
  const [activeStep, setActiveStep] = useState<'matcha' | 'water' | 'whisk' | 'serve'>('matcha');
  
  // TO-DO guidance messages
  const [guidance, setGuidance] = useState<string>('まずは棗（なつめ）のフタをお開けください。いよいよお点前の始まりです。');

  // ==========================================
  // STATE - Step 1: Matcha
  // ==========================================
  const [natsumeOpen, setNatsumeOpen] = useState(false);
  const [isHoldingChashaku, setIsHoldingChashaku] = useState(false);
  const [hasScooped, setHasScooped] = useState(false);
  const [matchaCups, setMatchaCups] = useState(0);
  const [chashakuPos, setChashakuPos] = useState({ x: 200, y: 350 });

  // ==========================================
  // STATE - Step 2: Water
  // ==========================================
  const [waterLevel, setWaterLevel] = useState(0);
  const waterLevelRef = useRef(0);
  const [isPouring, setIsPouring] = useState(false);
  const [hasPoured, setHasPoured] = useState(false);

  // Targets definition
  const waterTargetRanges = {
    LOW: { min: 25, max: 35, label: '少なめ (25%〜35%)' },
    MEDIUM: { min: 48, max: 58, label: '中量 (48%〜58%)' },
    HIGH: { min: 73, max: 83, label: 'たっぷり (73%〜83%)' }
  };
  const waterRange = waterTargetRanges[targetWater];

  // ==========================================
  // STATE - Step 3: Whisk
  // ==========================================
  const [shakeCount, setShakeCount] = useState(0);
  const [isWhiskingDone, setIsWhiskingDone] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [isPoppingDone, setIsPoppingDone] = useState(false);
  const [isHoldingChasen, setIsHoldingChasen] = useState(false);
  const [chasenLocalPos, setChasenLocalPos] = useState({ x: 96, y: 96 });
  const [isHoveringBowl, setIsHoveringBowl] = useState(false);

  const REQUIRED_SHAKES = targetWhisk ? (targetWhisk === 'LIGHT' ? 12 : 25) : 25;

  // ==========================================
  // STATE - Step 4: Serve
  // ==========================================
  const [rotationClicks, setRotationClicks] = useState(0);
  const [isDraggingBowl, setIsDraggingBowl] = useState(false);
  const [bowlDragOffset, setBowlDragOffset] = useState({ x: 0, y: 0 });
  const [isServed, setIsServed] = useState(false);

  // Degrees: 0, 90, 180, 270
  const currentRotationDegrees = (rotationClicks * 90) % 360;

  // Refs for positions & intervals
  const tabletopRef = useRef<HTMLDivElement>(null);
  const pourInterval = useRef<NodeJS.Timeout | null>(null);
  const lastY = useRef<number | null>(null);
  const lastDirection = useRef<'up' | 'down' | null>(null);
  const strokeTimer = useRef<number>(0);
  const dragStartY = useRef<number>(0);
  const dragStartX = useRef<number>(0);

  // ==========================================
  // EFFECTS & EVENTS - Chashaku (Matcha)
  // ==========================================
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isHoldingChashaku || !tabletopRef.current) return;
      const rect = tabletopRef.current.getBoundingClientRect();
      setChashakuPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isHoldingChashaku || !tabletopRef.current || e.touches.length === 0) return;
      const rect = tabletopRef.current.getBoundingClientRect();
      setChashakuPos({
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
    if (activeStep !== 'matcha') return;
    if (!natsumeOpen) {
      setNatsumeOpen(true);
      audio.playThud();
      setGuidance('茶杓（ちゃしゃく）をお手に取り、お抹茶をすくいましょう。');
    }
  };

  const handleChashakuPickup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStep !== 'matcha') return;
    if (!natsumeOpen) {
      setGuidance('まずは棗のフタをお開けください。');
      return;
    }
    setIsHoldingChashaku(true);
    audio.playScoop();
    setGuidance('茶杓を棗の上へ運び、お抹茶をそっとすくい上げてください。');
  };

  const handleNatsumeScoop = () => {
    if (activeStep === 'matcha' && isHoldingChashaku && !hasScooped) {
      setHasScooped(true);
      audio.playScoop();
      setGuidance('お茶碗の上まで茶杓を運び、お抹茶を優しくお入れしましょう。');
    }
  };

  const handleBowlDrop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStep === 'matcha' && isHoldingChashaku && hasScooped) {
      const nextCups = matchaCups + 1;
      setMatchaCups(nextCups);
      audio.playPowderDrop();
      setHasScooped(false);
      setIsHoldingChashaku(false);

      if (nextCups === 1) {
        setGuidance('お抹茶がお茶碗に美しく入りました。もう少しお入れしますか？ それとも直接やかんをお手に取りますか？');
      } else if (nextCups === 2) {
        setGuidance('素晴らしいお点前です。さらに重ねることも、直接やかんを長押ししてお湯を注ぐ段階へ進むこともできます。');
      } else {
        setGuidance('お抹茶が十分に入りました。お好きなタイミングでやかんを長押しし、お湯を注いでください。');
      }
    }
  };

  const proceedToWater = () => {
    setActiveStep('water');
    audio.playThud();
    setGuidance('やかんを長押ししてお湯を注ぎましょう。お好みの加減になったところで、お手を離してください。');
  };

  // ==========================================
  // EVENTS - Water (Step 2)
  // ==========================================
  const startPouring = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    // Direct transition from matcha to water
    if (activeStep === 'matcha' && matchaCups > 0) {
      setActiveStep('water');
    } else if (activeStep !== 'water') {
      return;
    }
    
    if (waterLevelRef.current >= 100) return;
    setIsPouring(true);
    setHasPoured(true);
    audio.startWaterPour();
    setGuidance('お湯を注いでおります。お好みの加減でお止めください。');

    pourInterval.current = setInterval(() => {
      setWaterLevel((prev) => {
        const next = Math.min(prev + 1, 100);
        waterLevelRef.current = next; // Sync with ref immediately
        audio.updateWaterPour(next);

        if (next >= 100) {
          stopPouring(true);
        }
        return next;
      });
    }, 45);
  };

  const stopPouring = (isAutoMax = false) => {
    if (pourInterval.current) {
      clearInterval(pourInterval.current);
      pourInterval.current = null;
    }
    if (isPouring) {
      setIsPouring(false);
      audio.stopWaterPour();

      const finalLevel = waterLevelRef.current;
      if (finalLevel >= waterRange.min && finalLevel <= waterRange.max) {
        setGuidance('素晴らしいお湯加減です。さあ、茶筅を手に取りお茶碗の中でシャカシャカと振って、お茶を点てましょう。');
      } else if (finalLevel < waterRange.min) {
        setGuidance('少しお湯が控えめかもしれません。お湯を足す場合はもう一度やかんを長押ししてください。このまま点てる場合は、茶筅を手に取ってお茶を点てましょう。');
      } else {
        if (isAutoMax || finalLevel >= 100) {
          setGuidance('お湯がたっぷりと注がれました。このままお茶を点てる工程へと進みましょう。');
        } else {
          setGuidance('少しお湯が多くなりましたが、お湯の加減もこれまた一興。お茶碗をシャカシャカと振って、お茶を点てましょう。');
        }
      }
    }
  };

  const handleWaterReset = () => {
    setWaterLevel(0);
    waterLevelRef.current = 0; // Reset ref as well
    setHasPoured(false);
    setGuidance('お湯を注ぎ直します。お好みの加減になるよう、再度やかんを長押ししてください。');
    audio.playThud();
  };

  const proceedToWhisk = () => {
    setActiveStep('whisk');
    audio.playThud();
    setGuidance('お茶碗の中で茶筅を素早くシャカシャカと振って、お茶を美しく泡立ててくださいな。');
  };

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

  useEffect(() => {
    return () => {
      if (pourInterval.current) clearInterval(pourInterval.current);
      audio.stopWaterPour();
    };
  }, []);

  // ==========================================
  // EVENTS - Whisk (Step 3)
  // ==========================================
  const handleChasenPickup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStep !== 'whisk' && !(activeStep === 'water' && waterLevel > 0)) {
      setGuidance('まだ茶筅を使う段階ではありません。');
      return;
    }
    if (isWhiskingDone) {
      setGuidance('お茶は十分に点てられております。美しく仕上がりました。');
      return;
    }

    if (isHoldingChasen) {
      setIsHoldingChasen(false);
      audio.playThud();
      setGuidance('茶筅を戻しました。準備が整いましたら、もう一度お手に取りください。');
      return;
    }

    setIsHoldingChasen(true);
    audio.playScoop();
    
    if (activeStep === 'water' && waterLevel > 0) {
      setActiveStep('whisk');
    }
    setGuidance('お茶碗の上でマウスや指を上下に素早く動かして、お茶を点ててください。');
  };

  const handleWhiskMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeStep !== 'whisk' || !isHoldingChasen || isWhiskingDone) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setChasenLocalPos({ x, y });

    const currentY = e.clientY;
    if (lastY.current === null) {
      lastY.current = currentY;
      return;
    }

    const diffY = currentY - lastY.current;
    const threshold = 15;

    if (Math.abs(diffY) > threshold) {
      const currentDir = diffY > 0 ? 'down' : 'up';

      if (lastDirection.current !== null && lastDirection.current !== currentDir) {
        setShakeCount((prev) => {
          const next = prev + 1;
          const timeNow = Date.now();
          if (timeNow - strokeTimer.current > 70) {
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

  const handleWhiskTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeStep !== 'whisk' || !isHoldingChasen || isWhiskingDone || e.touches.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    setChasenLocalPos({ x, y });

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

  const handleWhiskingFinished = () => {
    setIsWhiskingDone(true);
    setIsHoldingChasen(false);
    audio.playChime();

    if (targetWhisk === 'LIGHT') {
      setIsPoppingDone(true);
      setActiveStep('serve'); // Direct transition to serve step
      setGuidance('お見事！ふんわりと軽い適度な泡立ちに仕上がりました。お茶碗を回してお作法を整え、お客様へお出ししましょう。');
    } else {
      setGuidance('素晴らしい泡立ちです。仕上げに、表面の大きな荒泡（●）をタップして、きめ細やかに整えましょう。');
      const randomBubbles: Bubble[] = [
        { id: 1, x: 28, y: 32, size: 22 },
        { id: 2, x: 62, y: 44, size: 26 },
        { id: 3, x: 42, y: 64, size: 18 }
      ];
      setBubbles(randomBubbles);
    }
  };

  const handleBubbleClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStep !== 'whisk') return;
    audio.playBubblePop();
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setPoppedCount((prev) => {
      const next = prev + 1;
      if (next === 3) {
        setIsPoppingDone(true);
        setActiveStep('serve'); // Direct transition to serve step
        setGuidance('素晴らしいです！荒い泡がすべて消え、きめ細やかな仕上がりになりました。お茶碗を回してお作法を整え、お出ししましょう。');
        audio.playChime();
      }
      return next;
    });
  };

  const proceedToServe = () => {
    setActiveStep('serve');
    audio.playThud();
    setGuidance('お茶碗を回してお作法を整え、お客様の元へそっとスライドしてお出ししましょうね。');
  };

  // ==========================================
  // EVENTS - Serve (Step 4)
  // ==========================================
  const handleBowlClick = () => {
    if (activeStep !== 'serve' || isServed) return;
    const nextClicks = rotationClicks + 1;
    setRotationClicks(nextClicks);
    audio.playThud();

    const norm = nextClicks % 4;
    if (norm === targetRotation) {
      setGuidance('完璧なお作法です。さあ、お盆の奥（上部）へスライドしてお出ししましょう。');
    } else {
      if (norm === 0) {
        setGuidance('器の正面（🌸）が手前を向いています。さらに回して正面を避けるのが、お作法でございます。');
      } else {
        setGuidance('お茶碗がさらに回転いたしました。お好みの向きになりましたら、奥へスライドしてお出しくださいね。');
      }
    }
  };

  const handleBowlDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeStep !== 'serve' || isServed) return;
    setIsDraggingBowl(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartX.current = clientX;
    dragStartY.current = clientY;
  };

  const handleBowlDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingBowl || isServed) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartX.current;
    const deltaY = clientY - dragStartY.current;

    setBowlDragOffset({
      x: deltaX * 0.4,
      y: Math.min(20, deltaY * 0.8)
    });

    if (deltaY < -100) {
      triggerServe();
    }
  };

  const handleBowlDragEnd = () => {
    if (!isDraggingBowl) return;
    setIsDraggingBowl(false);
    if (!isServed) {
      setBowlDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerServe = () => {
    setIsServed(true);
    setIsDraggingBowl(false);
    audio.playSlide();

    setBowlDragOffset({ x: 0, y: -450 });

    setTimeout(() => {
      onComplete({
        matchaCups,
        waterLevel,
        waterAccuracy: waterLevel >= waterRange.min && waterLevel <= waterRange.max ? 'MEDIUM' : 'LOW',
        whiskShakeCount: shakeCount,
        whiskCompleted: isWhiskingDone,
        bubblePoppedCount: poppedCount,
        bubblePoppedCompleted: isPoppingDone,
        serveRotationClicks: rotationClicks,
        isServed: true
      });
    }, 850);
  };

  useEffect(() => {
    if (isDraggingBowl) {
      window.addEventListener('mousemove', handleBowlDragMove);
      window.addEventListener('mouseup', handleBowlDragEnd);
      window.addEventListener('touchmove', handleBowlDragMove, { passive: true });
      window.addEventListener('touchend', handleBowlDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleBowlDragMove);
      window.removeEventListener('mouseup', handleBowlDragEnd);
      window.removeEventListener('touchmove', handleBowlDragMove);
      window.removeEventListener('touchend', handleBowlDragEnd);
    };
  }, [isDraggingBowl]);

  // Interpolated tea foam color
  const progressPercent = Math.min((shakeCount / REQUIRED_SHAKES) * 100, 100);
  const foamColor = isWhiskingDone 
    ? (targetWhisk === 'LIGHT' ? '#2e6b48' : '#88c97c') 
    : `rgb(${Math.floor(15 + (progressPercent / 100) * 120)}, ${Math.floor(76 + (progressPercent / 100) * 125)}, ${Math.floor(44 + (progressPercent / 100) * 80)})`;

  return (
    <div
      id="tabletop-board"
      ref={tabletopRef}
      className="relative w-full min-h-[500px] bg-[#f2ebd9] border border-[#d6cbaf] rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4 cursor-default select-none"
    >
      {/* Guidance Header */}
      <div className="bg-white/95 border border-stone-200 rounded-xl px-4 py-2.5 text-center text-xs text-stone-800 font-bold shadow-xs z-20">
        {guidance}
      </div>

      {/* Target Serve Sliding Area at the Top */}
      {activeStep === 'serve' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-52 h-14 border-2 border-dashed border-amber-800/20 rounded-b-xl flex items-center justify-center gap-1.5 bg-amber-50/20 text-[11px] font-bold text-amber-950/50 pointer-events-none z-10">
          <CornerRightUp className="w-4 h-4 animate-bounce" />
          <span>こちらにスライドしてお出しする</span>
        </div>
      )}

      {/* Main Interactive Tabletop / Tatami style representation */}
      <div className="relative flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-items-center my-4">
        
        {/* Left Section: Natsume and Chashaku */}
        <div className="flex flex-col items-center gap-4 md:col-span-1">
          <div className="text-[10px] font-mono text-stone-500 uppercase">茶道具 (左側)</div>

          {/* Natsume (棗) */}
          <div
            onClick={handleNatsumeClick}
            onMouseEnter={handleNatsumeScoop}
            onTouchStart={handleNatsumeScoop}
            className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 ${
              activeStep === 'matcha' ? 'scale-105 filter drop-shadow-md' : 'opacity-65 scale-95'
            }`}
          >
            <span className="text-[10px] font-mono text-stone-500 mb-1">棗 (なつめ)</span>
            
            <div className="relative w-20 h-24 flex flex-col items-center">
              {/* Lid */}
              <motion.div
                animate={natsumeOpen ? { y: -30, x: 20, rotate: 15, opacity: 0.8 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                className="absolute top-0 w-14 h-7 rounded-t-xl z-20 border border-stone-800/30"
                style={{ backgroundColor: natsume.color }}
              >
                <div className="absolute bottom-1 w-full h-1" style={{ backgroundColor: natsume.accentColor }} />
              </motion.div>

              {/* Body */}
              <div
                className="absolute bottom-2 w-14 h-14 rounded-b-xl shadow-md border border-stone-800/30 flex items-center justify-center overflow-hidden z-10"
                style={{ backgroundColor: natsume.color }}
              >
                <AnimatePresence>
                  {natsumeOpen && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-10 h-10 rounded-full bg-emerald-700 border-2 border-emerald-800/60 shadow-inner flex items-center justify-center"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-600 filter blur-[1px]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Chashaku (茶杓) placement */}
          {!isHoldingChashaku && (
            <div
              onClick={handleChashakuPickup}
              className={`flex flex-col items-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform p-1.5 rounded-lg border border-stone-300/20 ${
                activeStep === 'matcha' && natsumeOpen && matchaCups < targetMatcha 
                  ? 'animate-pulse bg-amber-50 border-amber-500/50' 
                  : 'bg-stone-200/40 opacity-70'
              }`}
            >
              <span className="text-[9px] font-mono text-stone-500 mb-0.5">茶杓</span>
              <div className="relative w-28 h-3.5 bg-[#ebd4a0] rounded-full border border-[#cca15e] flex items-center justify-start pl-2">
                <div className="w-3.5 h-2.5 bg-[#dfbf7f] rounded-l-full border-r border-[#bfa268]" />
              </div>
            </div>
          )}
        </div>

        {/* Center Section: The Primary Bowl */}
        <div className="relative flex flex-col items-center md:col-span-2">
          <span className="text-[10px] font-mono text-stone-500 mb-2">
            お茶碗 ({bowl.name}) — {activeStep === 'serve' ? 'スライドして提供' : 'お盆中央'}
          </span>

          {/* Steam Effect when water exists */}
          {waterLevel > 5 && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none flex justify-around opacity-50 z-20">
              <div className="w-1.5 h-12 bg-white/40 rounded-full filter blur-md animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
              <div className="w-1.5 h-12 bg-white/40 rounded-full filter blur-md animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '4s' }} />
              <div className="w-1.5 h-12 bg-white/40 rounded-full filter blur-md animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }} />
            </div>
          )}

          {/* Water stream from Kettle */}
          {isPouring && (
            <div className="absolute -top-24 left-4 w-6 h-28 pointer-events-none z-10 opacity-80">
              <svg className="w-full h-full" viewBox="0 0 100 200">
                <path d="M 10 0 Q 60 100 50 200" fill="none" stroke="rgba(240, 248, 255, 0.85)" strokeWidth="6" strokeLinecap="round" className="animate-pulse" />
                <path d="M 10 0 Q 60 100 50 200" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {/* The Bowl container with motion */}
          <motion.div
            animate={{
              x: bowlDragOffset.x,
              y: bowlDragOffset.y,
              scale: isDraggingBowl ? 1.05 : 1
            }}
            transition={isServed ? { duration: 0.6, ease: 'easeOut' } : { type: 'spring', stiffness: 300, damping: 20 }}
            onMouseDown={handleBowlDragStart}
            onTouchStart={(e) => {
              handleBowlDragStart(e);
              setIsHoveringBowl(true);
            }}
            onTouchEnd={() => {
              setIsHoveringBowl(false);
            }}
            onMouseEnter={() => setIsHoveringBowl(true)}
            onMouseLeave={() => {
              setIsHoveringBowl(false);
              setChasenLocalPos({ x: 96, y: 96 });
            }}
            onClick={handleBowlClick}
            className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-4 ${
              activeStep === 'matcha' && isHoldingChashaku && hasScooped ? 'ring-4 ring-emerald-500/30 scale-102 cursor-pointer' : ''
            } ${
              activeStep === 'whisk' && isHoldingChasen && !isWhiskingDone ? 'cursor-pointer' : ''
            } ${
              activeStep === 'serve' ? 'cursor-grab active:cursor-grabbing border-amber-600/30' : ''
            }`}
            style={{
              backgroundColor: bowl.bgColor,
              borderColor: bowl.borderColor,
              boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.2), 0 10px 15px rgba(0,0,0,0.15)'
            }}
            onMouseMove={handleWhiskMouseMove}
            onTouchMove={handleWhiskTouchMove}
            onMouseUp={activeStep === 'matcha' ? handleBowlDrop : undefined}
          >
            {/* Inside Bowl liquid / contents */}
            <div className="relative w-40 h-40 rounded-full overflow-hidden flex items-center justify-center">
              
              {/* 1. Empty Matcha Powder visible before Whisking */}
              {!isWhiskingDone && matchaCups > 0 && (
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-800/15 filter blur-sm rounded-full" />
                  <div
                    className="bg-emerald-800 rounded-full flex items-center justify-center shadow-inner relative filter blur-[0.5px]"
                    style={{
                      width: `${Math.min(40 + matchaCups * 12, 80)}px`,
                      height: `${Math.min(40 + matchaCups * 12, 80)}px`,
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <div className="absolute w-2/3 h-2/3 bg-emerald-700 rounded-full opacity-90" />
                    <span className="absolute text-[10px] font-mono text-emerald-100 font-bold select-none">{matchaCups}杯</span>
                  </div>
                </div>
              )}

              {/* 2. Water pool overlay (for step 2 and step 3) */}
              {waterLevel > 0 && !isWhiskingDone && (
                <div
                  className="absolute bottom-0 left-0 w-full bg-emerald-950/50 transition-all duration-75 flex items-center justify-center"
                  style={{
                    height: `${waterLevel}%`,
                    borderTop: '2px solid rgba(167, 243, 208, 0.4)'
                  }}
                >
                  {isPouring && (
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-emerald-800/20 to-transparent animate-pulse" />
                  )}
                </div>
              )}

              {/* 3. Foam / Whisk Finished state (Step 3 finished & Step 4) */}
              {activeStep === 'whisk' && waterLevel > 0 && (
                <div
                  className="absolute inset-0 transition-colors duration-200"
                  style={{ backgroundColor: foamColor }}
                >
                  {/* Bubble noise */}
                  {progressPercent > 15 && (
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:10px_10px] opacity-25" />
                  )}
                  {progressPercent > 50 && (
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_2px)] bg-[size:16px_16px] opacity-20" />
                  )}
                </div>
              )}

              {/* 4. Complete foam state for Serve (Step 4) */}
              {activeStep === 'serve' && (
                <div className="absolute inset-0 bg-[#88c97c]">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:8px_8px] opacity-20" />
                </div>
              )}

              {/* Ceramic design mark (🌸 Crest for rotation target alignment) */}
              <motion.div
                animate={{ rotate: currentRotationDegrees }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="absolute bottom-3 w-8 h-8 rounded-full border border-amber-400/40 bg-amber-100/30 flex items-center justify-center shadow-xs">
                  <span className="text-[12px] text-amber-500/80">🌸</span>
                </div>
              </motion.div>

              {/* Big Bubbles for popping in Whisk step */}
              {activeStep === 'whisk' && isWhiskingDone && (
                <AnimatePresence>
                  {bubbles.map((b) => (
                    <motion.div
                      key={b.id}
                      onClick={(e) => handleBubbleClick(b.id, e)}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                      exit={{ scale: 1.8, opacity: 0 }}
                      className="absolute rounded-full border border-emerald-300 bg-white/20 cursor-pointer flex items-center justify-center"
                      style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.size}px`,
                        height: `${b.size}px`
                      }}
                    >
                      <span className="w-1 h-1 bg-white/50 rounded-full absolute top-0.5 left-0.5" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Inside shadow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>

            {/* Simulated Chasen Head inside bowl while actively whisking */}
            {activeStep === 'whisk' && isHoldingChasen && !isWhiskingDone && isHoveringBowl && (
              <motion.div
                animate={{ 
                  x: [0, -3, 3, -1, 1, 0],
                  y: [0, -4, 4, -2, 2, 0],
                  rotate: [10, 6, 14, 8, 12, 10]
                }}
                transition={{ repeat: Infinity, duration: 0.12 }}
                className="absolute pointer-events-none z-30 flex flex-col items-center opacity-95"
                style={{ 
                  left: `${chasenLocalPos.x}px`, 
                  top: `${chasenLocalPos.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-10 h-12 border-t border-x border-amber-400 bg-amber-200/50 rounded-t-full shadow-md" />
                <div className="w-4 h-12 bg-amber-300/80 rounded-b border-x border-amber-400 shadow-sm" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right Section: Kettle & Whisk Status */}
        <div className="flex flex-col items-center gap-4 md:col-span-1">
          <div className="text-[10px] font-mono text-stone-500 uppercase">茶道具 (右側)</div>

          {/* Kettle (やかん / 水注) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-stone-400 mb-1">やかん</span>
            <motion.div
              onMouseDown={startPouring}
              onTouchStart={startPouring}
              onMouseUp={stopPouring}
              onTouchEnd={stopPouring}
              animate={isPouring ? { rotate: -30, x: -35, y: -15 } : { rotate: 0, x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className={`w-20 h-20 rounded-full border border-stone-400 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300 shadow-sm flex items-center justify-center relative select-none ${
                activeStep === 'water' || (activeStep === 'matcha' && matchaCups > 0) ? 'cursor-pointer scale-102 ring-2 ring-sky-500/25 border-sky-400' : 'opacity-60 scale-95 pointer-events-none'
              }`}
            >
              <div className="absolute -left-2 top-6 w-4 h-3 bg-stone-300 rounded-l-full border-l border-stone-400" />
              <div className="absolute -top-2 w-12 h-6 border-2 border-stone-400 rounded-t-full bg-transparent" />
              <div className="flex flex-col items-center text-center">
                <span className="text-xl">🫖</span>
                {(activeStep === 'water' || (activeStep === 'matcha' && matchaCups > 0)) && (
                  <span className="text-[8px] font-bold text-stone-500">長押し</span>
                )}
              </div>
            </motion.div>

            {/* Water Reset Button (Only visible during water step) */}
            {activeStep === 'water' && hasPoured && (
              <button
                onClick={handleWaterReset}
                className="mt-2 flex items-center gap-1 px-2 py-0.5 rounded border border-stone-300 bg-stone-50 hover:bg-stone-100 text-[9px] font-bold text-stone-600 transition-all cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>やり直す</span>
              </button>
            )}
          </div>

          {/* Chasen (茶筅) Status / Representation */}
          <div 
            onClick={handleChasenPickup}
            className={`flex flex-col items-center transition-all ${
              ((activeStep === 'whisk' || (activeStep === 'water' && waterLevel > 0)) && !isWhiskingDone)
                ? 'scale-105 hover:scale-110 active:scale-95 cursor-pointer' 
                : 'opacity-50 scale-95 pointer-events-none'
            }`}
          >
            <span className="text-[10px] font-mono text-stone-400 mb-1">茶筅 (ちゃせん)</span>
            <div className={`w-12 h-16 rounded-lg flex flex-col items-center justify-center shadow-xs transition-all ${
              isHoldingChasen 
                ? 'bg-stone-100/30 border border-dashed border-stone-300' 
                : 'bg-[#faebd7] border border-amber-300/50 hover:border-amber-400'
            }`}>
              {!isHoldingChasen ? (
                <>
                  <span className="text-xl">🪶</span>
                  <span className="text-[8px] text-amber-900 font-mono font-bold mt-1">
                    {activeStep === 'whisk' ? '手にとって振る' : 'お湯の後に使用'}
                  </span>
                </>
              ) : (
                <span className="text-[8px] text-stone-400 font-mono font-bold">持ち出し中</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Floating Chashaku tool following cursor when held */}
      {isHoldingChashaku && (
        <div
          className="fixed pointer-events-none z-50 flex flex-col items-center"
          style={{
            left: chashakuPos.x + (tabletopRef.current?.getBoundingClientRect().left || 0) - 50,
            top: chashakuPos.y + (tabletopRef.current?.getBoundingClientRect().top || 0) - 10,
            transform: 'rotate(-15deg)',
          }}
        >
          <div className="relative w-28 h-3 bg-[#ebd4a0] rounded-full border border-[#cca15e] flex items-center justify-start pl-2 shadow-lg">
            {hasScooped ? (
              <div className="absolute -left-1 -top-1.5 w-5 h-5 bg-emerald-700 border border-emerald-800 rounded-full flex items-center justify-center shadow-xs">
                <div className="w-3.5 h-3.5 bg-emerald-600 rounded-full filter blur-[1px]" />
              </div>
            ) : (
              <div className="w-3.5 h-2.5 bg-[#dfbf7f] rounded-l-full border-r border-[#bfa268]" />
            )}
          </div>
        </div>
      )}



      {/* Steps indicators, progress gauges, & controls at the bottom of the tabletop */}
      <div className="border-t border-stone-200/60 pt-3 flex flex-wrap items-center justify-between gap-3 text-stone-600 text-xs">
        
        {/* Step-specific real-time parameters */}
        <div className="flex items-center gap-2">
          {activeStep === 'matcha' && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-lg font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>お茶の葉: {matchaCups} 杯</span>
            </div>
          )}

          {activeStep === 'water' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-100 px-3 py-1 rounded-lg font-medium">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>お湯の量: {waterLevel}%</span>
              </div>
              {/* Little Water Gauge built-in directly to the table bar */}
              <div className="w-24 h-3 bg-stone-100 border border-stone-200 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 bg-sky-400" style={{ width: `${waterLevel}%` }} />
                <div 
                  className="absolute top-0 bottom-0 bg-amber-400/40 border-l border-r border-dashed border-amber-600/70" 
                  style={{ left: `${waterRange.min}%`, width: `${waterRange.max - waterRange.min}%` }} 
                />
              </div>
            </div>
          )}

          {activeStep === 'whisk' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-lg font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>泡立ち: {progressPercent.toFixed(0)}%</span>
              </div>
              {targetWhisk !== 'LIGHT' && (
                <div className="bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg text-amber-900 font-bold flex items-center gap-1">
                  <span>荒泡潰し: {poppedCount} 個</span>
                </div>
              )}
            </div>
          )}

          {activeStep === 'serve' && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-100 px-3 py-1 rounded-lg font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>器の回転: {rotationClicks} 回 ({((rotationClicks * 90) % 360) === 0 ? '正面手前' : '正面を避けた状態'})</span>
            </div>
          )}
        </div>

        {/* Action Button to advance within the single screen */}
        <div className="flex items-center gap-2">
          {activeStep === 'serve' && (
            <button
              onClick={triggerServe}
              disabled={isServed}
              className="flex items-center gap-1 bg-amber-800 text-white hover:bg-amber-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>スライドせずにお茶を出す</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
export default TabletopBoard;
