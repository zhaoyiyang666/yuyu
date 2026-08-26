import type { Stage } from '../types';

/** 阶段展示元数据：名称、强调色变量、图标名 */
export interface StageMeta {
  key: Stage;
  label: string;
  short: string;
  accent: string; // CSS 颜色
  accentSoft: string;
  emoji: string;
}

export const STAGE_META: Record<Stage, StageMeta> = {
  ttc: {
    key: 'ttc',
    label: '备孕期',
    short: '备孕',
    accent: '#d99a6c',
    accentSoft: '#f0dcc9',
    emoji: '🌱',
  },
  pregnancy: {
    key: 'pregnancy',
    label: '怀孕期',
    short: '孕期',
    accent: '#c77b5a',
    accentSoft: '#e8c4b0',
    emoji: '🤰',
  },
  pregnancy_late: {
    key: 'pregnancy_late',
    label: '孕晚期 · 待产',
    short: '待产',
    accent: '#b8674a',
    accentSoft: '#e3b7a2',
    emoji: '⏳',
  },
  labor: {
    key: 'labor',
    label: '分娩',
    short: '分娩',
    accent: '#a85f40',
    accentSoft: '#ddab93',
    emoji: '🌸',
  },
  postpartum: {
    key: 'postpartum',
    label: '产后恢复',
    short: '产后',
    accent: '#4a5d4e',
    accentSoft: '#b9c6ba',
    emoji: '🌿',
  },
  parenting: {
    key: 'parenting',
    label: '育儿期',
    short: '育儿',
    accent: '#7c94a8',
    accentSoft: '#c5d2dc',
    emoji: '👶',
  },
  paused: {
    key: 'paused',
    label: '暂停 · 陪伴',
    short: '陪伴',
    accent: '#8a8078',
    accentSoft: '#d4ccc2',
    emoji: '🕊️',
  },
};

/** 阶段推进顺序（用于向导流程） */
export const STAGE_FLOW: Stage[] = [
  'ttc',
  'pregnancy',
  'pregnancy_late',
  'labor',
  'postpartum',
  'parenting',
];

export function isPregnancyStage(stage: Stage): boolean {
  return stage === 'pregnancy' || stage === 'pregnancy_late';
}

export function isBabyStage(stage: Stage): boolean {
  return stage === 'postpartum' || stage === 'parenting' || stage === 'labor';
}
