/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'OMOTENASHI' | 'ORDER';

export type BowlType = 'KURO_RAKU' | 'SHINO' | 'GLASS';
export type NatsumeType = 'KIN_MAKIE' | '溜塗_TAMUNURI' | 'SHIRO_URUSHI';

export interface BowlConfig {
  id: BowlType;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  pattern?: string;
}

export interface NatsumeConfig {
  id: NatsumeType;
  name: string;
  description: string;
  color: string;
  accentColor: string;
}

export interface CustomerOrder {
  matchaCups: number; // Target cups (e.g. 1, 2, 3)
  waterLevel: 'LOW' | 'MEDIUM' | 'HIGH'; // Target water
  whiskType: 'LIGHT' | 'PERFECT' | 'NONE'; // Foam preference
  serveRotation: number; // Required rotations (0 or 2)
}

export interface Customer {
  id: string;
  name: string;
  role: string;
  avatar: string; // Emoji representing them
  greeting: string;
  order: CustomerOrder;
  satisfiedSpeech: string;
  neutralSpeech: string;
  unsatisfiedSpeech: string;
  hint: string;
}

export interface TeaMakingResult {
  matchaCups: number;
  waterLevel: number; // 0 to 100
  waterAccuracy: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXCESSIVE';
  whiskShakeCount: number;
  whiskCompleted: boolean;
  bubblePoppedCount: number;
  bubblePoppedCompleted: boolean;
  serveRotationClicks: number;
  isServed: boolean;
}

export interface ScoreBreakdown {
  matchaScore: number;
  waterScore: number;
  whiskScore: number;
  serveScore: number;
  totalScore: number;
  rank: 'SSS' | 'S' | 'A' | 'B';
  comment: string;
}
