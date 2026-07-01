/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Customer, TeaMakingResult, ScoreBreakdown } from '../types';

export function evaluateTea(
  result: TeaMakingResult,
  customer: Customer | null // null means OMOTENASHI mode
): ScoreBreakdown {
  // Setup target based on mode
  const targetMatcha = customer ? customer.order.matchaCups : 2;
  const targetWater = customer ? customer.order.waterLevel : 'MEDIUM';
  const targetWhisk = customer ? customer.order.whiskType : 'PERFECT';
  const targetRotation = customer ? customer.order.serveRotation : 2;

  // 1. Matcha Score (Max 25)
  let matchaScore = 0;
  if (result.matchaCups === targetMatcha) {
    matchaScore = 25;
  } else if (result.matchaCups === 0) {
    matchaScore = 0;
  } else {
    matchaScore = 10; // slightly off
  }

  // 2. Water Score (Max 25)
  let waterScore = 0;
  const level = result.waterLevel;
  
  // Classify current level
  let currentWaterClass: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXCESSIVE' = 'LOW';
  if (level < 15) {
    currentWaterClass = 'LOW'; // too little, classified low
  } else if (level >= 15 && level <= 40) {
    currentWaterClass = 'LOW';
  } else if (level > 40 && level <= 65) {
    currentWaterClass = 'MEDIUM';
  } else if (level > 65 && level <= 90) {
    currentWaterClass = 'HIGH';
  } else {
    currentWaterClass = 'EXCESSIVE';
  }

  if (currentWaterClass === targetWater) {
    // Check if it's very close to center of zone for full points
    let isSweetSpot = false;
    if (targetWater === 'LOW' && level >= 25 && level <= 35) isSweetSpot = true;
    if (targetWater === 'MEDIUM' && level >= 48 && level <= 58) isSweetSpot = true;
    if (targetWater === 'HIGH' && level >= 73 && level <= 83) isSweetSpot = true;

    waterScore = isSweetSpot ? 25 : 20;
  } else {
    // If adjacent zone
    if (
      (targetWater === 'MEDIUM' && (currentWaterClass === 'LOW' || currentWaterClass === 'HIGH')) ||
      (targetWater === 'LOW' && currentWaterClass === 'MEDIUM') ||
      (targetWater === 'HIGH' && currentWaterClass === 'MEDIUM')
    ) {
      waterScore = 12;
    } else {
      waterScore = 5;
    }
  }

  // 3. Whisking & Bubbles Score (Max 30)
  let whiskScore = 0;
  const foamPercent = Math.min((result.whiskShakeCount / 25) * 100, 100); // 25 shakes is max
  const bubblesPopped = result.bubblePoppedCount; // 3 big bubbles are placed, click to pop
  const allBubblesPopped = result.bubblePoppedCompleted;

  if (targetWhisk === 'PERFECT') {
    // Needs high foam AND bubbles popped
    if (foamPercent >= 85 && allBubblesPopped) {
      whiskScore = 30;
    } else if (foamPercent >= 80 && bubblesPopped > 0) {
      whiskScore = 20;
    } else if (foamPercent >= 50) {
      whiskScore = 12;
    } else {
      whiskScore = 5;
    }
  } else if (targetWhisk === 'LIGHT') {
    // Needs light foam, too much whisking or popping bubbles is actually worse
    if (foamPercent >= 20 && foamPercent <= 60) {
      whiskScore = 30;
    } else if (foamPercent > 60) {
      whiskScore = 15; // over-whisked for businessman who wanted casual/light
    } else {
      whiskScore = 8;
    }
  } else {
    // NONE target (should not happen, but fallback)
    whiskScore = foamPercent < 20 ? 30 : 10;
  }

  // 4. Rotation Score (Max 20)
  let serveScore = 0;
  const rotationsNormalized = result.serveRotationClicks % 4; // click 4 times is full circle
  const targetClicksNormalized = targetRotation; // 0 or 2

  if (rotationsNormalized === targetClicksNormalized) {
    serveScore = 20;
  } else if (Math.abs(rotationsNormalized - targetClicksNormalized) === 1 || Math.abs(rotationsNormalized - targetClicksNormalized) === 3) {
    serveScore = 10; // off by 90 degrees
  } else {
    serveScore = 0; // complete wrong side
  }

  // Calculate total
  const totalScore = matchaScore + waterScore + whiskScore + serveScore;

  // Determine Rank
  let rank: 'SSS' | 'S' | 'A' | 'B' = 'B';
  if (totalScore >= 95) {
    rank = 'SSS';
  } else if (totalScore >= 75) {
    rank = 'S';
  } else if (totalScore >= 40) {
    rank = 'A';
  } else {
    rank = 'B';
  }

  // Generate appropriate comments
  let comment = '';
  if (customer) {
    if (rank === 'SSS') {
      comment = customer.satisfiedSpeech;
    } else if (rank === 'S') {
      comment = `「実に見事なお点前です！${customer.name}様も深く感心しておられますよ。」`;
    } else if (rank === 'A') {
      comment = customer.neutralSpeech;
    } else {
      comment = customer.unsatisfiedSpeech;
    }
  } else {
    // OMOTENASHI comments
    if (rank === 'SSS') {
      comment = '「お見事です！すべての作法、分量、点て方がこれ以上ない奇跡の調和を見せております。これぞ至高の一杯、極上の味わいですわ……！」';
    } else if (rank === 'S') {
      comment = '「大変素晴らしいお点前でございます。お茶碗の絵柄を避け、泡をきめ細かく整える心配り。特上の美味しさになっております。」';
    } else if (rank === 'A') {
      comment = '「日常に寄り添う、ほっとするお仕上がりです。少しのズレはありますが、おもてなしの心は十分伝わる一杯でございますよ。」';
    } else {
      comment = '「お味やお作法に、まだ少し伸び代があるようです。一期一会の心で、次はより丁寧にお道具を扱ってみましょう。」';
    }
  }

  return {
    matchaScore,
    waterScore,
    whiskScore,
    serveScore,
    totalScore,
    rank,
    comment
  };
}
