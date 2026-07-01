/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameMode, BowlType, NatsumeType, TeaMakingResult, ScoreBreakdown } from './types';
import { TitleScreen } from './components/TitleScreen';
import { CustomerDisplay } from './components/CustomerDisplay';
import { TabletopBoard } from './components/TabletopBoard';
import { ResultScreen } from './components/ResultScreen';
import { SessionResultScreen } from './components/SessionResultScreen';
import { BOWLS, NATSUMES, CUSTOMERS } from './utils/configs';
import { evaluateTea } from './utils/evaluation';
import { audio } from './utils/audio';
import { Sparkles, HelpCircle, BookOpen, ChevronRight, X, AlertCircle } from 'lucide-react';

export default function App() {
  // Game states
  const [stage, setStage] = useState<'title' | 'customer_intro' | 'playing' | 'result' | 'session_result'>('title');
  const [mode, setMode] = useState<GameMode>('OMOTENASHI');
  
  // Selected tools
  const [selectedBowl, setSelectedBowl] = useState<BowlType>('KURO_RAKU');
  const [selectedNatsume, setSelectedNatsume] = useState<NatsumeType>('KIN_MAKIE');

  // Customer session state (ORDER mode)
  const [activeCustomersList, setActiveCustomersList] = useState<typeof CUSTOMERS>(CUSTOMERS.slice(0, 3));
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
  const [sessionScores, setSessionScores] = useState<ScoreBreakdown[]>([]);
  const [showHint, setShowHint] = useState(false);

  const getRandomCustomers = (count: number) => {
    const shuffled = [...CUSTOMERS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Specifications modal state
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [activeSpecTab, setActiveSpecTab] = useState<'index' | 'overview' | 'games' | 'eval' | 'modes' | 'visual'>('index');

  // Temporary active tea cup state
  const [teaResult, setTeaResult] = useState<TeaMakingResult>({
    matchaCups: 0,
    waterLevel: 0,
    waterAccuracy: 'LOW',
    whiskShakeCount: 0,
    whiskCompleted: false,
    bubblePoppedCount: 0,
    bubblePoppedCompleted: false,
    serveRotationClicks: 0,
    isServed: false,
  });

  // Current active customer (null if OMOTENASHI)
  const activeCustomer = mode === 'ORDER' ? activeCustomersList[currentCustomerIndex] : null;

  const activeBowlConfig = BOWLS.find((b) => b.id === selectedBowl) || BOWLS[0];
  const activeNatsumeConfig = NATSUMES.find((n) => n.id === selectedNatsume) || NATSUMES[0];

  // Start the entire game session
  const handleStartGame = (gameMode: GameMode, bowlId: BowlType, natsumeId: NatsumeType) => {
    setMode(gameMode);
    setSelectedBowl(bowlId);
    setSelectedNatsume(natsumeId);
    setShowHint(false);

    if (gameMode === 'ORDER') {
      const selected = getRandomCustomers(3);
      setActiveCustomersList(selected);
      setCurrentCustomerIndex(0);
      setSessionScores([]);
      setStage('customer_intro');
    } else {
      resetCupState();
      setStage('playing');
    }
  };

  const resetCupState = () => {
    setTeaResult({
      matchaCups: 0,
      waterLevel: 0,
      waterAccuracy: 'LOW',
      whiskShakeCount: 0,
      whiskCompleted: false,
      bubblePoppedCount: 0,
      bubblePoppedCompleted: false,
      serveRotationClicks: 0,
      isServed: false,
    });
  };

  // Unified complete handler from TabletopBoard
  const handleTabletopComplete = (result: TeaMakingResult) => {
    setTeaResult(result);

    // Calculate score for this cup
    const score = evaluateTea(result, activeCustomer);

    if (mode === 'ORDER') {
      setSessionScores((prev) => [...prev, score]);
    } else {
      setSessionScores([score]);
    }

    setStage('result');
  };

  // Step helper in ORDER mode to next customer, or overall result
  const handleNextCustomer = () => {
    if (currentCustomerIndex < activeCustomersList.length - 1) {
      setCurrentCustomerIndex((prev) => prev + 1);
      resetCupState();
      setStage('customer_intro');
      audio.playChime();
    } else {
      setStage('session_result');
    }
  };

  // Retry same customer or OMOTENASHI again
  const handleRestart = () => {
    resetCupState();
    if (mode === 'ORDER') {
      // Re-initialize 3 random customers session
      const selected = getRandomCustomers(3);
      setActiveCustomersList(selected);
      setCurrentCustomerIndex(0);
      setSessionScores([]);
      setStage('customer_intro');
    } else {
      setStage('playing');
    }
    audio.playChime();
  };

  // Return back to main menu
  const handleHome = () => {
    setStage('title');
    resetCupState();
    audio.playThud();
  };

  // Specifications specifications helper
  const openSpecs = () => {
    setShowSpecsModal(true);
    audio.playThud();
  };

  return (
    <div id="app-root-wrapper" className="min-h-screen bg-[#f7f4ed] text-stone-800 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
      {/* Upper Scenic header */}
      <header className="bg-white border-b border-[#e5dfd5] py-4 px-6 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleHome}>
            <span className="text-xl">🍵</span>
            <div>
              <h1 className="font-sans font-bold text-stone-800 text-sm tracking-tight leading-none">茶道シミュレーター</h1>
              <p className="text-[10px] font-mono text-stone-400 mt-1">ー 一期一会 ー</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Spec document viewer button */}
            <button
              onClick={openSpecs}
              className="flex items-center gap-1 bg-[#fcfaf7] border border-[#d3caa7] text-stone-700 hover:bg-stone-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-800" />
              <span>茶道ゲーム仕様書を見る</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        
        {stage === 'title' && (
          <TitleScreen onStartGame={handleStartGame} />
        )}

        {/* Guest Introduction phase (ORDER mode) */}
        {stage === 'customer_intro' && activeCustomer && (
          <div className="max-w-xl mx-auto bg-white border border-[#e5dfd5] rounded-3xl p-6 md:p-8 shadow-md text-center">
            <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              客人がお茶室に入りました
            </span>
            <div className="text-5xl my-4 select-none">{activeCustomer.avatar}</div>
            <h3 className="font-sans font-bold text-stone-800 text-xl">{activeCustomer.name}</h3>
            <span className="inline-block text-xs font-mono text-stone-500 mb-4">{activeCustomer.role}</span>
            
            <div className="bg-[#f5efe6] rounded-xl p-4 text-xs italic text-stone-700 border border-[#ebdcc5] leading-relaxed max-w-md mx-auto mb-6">
              {activeCustomer.greeting}
            </div>

            {/* Display target icon indicators */}
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl max-w-sm mx-auto mb-6">
              <span className="block text-[10px] font-mono font-bold text-stone-400 tracking-wider mb-2">● ご注文内容</span>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-emerald-50 rounded p-1.5 border border-emerald-100">
                  <span className="block text-[10px] text-stone-400">抹茶</span>
                  <span className="font-bold text-emerald-800">🍵×{activeCustomer.order.matchaCups}</span>
                </div>
                <div className="bg-sky-50 rounded p-1.5 border border-sky-100">
                  <span className="block text-[10px] text-stone-400">お湯</span>
                  <span className="font-bold text-sky-800">
                    {activeCustomer.order.waterLevel === 'LOW' ? '少なめ' : activeCustomer.order.waterLevel === 'MEDIUM' ? '中量' : '多め'}
                  </span>
                </div>
                <div className="bg-amber-50 rounded p-1.5 border border-amber-100">
                  <span className="block text-[10px] text-stone-400">泡</span>
                  <span className="font-bold text-amber-800">
                    {activeCustomer.order.whiskType === 'LIGHT' ? '控えめ' : '極細'}
                  </span>
                </div>
                <div className="bg-stone-100 rounded p-1.5 border border-stone-200">
                  <span className="block text-[10px] text-stone-400">回転</span>
                  <span className="font-bold text-stone-700">
                    {activeCustomer.order.serveRotation === 0 ? '回さず' : '2回'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                resetCupState();
                setStage('playing');
                audio.playChime();
              }}
              className="inline-flex items-center gap-1 bg-amber-800 hover:bg-amber-900 text-white font-sans font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer"
            >
              <span>お点前（お茶を点てる）を始める</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active step arenas */}
        {stage === 'playing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Left/Middle Column: Interactive Tabletop board (All 4 steps integrated on a single screen) */}
            <div className="lg:col-span-2 flex flex-col justify-between">
              <TabletopBoard
                bowl={activeBowlConfig}
                natsume={activeNatsumeConfig}
                customer={activeCustomer}
                mode={mode}
                onComplete={handleTabletopComplete}
              />
            </div>

            {/* Right Column: Customer information & orders */}
            <div className="flex flex-col justify-between">
              <CustomerDisplay
                customer={activeCustomer}
                mode={mode}
                showHint={showHint}
                setShowHint={setShowHint}
              />
            </div>

          </div>
        )}

        {/* Cup Result screen */}
        {stage === 'result' && (
          <ResultScreen
            scoreBreakdown={sessionScores[sessionScores.length - 1]}
            customer={activeCustomer}
            bowl={activeBowlConfig}
            natsume={activeNatsumeConfig}
            currentCustomerIndex={currentCustomerIndex}
            totalCustomers={activeCustomersList.length}
            onNext={handleNextCustomer}
            onRestart={handleRestart}
            onHome={handleHome}
          />
        )}

        {/* Overall Tea ceremony session result screen (ORDER mode only) */}
        {stage === 'session_result' && (
          <SessionResultScreen
            customers={activeCustomersList}
            scores={sessionScores}
            onRestart={handleRestart}
            onHome={handleHome}
          />
        )}

      </main>

      {/* Elegant minimalist footer */}
      <footer className="bg-white border-t border-[#e5dfd5] py-4 text-center text-[10px] font-mono text-stone-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 茶道シミュレーター Project. All rights reserved.</span>
          <span>一期一会のおもてなしを、デジタルの畳の上で。</span>
        </div>
      </footer>

      {/* BEAUTIFUL SPECIFICATIONS DOCUMENT MODAL VIEW */}
      {showSpecsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#fcfaf7] border border-[#e5dfd5] rounded-3xl w-full max-w-3xl h-[85vh] flex flex-col justify-between overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="bg-white border-b border-stone-200 py-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-800" />
                <h3 className="font-sans font-bold text-stone-800">茶道シミュレーター設計仕様書 (spec/)</h3>
              </div>
              <button
                onClick={() => {
                  setShowSpecsModal(false);
                  audio.playThud();
                }}
                className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="bg-[#f5efe6] border-b border-stone-200 px-6 py-2 flex flex-wrap gap-2 text-xs font-mono">
              <button
                onClick={() => setActiveSpecTab('index')}
                className={`px-2.5 py-1 rounded transition-colors ${activeSpecTab === 'index' ? 'bg-amber-800 text-white font-bold' : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'}`}
              >
                目次 (Index)
              </button>
              <button
                onClick={() => setActiveSpecTab('overview')}
                className={`px-2.5 py-1 rounded transition-colors ${activeSpecTab === 'overview' ? 'bg-amber-800 text-white font-bold' : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'}`}
              >
                1. 構成概要
              </button>
              <button
                onClick={() => setActiveSpecTab('games')}
                className={`px-2.5 py-1 rounded transition-colors ${activeSpecTab === 'games' ? 'bg-amber-800 text-white font-bold' : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'}`}
              >
                2. 四工程詳細
              </button>
              <button
                onClick={() => setActiveSpecTab('eval')}
                className={`px-2.5 py-1 rounded transition-colors ${activeSpecTab === 'eval' ? 'bg-amber-800 text-white font-bold' : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'}`}
              >
                3. 評価ロジック
              </button>
              <button
                onClick={() => setActiveSpecTab('modes')}
                className={`px-2.5 py-1 rounded transition-colors ${activeSpecTab === 'modes' ? 'bg-amber-800 text-white font-bold' : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'}`}
              >
                4. ゲームモード
              </button>
              <button
                onClick={() => setActiveSpecTab('visual')}
                className={`px-2.5 py-1 rounded transition-colors ${activeSpecTab === 'visual' ? 'bg-amber-800 text-white font-bold' : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'}`}
              >
                5. 演出・音響
              </button>
            </div>

            {/* Modal Body / Styled Document */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 text-stone-700 text-xs md:text-sm leading-relaxed font-mono">
              {activeSpecTab === 'index' && (
                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-stone-800 text-base border-b border-stone-200 pb-2">【茶道シミュレーター】設計仕様書 目次</h4>
                  <p>この仕様書は、私めとあなた様が徹底的に語り合い、こだわり抜いて作成した総合ゲーム仕様書です。</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>1. 全体概要と構成 (01_overview.md)</strong> — 和風テイストのビジュアル、畳とお盆の俯瞰レイアウト、BGM定義。</li>
                    <li><strong>2. 四工程のミニゲーム詳細仕様 (02_mini_games.md)</strong> — 抹茶投入(2回)、お湯(長押しゲージ)、茶筅(シャカシャカ＆消泡)、お茶碗回転(2回)。</li>
                    <li><strong>3. 評価（リザルト）システム (03_evaluation.md)</strong> — 抹茶・お湯・泡立ち・作法の得点配分、「極上」「特上」「並」「修行中」の定義。</li>
                    <li><strong>4. ゲームモード仕様 (04_game_modes.md)</strong> — 「基本のおもてなしモード」と、4名の客人をもてなす「ご注文モード（オーダー）」の詳細。</li>
                    <li><strong>5. 演出・UI・音響詳細仕様 (05_visual_audio_specs.md)</strong> — カメラ俯瞰固定、直感的な注文アイコンUI、ASMR級に極限までこだわるお湯のピッチ低減・茶杓・消泡の音響演出。</li>
                    <li><strong>6. コレクション・一期一会仕様 (06_system_details.md)</strong> — 碗・棗の取り合わせ選択、やり直しの利かない「一期一会」システムの演出設計。</li>
                  </ul>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-stone-600 text-xs mt-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>このゲームは、上記の仕様（音響ピッチ変化・泡潰し・作法回転）を完全に忠実に再現して実装されています。</span>
                  </div>
                </div>
              )}

              {activeSpecTab === 'overview' && (
                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-stone-800 text-base border-b border-stone-200 pb-2">1. 全体概要と構成 (01_overview.md)</h4>
                  <p><strong>■ アートスタイル</strong><br />落ち着いた畳のテクスチャとお盆の光沢、お茶碗の質感。静寂を引き立てる風の音やかすかな琴の音が響きます。お湯を注ぐと美しい湯気が画面に立ち上ります。</p>
                  <p><strong>■ 俯瞰固定カメラ</strong><br />余計なズームや切り替えは行いません。お盆全体を真上から見つめる視点で完全に固定され、茶室の凛とした緊張感と静謐さを維持します。</p>
                </div>
              )}

              {activeSpecTab === 'games' && (
                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-stone-800 text-base border-b border-stone-200 pb-2">2. 四工程のミニゲーム詳細仕様 (02_mini_games.md)</h4>
                  <p><strong>① お茶の葉を入れよう！</strong><br />棗から茶杓で抹茶をすくい、お茶碗まで運んで離す。あなた様こだわりの「2回（あるいはご要望回数）」抹茶を入れる動作を繰り返します。</p>
                  <p><strong>② お湯を入れよう！</strong><br />やかんを長押ししている間だけお湯が注がれます。お湯の「適量ゲージ」を見計らってタイミングよく離します。</p>
                  <p><strong>③ お茶を点てよう！</strong><br />茶筅を上下に素早く往復ドラッグ。一定以上泡立つと、表面に大きな荒泡が浮き上がります。それを優しくタップして潰すことで、きめ細かなクリーミー泡へと仕上げます。</p>
                  <p><strong>④ お客様に出そう！</strong><br />お茶碗を時計回りに回します。2回クリックすることで正面を180度避け、相手への配慮を示します。最後に、上（奥側）に向かってドラッグすることで静かにお茶を差し出します。</p>
                </div>
              )}

              {activeSpecTab === 'eval' && (
                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-stone-800 text-base border-b border-stone-200 pb-2">3. 評価（リザルト）システム (03_evaluation.md)</h4>
                  <p>おもてなしの出来栄えに基づき、100点満点で厳格かつ温かく採点します。</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>抹茶の量 (25点)</strong> — ご要望通りの杯数で25点満点。</li>
                    <li><strong>お湯の加減 (25点)</strong> — ゲージの指定ゾーンの中心付近で25点満点。</li>
                    <li><strong>泡立ちと仕上げ (30点)</strong> — 十分なシャカシャカ ＋ 荒い泡の消泡完了で30点満点。</li>
                    <li><strong>作法 (20点)</strong> — お茶碗を正確な方向（例: 2回回転）に向けて差し出すことで20点満点。</li>
                  </ul>
                  <p className="mt-2 font-bold text-amber-900">【格付けスタンプ】<br />・SSS 極上 (95点〜)<br />・S 特上 (75点〜)<br />・A 並 (40点〜)<br />・B 修行中 (39点以下)</p>
                </div>
              )}

              {activeSpecTab === 'modes' && (
                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-stone-800 text-base border-b border-stone-200 pb-2">4. ゲームモード仕様 (04_game_modes.md)</h4>
                  <p><strong>■ おもてなしモード</strong><br />伝統作法通り、抹茶2杯、適量湯、2回転で「SSS 極上」を追求する一人用じっくりチュートリアル。</p>
                  <p><strong>■ ご注文（オーダー）モード</strong><br />3名のお客様が順番にお席へ入ります。それぞれのこだわりを視覚的な「注文マーク」から読み解き、要望にぴったり一致するお点前をやり直しなしで提供し、最終的なもてなし満足度を競います。</p>
                </div>
              )}

              {activeSpecTab === 'visual' && (
                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-stone-800 text-base border-b border-stone-200 pb-2">5. 演出・UI・音響詳細仕様 (05_visual_audio_specs.md)</h4>
                  <p><strong>■ ASMRリアル音響</strong><br />Web Audio APIのリアルタイム合成を完全に搭載しました！</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>茶杓の摩擦音（サクッ）</li>
                    <li>抹茶の落下音（トサッ）</li>
                    <li><strong>お湯のピッチ変化</strong>（お湯が溜まるにつれて音が徐々に低音に変化します！）</li>
                    <li>茶筅のシャカシャカ（スワイプ速度連動）</li>
                    <li>荒い泡の消泡音（タップ時のシュワァ音）</li>
                    <li>お茶碗のコトッ音、畳を滑るスゥー音</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-stone-200 py-3 px-6 flex justify-end">
              <button
                onClick={() => {
                  setShowSpecsModal(false);
                  audio.playThud();
                }}
                className="bg-stone-800 hover:bg-stone-900 text-white font-sans text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
              >
                了解いたしました
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
