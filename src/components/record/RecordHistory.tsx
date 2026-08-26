import { useAppStore } from '../../store/appStore';
import { Card } from '../ui/Card';

const TYPE_LABEL: Record<string, string> = {
  weight: '体重',
  fetalMovement: '胎动',
  contraction: '宫缩',
  cycle: '月经',
  bbt: '基础体温',
  symptom: '症状',
  feeding: '喂养',
  sleep: '睡眠',
  diaper: '尿布',
};

function summarize(payload: Record<string, number | string | boolean>): string {
  return Object.entries(payload)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}

/** 合并展示健康记录与日常记录历史 */
export function RecordHistory() {
  const health = useAppStore((s) => s.healthRecords);
  const care = useAppStore((s) => s.careRecords);
  const members = useAppStore((s) => s.members);

  const all = [...health, ...care].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  if (all.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-[var(--color-ink-faint)]">
        暂无历史记录
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-[var(--color-line)] overflow-hidden">
      {all.slice(0, 30).map((r) => {
        const who = members.find((m) => m.id === r.byMemberId);
        return (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3">
            <span className="text-lg">{who?.avatar ?? '🌷'}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-500 text-[var(--color-ink)]">
                {TYPE_LABEL[r.type] ?? r.type}
              </p>
              <p className="truncate text-[12px] text-[var(--color-ink-soft)]">
                {summarize(r.payload)}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-[var(--color-ink-faint)]">
              {new Date(r.recordedAt).toLocaleString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        );
      })}
    </Card>
  );
}
