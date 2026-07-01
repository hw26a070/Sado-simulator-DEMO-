/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Customer, ScoreBreakdown, BowlConfig, NatsumeConfig } from '../types';
import { audio } from '../utils/audio';
import { motion } from 'motion/react';
import { Award, RefreshCw, Home, ArrowRight, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultScreenProps {
  scoreBreakdown: ScoreBreakdown;
  customer: Customer | null;
  bowl: BowlConfig;
  natsume: NatsumeConfig;
  currentCustomerIndex: number;
  totalCustomers: number;
  onNext: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  scoreBreakdown,
  customer,
  bowl,
  natsume,
  currentCustomerIndex,
  totalCustomers,
  onNext,
  onRestart,
  onHome
}) => {
  const { rank, totalScore, comment, matchaScore, waterScore, whiskScore, serveScore } = scoreBreakdown;
  const [showDetails, setShowDetails] = useState(false);

  // Play chime on load for high scores
  useEffect(() => {
    if (rank === 'SSS' || rank === 'S') {
      audio.playChime();
    } else {
      audio.playThud();
    }
  }, [rank]);

  // Rank themes
  const rankThemes = {
    SSS: {
      title: '極上 (ごくじょう)',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
      emoji: '🌸🌸🌸'
    },
    S: {
      title: '特上 (とくじょう)',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      emoji: '✨✨'
    },
    A: {
      title: '並 (なみ)',
      color: 'text-stone-700 bg-stone-100 border-stone-300',
      glow: '',
      emoji: '🍵'
    },
    B: {
      title: '修行中 (しゅぎょう)',
      color: 'text-stone-500 bg-stone-50 border-stone-200',
      glow: '',
      emoji: '🍂'
    }
  };

  const theme = rankThemes[rank];

  return (
    <div id="result-screen-container" className="max-w-2xl mx-auto bg-[#fcfaf7] border border-[#e5dfd5] rounded-2xl p-6 md:p-8 shadow-md">
      {/* Tea house environment heading */}
      <div className="text-center mb-6">
        <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 font-bold tracking-widest px-3 py-1 rounded-full">
          お点前 総括 (結果発表)
        </span>
        <h2 className="font-sans font-bold text-stone-800 text-2xl mt-2 tracking-tight">本日の一杯</h2>
      </div>

      {/* Decorative Tatami background panel with result */}
      <div className="bg-[#f5efe6] rounded-xl p-6 border border-[#ebdcc5] mb-6 relative overflow-hidden">
        
        {/* Absolute rank big stamp behind */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 select-none opacity-10 pointer-events-none text-9xl font-extrabold italic text-stone-900">
          {rank}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-around gap-6 relative z-10">
          
          {/* Rank presentation */}
          <div className="text-center flex flex-col items-center">
            <span className="text-stone-400 text-[10px] font-mono tracking-wider mb-1">格付け</span>
            <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 ${theme.color} ${theme.glow} transition-all duration-300`}>
              <span className="text-xs font-mono font-bold tracking-widest">{theme.emoji}</span>
              <span className="text-xl font-bold font-sans mt-0.5">{rank}</span>
              <span className="text-[10px] font-bold mt-0.5">{theme.title}</span>
            </div>
            <div className="mt-2 text-stone-800 font-bold text-lg font-mono">{totalScore} 点 / 100点</div>
          </div>

          {/* Customer / Facilitator's Comment box */}
          <div className="flex-1">
            {customer && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{customer.avatar}</span>
                <div>
                  <h4 className="text-xs font-bold text-stone-700">{customer.name} の感想:</h4>
                  <p className="text-[11px] text-stone-500 font-mono italic">{customer.role}</p>
                </div>
              </div>
            )}
            {!customer && (
              <h4 className="text-xs font-bold text-stone-700 mb-2">亭主（私め）より：</h4>
            )}
            
            <div className="bg-white/80 border border-stone-200/50 rounded-xl p-4 text-stone-700 text-xs italic leading-relaxed shadow-xs">
              {comment}
            </div>
          </div>
        </div>
      </div>

      {/* Action Point Breakdown Accordion Toggle */}
      <div className="mb-4 text-center">
        <button
          onClick={() => {
            setShowDetails(!showDetails);
            audio.playThud();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 text-[11px] font-mono font-bold transition-all shadow-xs cursor-pointer"
        >
          <span>{showDetails ? '評価内訳とお道具を隠す' : '評価内訳とお道具を表示する'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <div className="mb-6">
            <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest mb-3 text-center sm:text-left">お道具とお点前の評価内訳</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* 1. Matcha cups */}
              <div className="bg-white border border-stone-200/60 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🍵</span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800">お茶の葉の量</h4>
                    <p className="text-[10px] text-stone-500">
                      {customer ? `目標: ${customer.order.matchaCups}杯` : '基本: 2杯'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-stone-700">{matchaScore} 点</span>
                  <div className="text-[9px] text-stone-400">配点: 25</div>
                </div>
              </div>

              {/* 2. Water level */}
              <div className="bg-white border border-stone-200/60 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">💧</span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800">お湯の加減</h4>
                    <p className="text-[10px] text-stone-500">
                      {customer ? `目標: ${customer.order.waterLevel === 'LOW' ? '少なめ' : customer.order.waterLevel === 'MEDIUM' ? '中量' : '多め'}` : '基本: 中量'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-stone-700">{waterScore} 点</span>
                  <div className="text-[9px] text-stone-400">配点: 25</div>
                </div>
              </div>

              {/* 3. Whisk foam */}
              <div className="bg-white border border-stone-200/60 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">☁️</span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800">お茶の点て方 (泡立ち)</h4>
                    <p className="text-[10px] text-stone-500">
                      {customer ? `目標: ${customer.order.whiskType === 'LIGHT' ? '控えめ' : '極細泡'}` : '基本: 極細泡'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-stone-700">{whiskScore} 点</span>
                  <div className="text-[9px] text-stone-400">配点: 30</div>
                </div>
              </div>

              {/* 4. Etiquette rotation */}
              <div className="bg-white border border-stone-200/60 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🔄</span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800">おもてなし作法 (回転)</h4>
                    <p className="text-[10px] text-stone-500">
                      {customer ? `目標: ${customer.order.serveRotation === 0 ? '回さず即時' : '2回回す'}` : '基本: 2回回す'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-stone-700">{serveScore} 点</span>
                  <div className="text-[9px] text-stone-400">配点: 20</div>
                </div>
              </div>

            </div>

            {/* Selected tool combination showcase */}
            <div className="border-t border-stone-200/60 pt-4 mt-4 flex flex-wrap items-center justify-center gap-4 text-stone-500 text-[11px] font-mono">
              <span>今回のお取り合わせ:</span>
              <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                碗: {bowl.name}
              </span>
              <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                棗: {natsume.name}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* If ordering mode and we have more customers, show Next button */}
        {customer && currentCustomerIndex < totalCustomers - 1 ? (
          <button
            onClick={onNext}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-800 text-white hover:bg-amber-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
          >
            <span>次の客席（お点前）へ進む</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          /* If no more customers or in OMOTENASHI, allow retry or return to title */
          <>
            <button
              onClick={onRestart}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-800 text-white hover:bg-amber-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>もう一度点てる</span>
            </button>
            <button
              onClick={onHome}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>お茶席を退出する（メニューへ）</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
export default ResultScreen;
