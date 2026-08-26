import type { KnowledgeArticle } from '../../types';
import { LEVEL_META } from '../../utils/compliance';
import { Card } from '../ui/Card';
import { ShieldCheck } from 'lucide-react';

export function KnowledgeCard({ article }: { article: KnowledgeArticle }) {
  const lv = LEVEL_META[article.level];
  const needsDisclaimer = article.level === 'L1' || article.level === 'L2';

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2">
        <span
          className="rounded-md px-2 py-0.5 text-[11px] font-600"
          style={{ color: lv.color, backgroundColor: lv.bg }}
        >
          {lv.label}
        </span>
        {article.monthAge && (
          <span className="text-[11px] text-[var(--color-ink-faint)]">
            {article.monthAge[0]}-{article.monthAge[1]} 月龄
          </span>
        )}
      </div>

      <h3 className="font-serif text-[16px] font-600 leading-snug text-[var(--color-ink)]">
        {article.title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
        {article.summary}
      </p>

      {needsDisclaimer && (
        <p className="mt-2 rounded-lg bg-[var(--color-paper-deep)] px-2.5 py-1.5 text-[11px] text-[var(--color-ink-soft)]">
          仅供参考，不替代医生诊断
        </p>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--color-ink-faint)]">
        <ShieldCheck size={13} strokeWidth={1.8} />
        <span>
          来源：{article.source}
          {article.reviewer && ` · ${article.reviewer} 审核 · ${article.reviewedAt}`}
        </span>
      </div>
    </Card>
  );
}
