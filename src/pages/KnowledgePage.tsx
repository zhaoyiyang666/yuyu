import { useState } from 'react';
import { Info } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KnowledgeCard } from '../components/knowledge/KnowledgeCard';
import { Chip } from '../components/ui/Chip';
import { KNOWLEDGE } from '../data/knowledge';
import { STAGE_META } from '../utils/stages';
import { LEVEL_META } from '../utils/compliance';
import { useAppStore } from '../store/appStore';
import type { Stage } from '../types';

const STAGE_FILTERS: { key: Stage | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'ttc', label: '备孕' },
  { key: 'pregnancy', label: '孕期' },
  { key: 'pregnancy_late', label: '待产' },
  { key: 'postpartum', label: '产后' },
  { key: 'parenting', label: '育儿' },
];

export function KnowledgePage() {
  const currentStage = useAppStore((s) => s.stage);
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>(
    STAGE_FILTERS.some((f) => f.key === currentStage) ? currentStage : 'all'
  );
  const [levelFilter, setLevelFilter] = useState<string | 'all'>('all');

  const filtered = KNOWLEDGE.filter((a) => {
    const stageOk = stageFilter === 'all' || a.stages.includes(stageFilter);
    const levelOk = levelFilter === 'all' || a.level === levelFilter;
    return stageOk && levelOk;
  });

  return (
    <div>
      <PageHeader title="知识" subtitle="分阶段 + 月龄双维内容库，均标注来源与审核" />

      <div className="sticky top-0 z-10 -mx-4 bg-[var(--color-paper)]/95 px-4 py-2 backdrop-blur">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {STAGE_FILTERS.map((f) => (
            <Chip
              key={f.key}
              active={stageFilter === f.key}
              onClick={() => setStageFilter(f.key)}
            >
              {f.key !== 'all' && STAGE_META[f.key as Stage]?.emoji} {f.label}
            </Chip>
          ))}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <Chip active={levelFilter === 'all'} onClick={() => setLevelFilter('all')}>
            全部分级
          </Chip>
          {Object.entries(LEVEL_META).map(([key, meta]) => (
            <Chip
              key={key}
              active={levelFilter === key}
              onClick={() => setLevelFilter(key)}
              color={levelFilter === key ? undefined : meta.color}
              bg={levelFilter === key ? undefined : meta.bg}
            >
              {meta.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mb-3 mt-3 flex items-start gap-2 rounded-xl bg-[var(--color-paper-deep)] px-3 py-2.5">
        <Info size={15} className="mt-0.5 shrink-0 text-[var(--color-ink-soft)]" />
        <p className="text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
          内容分级 L0-L3，L1/L2 仅供参考不替代医生，L3（诊断/用药）为红线内容一律引导就医。
        </p>
      </div>

      <div className="space-y-3 pb-2">
        {filtered.map((a) => (
          <KnowledgeCard key={a.id} article={a} />
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--color-ink-faint)]">
            该筛选下暂无内容
          </p>
        )}
      </div>
    </div>
  );
}
