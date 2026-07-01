/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Customer } from '../types';
import { Sparkles, HelpCircle } from 'lucide-react';

interface CustomerDisplayProps {
  customer: Customer | null;
  mode: 'OMOTENASHI' | 'ORDER';
  showHint: boolean;
  setShowHint: (show: boolean) => void;
}

export const CustomerDisplay: React.FC<CustomerDisplayProps> = ({
  customer,
  mode,
  showHint,
  setShowHint
}) => {
  if (mode === 'OMOTENASHI') {
    return (
      <div id="customer-omotenashi-display" className="bg-[#fcfaf7] border border-[#e5dfd5] rounded-xl p-5 shadow-sm max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-700" />
          <h3 className="font-sans font-medium text-amber-900 text-lg">基本のおもてなし (チュートリアル)</h3>
        </div>
        <p className="text-stone-600 text-sm leading-relaxed mb-4">
          茶道の基本に忠実な「黄金比率」で最高の一杯を点てましょう。制限時間はありません。一期一会の心で、静かに丁寧にお点前を行います。
        </p>
        <div className="bg-[#f5efe6] rounded-lg p-3 border border-[#ebdcc5]">
          <h4 className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-2">目指す黄金比率:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-stone-700">
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-[#e8dfd0]">
              <span className="text-base">🍵</span>
              <span>抹茶: <strong>2杯</strong> (標準)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-[#e8dfd0]">
              <span className="text-base">💧</span>
              <span>お湯: <strong>中量</strong> (ゲージ中央)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-[#e8dfd0]">
              <span className="text-base">☁️</span>
              <span>泡立ち: <strong>完璧</strong> (きめ細かく)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-[#e8dfd0]">
              <span className="text-base">🔄</span>
              <span>作法: <strong>2回回す</strong> (正面を避ける)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div id="customer-order-display" className="bg-[#fcfaf7] border border-[#e5dfd5] rounded-xl p-5 shadow-sm max-w-md mx-auto relative overflow-hidden">
      {/* Decorative vertical stripe */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-700" />

      {/* Guest Avatar & Name */}
      <div className="flex items-start gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-[#f4ece1] border-2 border-amber-600/20 flex items-center justify-center text-3xl shadow-inner select-none">
          {customer.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium mb-1">
            {customer.role}
          </span>
          <h3 className="font-sans font-semibold text-stone-800 text-base truncate">{customer.name}</h3>
        </div>
      </div>

      {/* Greeting Bubble */}
      <div className="bg-[#f5efe6] rounded-xl p-3 border border-[#ebdcc5] relative mb-4 text-xs text-stone-700 italic leading-relaxed">
        {customer.greeting}
      </div>

      {/* Order Icons (Visual representation) */}
      <div className="border-t border-stone-200/60 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-sans font-medium text-stone-500 uppercase tracking-wider">ご要望 (オーダーマーク)</span>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-stone-400 hover:text-amber-700 transition-colors duration-150 flex items-center gap-1 text-[11px] font-medium"
            title="ヒントを表示"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>作法の手引き</span>
          </button>
        </div>

        {/* Action icons row */}
        <div className="grid grid-cols-4 gap-2">
          {/* Matcha */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 flex flex-col items-center justify-center text-center">
            <span className="text-stone-400 text-[10px] font-mono mb-1">抹茶の量</span>
            <div className="flex items-center justify-center text-base mb-1">
              🍵<span className="text-xs font-bold text-emerald-800 ml-0.5">×{customer.order.matchaCups}</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700">
              {customer.order.matchaCups === 1 ? '薄め' : customer.order.matchaCups === 2 ? '普通' : '濃茶'}
            </span>
          </div>

          {/* Water */}
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-2 flex flex-col items-center justify-center text-center">
            <span className="text-stone-400 text-[10px] font-mono mb-1">お湯の量</span>
            <div className="flex items-center justify-center text-base mb-1">
              💧<span className="text-xs font-bold text-sky-800 ml-0.5">
                {customer.order.waterLevel === 'LOW' ? '少' : customer.order.waterLevel === 'MEDIUM' ? '中' : '多'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-sky-700">
              {customer.order.waterLevel === 'LOW' ? '少なめ' : customer.order.waterLevel === 'MEDIUM' ? '中量' : 'たっぷり'}
            </span>
          </div>

          {/* Whisk */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 flex flex-col items-center justify-center text-center">
            <span className="text-stone-400 text-[10px] font-mono mb-1">泡立ち</span>
            <div className="flex items-center justify-center text-base mb-1">
              ☁️<span className="text-[10px] font-bold text-amber-800 ml-0.5">
                {customer.order.whiskType === 'LIGHT' ? '少' : '極'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-700">
              {customer.order.whiskType === 'LIGHT' ? '控えめ' : 'きめ細かく'}
            </span>
          </div>

          {/* Rotation */}
          <div className="bg-stone-50 border border-stone-200/50 rounded-lg p-2 flex flex-col items-center justify-center text-center">
            <span className="text-stone-400 text-[10px] font-mono mb-1">作法</span>
            <div className="flex items-center justify-center text-base mb-1">
              🔄<span className="text-xs font-bold text-stone-700 ml-0.5">×{customer.order.serveRotation}</span>
            </div>
            <span className="text-[10px] font-bold text-stone-600">
              {customer.order.serveRotation === 0 ? '回さず' : '2回回す'}
            </span>
          </div>
        </div>

        {/* Dynamic hint block */}
        {showHint && (
          <div className="mt-3 bg-amber-50/70 border border-amber-100 rounded-lg p-3 text-xs text-amber-900 leading-relaxed animate-fade-in">
            <strong className="block text-[11px] text-amber-800 font-bold mb-1">💡 お点前のコツ（秘密の手引き）:</strong>
            {customer.hint}
          </div>
        )}
      </div>
    </div>
  );
};
