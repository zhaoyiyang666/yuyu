import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { STAGE_META, isPregnancyStage } from '../../utils/stages';
import {
  gestationalAge,
  daysUntilDue,
  estimatedFetalWeight,
  monthAge,
  predictOvulation,
  conceptionCurve,
  type ConceptionCurve as CurveData,
} from '../../utils/pregnancy';
import { ConceptionCurve } from './ConceptionCurve';

/** 首页顶部阶段状态卡 —— 随阶段状态机切换视觉与关键数据 */
export function StageHeroCard() {
  const stage = useAppStore((s) => s.stage);
  const mother = useAppStore((s) => s.mother);
  const baby = useAppStore((s) => s.baby);
  const meta = STAGE_META[stage];

  let bigNumber = meta.emoji;
  let bigUnit = '';
  let caption = meta.label;
  let detail = '';
  let curve: CurveData | null = null;

  if (stage === 'ttc') {
    if (mother.lastMenstrualPeriod) {
      const w = predictOvulation(mother.lastMenstrualPeriod, mother.cycleLength);
      curve = conceptionCurve(w.ovulationDate);
      const pct = Math.round(curve.todayProbability * 100);
      bigNumber = String(pct);
      bigUnit = '%';
      const inFertile =
        curve.todayOffset >= -5 && curve.todayOffset <= 1;
      if (curve.todayOffset === 0) {
        caption = '今日排卵 · 受孕概率峰值';
      } else if (inFertile) {
        caption = '易孕窗口 · 今日受孕概率';
      } else if (w.daysToOvulation > 0) {
        caption = `距排卵日还有 ${w.daysToOvulation} 天`;
      } else {
        caption = '本周期已排卵 · 概率回落';
      }
      detail = `易孕窗口 ${w.fertileStart} ~ ${w.fertileEnd}`;
    } else {
      caption = '备孕期 · 记录周期开启预测';
      detail = '录入末次月经即可预测排卵与受孕概率曲线';
    }
  } else if (isPregnancyStage(stage) && mother.lastMenstrualPeriod) {
    const ga = gestationalAge(mother.lastMenstrualPeriod);
    bigNumber = `${ga.weeks}`;
    bigUnit = `周 ${ga.days}天`;
    const g = estimatedFetalWeight(ga.weeks);
    caption = `宝宝约 ${g >= 1000 ? (g / 1000).toFixed(2) + 'kg' : g + 'g'}`;
    if (mother.dueDate) {
      const d = daysUntilDue(mother.dueDate);
      detail = d >= 0 ? `距预产期还有 ${d} 天 · ${mother.dueDate}` : `已过预产期 ${-d} 天`;
    }
  } else if ((stage === 'parenting' || stage === 'postpartum') && baby.birthDate) {
    const m = monthAge(baby.birthDate);
    bigNumber = `${m.months}`;
    bigUnit = `月 ${m.days}天`;
    caption = `${baby.name} · 出生 ${m.totalDays} 天`;
    detail = stage === 'postpartum' ? '产后恢复期 · 妈妈也要照顾好自己' : '养育期 · 每一天都在长大';
  } else if (stage === 'labor') {
    caption = '分娩时刻 · 记录宝宝的到来';
    detail = '录入出生信息，自动衔接产后模式';
  } else if (stage === 'paused') {
    caption = '陪伴模式';
    detail = '数据已安全归档，你可以随时重新开始';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[26px] p-6 text-white"
      style={{
        background: `linear-gradient(135deg, ${meta.accent} 0%, ${meta.accent}dd 55%, ${meta.accent}bb 100%)`,
      }}
    >
      {/* 装饰光晕 */}
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-30 blur-2xl"
        style={{ background: '#fff' }}
      />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full opacity-20 blur-3xl" style={{ background: '#fff' }} />

      <div className="relative flex items-center justify-between">
        <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-500 backdrop-blur">
          {meta.emoji} {meta.label}
        </span>
      </div>

      <div className="relative mt-5 flex items-end gap-2">
        <span className="font-serif-num text-[64px] font-700 leading-none">{bigNumber}</span>
        {bigUnit && <span className="mb-2 font-serif text-xl font-500">{bigUnit}</span>}
      </div>

      <p className="relative mt-2 text-[15px] font-500 opacity-95">{caption}</p>
      {detail && <p className="relative mt-1 text-[13px] opacity-80">{detail}</p>}

      {curve && (
        <div className="relative mt-3">
          <ConceptionCurve curve={curve} />
          <p className="mt-1 text-[11px] leading-relaxed opacity-70">
            曲线为基于周期的受孕概率估算，个体差异较大，仅供参考。
          </p>
        </div>
      )}
    </motion.div>
  );
}
