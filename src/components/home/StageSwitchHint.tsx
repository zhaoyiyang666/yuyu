import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { Stage } from '../../types';
import { gestationalAge } from '../../utils/pregnancy';

/** 首页阶段切换提示条：在关键节点提示用户可推进阶段（可回退，不破坏数据） */
export function StageSwitchHint() {
  const stage = useAppStore((s) => s.stage);
  const mother = useAppStore((s) => s.mother);
  const navigate = useNavigate();

  let hint: { text: string; cta: string; target: Stage } | null = null;

  if (stage === 'ttc') {
    hint = { text: '验孕阳性了？确认后进入孕期中心', cta: '我怀孕了', target: 'pregnancy' };
  } else if (stage === 'pregnancy' && mother.lastMenstrualPeriod) {
    const ga = gestationalAge(mother.lastMenstrualPeriod);
    if (ga.weeks >= 28) {
      hint = { text: '已进入孕晚期，开启待产模式预演', cta: '开启待产', target: 'pregnancy_late' };
    }
  } else if (stage === 'pregnancy_late') {
    hint = { text: '宝宝要出生了？录入出生信息', cta: '记录出生', target: 'labor' };
  } else if (stage === 'postpartum') {
    hint = { text: '产后 42 天后，宝宝档案成为主视角', cta: '进入育儿', target: 'parenting' };
  }

  if (!hint) return null;

  return (
    <button
      onClick={() => navigate('/stage-switch')}
      className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-dashed border-[var(--color-clay)]/50 bg-[var(--color-clay-soft)]/25 px-4 py-3 text-left active:scale-[0.99]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-clay)]/15 text-[var(--color-clay-deep)]">
        <Sparkles size={16} />
      </span>
      <span className="flex-1 text-[13px] font-500 text-[var(--color-ink)]">{hint.text}</span>
      <span className="flex items-center gap-1 text-[12px] font-600 text-[var(--color-clay-deep)]">
        {hint.cta} <ArrowRight size={14} />
      </span>
    </button>
  );
}
