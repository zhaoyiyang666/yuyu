// 孕语 · 领域计算逻辑：孕周 / 排卵 / 月龄

const DAY = 1000 * 60 * 60 * 24;

export function daysBetween(from: string | Date, to: string | Date = new Date()): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.floor((b - a) / DAY);
}

/** 由末次月经计算孕周（gestational age），返回 { weeks, days, totalDays } */
export function gestationalAge(lmp: string): { weeks: number; days: number; totalDays: number } {
  const total = Math.max(0, daysBetween(lmp));
  return { weeks: Math.floor(total / 7), days: total % 7, totalDays: total };
}

/** 由末次月经推算预产期（Naegele 规则：LMP + 280 天） */
export function estimatedDueDate(lmp: string): string {
  const d = new Date(lmp);
  d.setDate(d.getDate() + 280);
  return d.toISOString().slice(0, 10);
}

/** 距预产期剩余天数 */
export function daysUntilDue(dueDate: string): number {
  return daysBetween(new Date(), dueDate);
}

/** 胎儿约重（g）粗略参考曲线，仅用于展示 */
export function estimatedFetalWeight(weeks: number): number {
  if (weeks < 8) return 1;
  // 简化的经验拟合，非医疗数据
  const table: Record<number, number> = {
    8: 1, 12: 14, 16: 100, 20: 300, 24: 600, 28: 1000,
    32: 1700, 36: 2600, 40: 3400,
  };
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  let lo = keys[0];
  let hi = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (weeks >= keys[i] && weeks <= keys[i + 1]) {
      lo = keys[i];
      hi = keys[i + 1];
      break;
    }
  }
  if (weeks <= lo) return table[lo];
  if (weeks >= hi) return table[hi];
  const ratio = (weeks - lo) / (hi - lo);
  return Math.round(table[lo] + (table[hi] - table[lo]) * ratio);
}

/** 排卵与易孕期预测：基于末次月经 + 平均周期长度 */
export interface OvulationWindow {
  ovulationDate: string;
  fertileStart: string;
  fertileEnd: string;
  nextPeriod: string;
  daysToOvulation: number;
}

export function predictOvulation(lmp: string, cycleLength: number): OvulationWindow {
  const start = new Date(lmp);
  // 黄体期固定约 14 天：排卵日 = 下次月经前 14 天
  const ovulation = new Date(start);
  ovulation.setDate(ovulation.getDate() + cycleLength - 14);
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  const nextPeriod = new Date(start);
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
  return {
    ovulationDate: ovulation.toISOString().slice(0, 10),
    fertileStart: fertileStart.toISOString().slice(0, 10),
    fertileEnd: fertileEnd.toISOString().slice(0, 10),
    nextPeriod: nextPeriod.toISOString().slice(0, 10),
    daysToOvulation: daysBetween(new Date(), ovulation),
  };
}

/**
 * 相对排卵日的单日受孕概率（offset < 0 为排卵前）。
 * 经验值参考 Wilcox 等生育力研究：概率在排卵前 2 天至排卵日达到峰值，
 * 排卵后急剧下降（卵子存活约 24 小时）。仅供展示参考，非医疗数据。
 */
export function conceptionProbabilityForOffset(offset: number): number {
  const table: Record<number, number> = {
    [-5]: 0.1,
    [-4]: 0.16,
    [-3]: 0.14,
    [-2]: 0.27,
    [-1]: 0.31,
    [0]: 0.33,
    [1]: 0.08,
  };
  if (offset in table) return table[offset];
  if (offset < -5) return 0.03; // 易孕窗口之前，精子存活有限
  return 0.01; // 排卵一天以后基本无受孕机会
}

export interface ConceptionPoint {
  offset: number; // 相对排卵日的天数（负=排卵前）
  date: string; // ISO date
  probability: number; // 0-1 当日同房的相对受孕概率
  isToday: boolean;
}

export interface ConceptionCurve {
  points: ConceptionPoint[];
  todayOffset: number; // 今日相对排卵日的天数
  todayProbability: number; // 今日受孕概率
  peakOffset: number; // 峰值所在偏移
}

/**
 * 生成以排卵日为中心的受孕概率曲线（默认窗口 -6 ~ +2 天），并标注今日位置。
 */
export function conceptionCurve(
  ovulationDate: string,
  range: [number, number] = [-6, 2]
): ConceptionCurve {
  const ov = new Date(ovulationDate);
  const todayOffset = daysBetween(ovulationDate, new Date()); // 今日 - 排卵日
  const points: ConceptionPoint[] = [];
  let peakOffset = range[0];
  let peakProb = -1;
  for (let o = range[0]; o <= range[1]; o++) {
    const d = new Date(ov);
    d.setDate(d.getDate() + o);
    const probability = conceptionProbabilityForOffset(o);
    if (probability > peakProb) {
      peakProb = probability;
      peakOffset = o;
    }
    points.push({
      offset: o,
      date: d.toISOString().slice(0, 10),
      probability,
      isToday: o === todayOffset,
    });
  }
  return {
    points,
    todayOffset,
    todayProbability: conceptionProbabilityForOffset(todayOffset),
    peakOffset,
  };
}

/** 由出生日期计算月龄，返回 { months, days } */
export function monthAge(birthDate: string): { months: number; days: number; totalDays: number } {
  const birth = new Date(birthDate);
  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  const anchor = new Date(birth);
  anchor.setMonth(anchor.getMonth() + months);
  const days = daysBetween(anchor, now);
  return { months: Math.max(0, months), days, totalDays: daysBetween(birth, now) };
}

/** 孕期建议增重区间（kg），基于孕前 BMI 分档（仅供参考） */
export function recommendedWeightGain(prePregnancyKg: number, heightCm: number): [number, number] {
  const bmi = prePregnancyKg / ((heightCm / 100) * (heightCm / 100));
  if (bmi < 18.5) return [12.5, 18];
  if (bmi < 25) return [11.5, 16];
  if (bmi < 30) return [7, 11.5];
  return [5, 9];
}
