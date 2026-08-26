import { CalendarHeart, Egg, Droplets, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { predictOvulation } from '../../utils/pregnancy';
import { Card } from '../ui/Card';

function fmt(d: string) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
}

/** 备孕期：由末次月经 + 平均周期长度推断排卵日 / 易孕期 / 下次月经 */
export function OvulationCard() {
  const mother = useAppStore((s) => s.mother);

  if (!mother.lastMenstrualPeriod) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-clay-soft)]/40 text-[var(--color-clay-deep)]">
          <CalendarHeart size={20} />
        </span>
        <p className="text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
          还没有月经记录。点击上方「月经记录」录入末次月经第一天，即可自动推断排卵期与易孕窗口。
        </p>
      </Card>
    );
  }

  const w = predictOvulation(mother.lastMenstrualPeriod, mother.cycleLength);
  const today = new Date().toISOString().slice(0, 10);
  const inFertile = today >= w.fertileStart && today <= w.fertileEnd;

  const rows = [
    { icon: Egg, label: '排卵日', value: fmt(w.ovulationDate), color: '#c77b5a' },
    {
      icon: Sparkles,
      label: '易孕窗口',
      value: `${fmt(w.fertileStart)} ~ ${fmt(w.fertileEnd)}`,
      color: '#4a5d4e',
    },
    { icon: Droplets, label: '下次月经', value: fmt(w.nextPeriod), color: '#7c94a8' },
  ];

  return (
    <Card className="overflow-hidden p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-serif text-lg font-600 text-[var(--color-ink)]">排卵期推断</p>
          <p className="mt-0.5 text-[11px] text-[var(--color-ink-faint)]">
            基于末次月经 {fmt(mother.lastMenstrualPeriod)} · 周期 {mother.cycleLength} 天
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-500 ${
            inFertile
              ? 'bg-[var(--color-clay)] text-white'
              : w.daysToOvulation >= 0
                ? 'bg-[var(--color-sage)]/10 text-[var(--color-sage)]'
                : 'bg-[var(--color-paper-deep)] text-[var(--color-ink-soft)]'
          }`}
        >
          {inFertile
            ? '易孕期'
            : w.daysToOvulation > 0
              ? `距排卵 ${w.daysToOvulation} 天`
              : w.daysToOvulation === 0
                ? '今日排卵'
                : '本周期已排卵'}
        </span>
      </div>

      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: r.color + '1f', color: r.color }}
            >
              <r.icon size={16} strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-[13px] text-[var(--color-ink-soft)]">{r.label}</span>
            <span className="font-serif-num text-[15px] font-600 text-[var(--color-ink)]">
              {r.value}
            </span>
          </div>
        ))}
      </div>

      {inFertile && (
        <p className="mt-4 rounded-lg bg-[var(--color-clay-soft)]/30 px-3 py-2 text-[12px] leading-relaxed text-[var(--color-clay-deep)]">
          正处于易孕窗口，受孕概率较高。以上为基于周期的估算，仅供参考。
        </p>
      )}
      {!inFertile && (
        <p className="mt-4 text-[11px] leading-relaxed text-[var(--color-ink-faint)]">
          排卵与易孕期为基于周期长度的估算（黄体期约 14 天），个体差异较大，仅供参考。
        </p>
      )}
    </Card>
  );
}
