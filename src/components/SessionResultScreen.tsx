/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Customer, ScoreBreakdown } from '../types';
import { audio } from '../utils/audio';
import { motion } from 'motion/react';
import { Trophy, RefreshCw, Home, Sparkles, Smile, Star } from 'lucide-react';

interface SessionResultScreenProps {
  customers: Customer[];
  scores: ScoreBreakdown[];
  onRestart: () => void;
  onHome: () => void;
}

export const SessionResultScreen: React.FC<SessionResultScreenProps> = ({
  customers,
  scores,
  onRestart,
  onHome
}) => {
  // Count satisfied customers (satisfaction score threshold >= 75)
  const satisfiedCount = scores.filter(s => s.totalScore >= 75).length;
  const averageScore = Math.round(scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length);

  // Determine overall tea ceremony host title
  let title = '見習い亭主';
  let desc = '茶道の基本を修行中です。お道具の扱いを丁寧に、一期一会の心でおもてなしの腕を磨きましょう。';
  let badgeColor = 'bg-stone-50 text-stone-600 border-stone-200';
  let stars = 1;

  if (averageScore >= 95) {
    title = '茶道大宗匠 (たいそうしょう)';
    desc = 'すべてのお客様を完全に満たした、伝説的なお点前です。器の向き、お湯加減、極細の泡、何一つ欠かすことなく、まさに究極のおもてなしを極められました！';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse';
    stars = 4;
  } else if (averageScore >= 75) {
    title = '一流茶人 (いちりゅうちゃじん)';
    desc = '訪れたすべてのお客様の心を揺さぶる素晴らしい一杯を点てられました。丁寧な気配りと臨機応変なお点前、素晴らしい技術をお持ちです。';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    stars = 3;
  } else if (averageScore >= 40) {
    title = '一人前茶人 (ひとりまえ)';
    desc = '基本のお茶をしっかりと点て、おもてなしを完遂することができました。より高い格付けを目指して、さらに道具と向き合ってみましょう。';
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    stars = 2;
  }

  // Play continuous chime on mounting for top tier, thud for lower
  useEffect(() => {
    if (averageScore >= 75) {
      audio.playChime();
    } else {
      audio.playThud();
    }
  }, [averageScore]);

  return (
    <div id="session-result-container" className="max-w-2xl mx-auto bg-[#fcfaf7] border border-[#e5dfd5] rounded-2xl p-6 md:p-8 shadow-md">
      
      {/* Tea Gathering Completion banner */}
      <div className="text-center mb-8">
        <Trophy className="w-12 h-12 text-amber-700 mx-auto mb-2 animate-bounce" />
        <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 font-bold tracking-widest px-3 py-1 rounded-full">
          本日の茶席：満了
        </span>
        <h2 className="font-sans font-bold text-stone-800 text-2xl mt-2 tracking-tight">お茶会 総括評価</h2>
      </div>

      {/* Main Overall Certificate Design */}
      <div className="bg-[#f5efe6] rounded-xl p-6 border-2 border-amber-900/10 mb-8 relative text-center">
        <div className="absolute top-2 right-2 flex gap-1 text-amber-600">
          {Array.from({ length: stars }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-500" />
          ))}
        </div>

        <span className="text-stone-400 text-[10px] font-mono tracking-wider">授与される称号</span>
        <div className={`inline-block border px-5 py-2 rounded-xl font-bold text-lg md:text-xl font-sans my-2 ${badgeColor}`}>
          {title}
        </div>

        <p className="text-stone-700 text-xs leading-relaxed max-w-md mx-auto mt-2">
          {desc}
        </p>

        {/* Big session statistics */}
        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-stone-300/40 pt-5">
          <div className="bg-white/80 p-3 rounded-lg border border-stone-200/50">
            <span className="block text-[10px] font-mono text-stone-500 uppercase">満足させたお客様</span>
            <span className="text-xl font-bold font-sans text-stone-800 flex items-center justify-center gap-1 mt-1">
              <Smile className="w-5 h-5 text-emerald-600" />
              {satisfiedCount} / {customers.length} 人
            </span>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-stone-200/50">
            <span className="block text-[10px] font-mono text-stone-500 uppercase">平均獲得点数</span>
            <span className="text-xl font-bold font-sans text-stone-800 flex items-center justify-center gap-1 mt-1">
              <Sparkles className="w-5 h-5 text-amber-600" />
              {averageScore} 点 / 100
            </span>
          </div>
        </div>
      </div>

      {/* Grid of guest scorecard previews */}
      <div className="mb-8">
        <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest mb-3 text-center sm:text-left">
          各お席でのおもてなし結果
        </h3>
        
        <div className="flex flex-col gap-3">
          {customers.map((c, idx) => {
            const score = scores[idx];
            if (!score) return null;
            
            return (
              <div
                key={c.id}
                className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                    {c.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800">{c.name}</h4>
                    <p className="text-[10px] text-stone-400 font-mono">{c.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold block text-stone-700">{score.totalScore} 点</span>
                    <span className="text-[9px] text-stone-400">格付け: {score.rank}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-sans ${
                    score.totalScore >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-50 text-stone-500 border-stone-300'
                  }`}>
                    {score.totalScore >= 75 ? '満' : '普'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-800 text-white hover:bg-amber-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>お茶会を再び開催する</span>
        </button>
        <button
          onClick={onHome}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>床の間（メインメニュー）へ</span>
        </button>
      </div>

    </div>
  );
};
export default SessionResultScreen;
