/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameMode, BowlType, NatsumeType } from '../types';
import { BOWLS, NATSUMES } from '../utils/configs';
import { audio } from '../utils/audio';
import { Sparkles, Play, ShieldAlert, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: (mode: GameMode, bowlId: BowlType, natsumeId: NatsumeType) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  const [step, setStep] = useState<'MODE' | 'TOOLS'>('MODE');
  const [selectedMode, setSelectedMode] = useState<GameMode>('OMOTENASHI');
  const [selectedBowl, setSelectedBowl] = useState<BowlType>('KURO_RAKU');
  const [selectedNatsume, setSelectedNatsume] = useState<NatsumeType>('KIN_MAKIE');

  const handleStart = () => {
    audio.playChime();
    onStartGame(selectedMode, selectedBowl, selectedNatsume);
  };

  const selectMode = (mode: GameMode) => {
    setSelectedMode(mode);
    audio.playThud();
  };

  const selectBowl = (id: BowlType) => {
    setSelectedBowl(id);
    audio.playThud();
  };

  const selectNatsume = (id: NatsumeType) => {
    setSelectedNatsume(id);
    audio.playThud();
  };

  return (
    <div id="title-screen-container" className="max-w-3xl mx-auto bg-[#fcfaf7] border border-[#e5dfd5] rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
      
      {/* Absolute elegant background accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ebdcc5]/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Title Section */}
      <div className="text-center mb-6">
        <span className="text-[11px] font-mono font-bold tracking-widest text-amber-800 bg-amber-50 border border-amber-200/50 px-4 py-1.5 rounded-full uppercase">
          雅（みやび）なるお茶室へようこそ
        </span>
        <h1 className="font-sans font-extrabold text-stone-800 text-2xl md:text-3xl mt-3 tracking-tight">
          茶道シミュレーター <span className="text-amber-800 block sm:inline">〜一期一会〜</span>
        </h1>
        <p className="text-stone-500 text-xs mt-2 max-w-md mx-auto leading-relaxed font-mono">
          「美味しいお点前を、真心を込めてお客様へお出しする」
          制限時間はございません。和の作法を、じっくりと体験いたしましょう。
        </p>
      </div>

      {/* Step 1: Mode Selection */}
      {step === 'MODE' && (
        <div className="mb-6 animate-in fade-in duration-200">
          <h3 className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-widest mb-3 text-center sm:text-left">
            一、 ゲームモードの選択 (1 / 2)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            {/* OMOTENASHI (Tutorial/Chill) */}
            <div
              onClick={() => selectMode('OMOTENASHI')}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col justify-between ${
                selectedMode === 'OMOTENASHI'
                  ? 'bg-amber-50/70 border-amber-800/80 shadow-md ring-2 ring-amber-800/10'
                  : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              {selectedMode === 'OMOTENASHI' && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-amber-800 rounded-full flex items-center justify-center text-white text-[10px]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
              <div>
                <span className="text-xl">🍵</span>
                <h4 className="font-sans font-bold text-stone-800 text-sm mt-2">基本のおもてなしモード</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed mt-1.5 font-mono">
                  茶道の基本の作法をおさらいしながら、自分にとっての「最高の一杯」をじっくりと点てるチュートリアルモードです。
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-800 mt-3 block">黄金比率: 抹茶2杯 / 中量湯 / 2回転</span>
            </div>

            {/* ORDER (Challenge) */}
            <div
              onClick={() => selectMode('ORDER')}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col justify-between ${
                selectedMode === 'ORDER'
                  ? 'bg-amber-50/70 border-amber-800/80 shadow-md ring-2 ring-amber-800/10'
                  : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              {selectedMode === 'ORDER' && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-amber-800 rounded-full flex items-center justify-center text-white text-[10px]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
              <div>
                <span className="text-xl">👥</span>
                <h4 className="font-sans font-bold text-stone-800 text-sm mt-2">ご注文（オーダー）モード</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed mt-1.5 font-mono">
                  お茶室を訪れる3人のお客様のこだわり（アイコン表示）に合わせ、お点前の分量や作法を臨機応変に調整するゲームモードです。
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 mt-3 block">一会（3人連続もてなし） / スコア評価</span>
            </div>

          </div>

          <div className="text-center pt-4 border-t border-stone-200/60 flex justify-center">
            <button
              onClick={() => {
                audio.playChime();
                setStep('TOOLS');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 text-white font-sans font-bold px-8 py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>次へ進む（お道具の取り合わせを選ぶ）</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Tool Customization */}
      {step === 'TOOLS' && (
        <div className="mb-6 animate-in fade-in duration-200">
          <h3 className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-widest mb-2 text-center sm:text-left">
            二、 お道具の取り合わせ (2 / 2)
          </h3>
          <p className="text-[10px] text-stone-400 mb-4 text-center sm:text-left font-mono">
            ※お点前の評価（スコア）には影響いたしません。その日の「お好み」でお選びください。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            {/* Bowls Select */}
            <div>
              <span className="text-[11px] font-mono text-stone-500 block mb-2 font-bold text-left">● お茶碗を選択</span>
              <div className="flex flex-col gap-2">
                {BOWLS.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => selectBowl(b.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedBowl === b.id
                        ? 'bg-stone-100 border-amber-800'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full border-2 flex-shrink-0 shadow-inner"
                      style={{ backgroundColor: b.bgColor, borderColor: b.borderColor }}
                    />
                    <div className="min-w-0 text-left">
                      <h5 className="text-[11px] font-bold text-stone-800">{b.name}</h5>
                      <p className="text-[9px] text-stone-500 leading-tight mt-0.5">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Natsume Select */}
            <div>
              <span className="text-[11px] font-mono text-stone-500 block mb-2 font-bold text-left">● 棗（なつめ）を選択</span>
              <div className="flex flex-col gap-2">
                {NATSUMES.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => selectNatsume(n.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedNatsume === n.id
                        ? 'bg-stone-100 border-amber-800'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div
                      className="w-5 h-7 rounded-b-md rounded-t-xs border flex-shrink-0 relative shadow-sm"
                      style={{ backgroundColor: n.color }}
                    >
                      <div className="absolute bottom-1 w-full h-1" style={{ backgroundColor: n.accentColor }} />
                    </div>
                    <div className="min-w-0 text-left">
                      <h5 className="text-[11px] font-bold text-stone-800">{n.name}</h5>
                      <p className="text-[9px] text-stone-500 leading-tight mt-0.5">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="text-center pt-4 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                audio.playThud();
                setStep('MODE');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 border border-stone-300 hover:bg-stone-200 text-stone-700 font-sans font-bold px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>モード選択に戻る</span>
            </button>

            <button
              onClick={handleStart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 text-white font-sans font-bold px-8 py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>お点前（茶道シミュレーター）を開始する</span>
            </button>
          </div>
        </div>
      )}

      {/* Traditional prompt warning for No Reset */}
      <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-amber-900/60 font-mono">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>お点前中にやり直しの利かない「一期一会」の心構えでお臨みください。</span>
      </div>

    </div>
  );
};
export default TitleScreen;
