import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { RecordSheet } from '../components/record/RecordSheet';
import { WeightChart } from '../components/record/WeightChart';
import { OvulationCard } from '../components/record/OvulationCard';
import { RecordHistory } from '../components/record/RecordHistory';
import { useAppStore } from '../store/appStore';
import { isPregnancyStage, isBabyStage } from '../utils/stages';
import type { CareRecordType, HealthRecordType, Stage } from '../types';

interface RecordDef {
  key: string;
  domain: 'health' | 'care';
  label: string;
  emoji: string;
  fields: {
    key: string;
    label: string;
    type: 'number' | 'text' | 'select' | 'date';
    unit?: string;
    options?: string[];
    placeholder?: string;
    defaultValue?: string;
  }[];
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const HEALTH_DEFS: Record<string, RecordDef> = {
  cycle: {
    key: 'cycle', domain: 'health', label: '月经记录', emoji: '💧',
    fields: [
      { key: 'startDate', label: '本次月经第一天', type: 'date', defaultValue: todayStr() },
      { key: 'cycleLength', label: '平均周期长度', type: 'number', unit: '天', placeholder: '28' },
      { key: 'flow', label: '经量', type: 'select', options: ['少', '中', '多'] },
    ],
  },
  bbt: {
    key: 'bbt', domain: 'health', label: '基础体温', emoji: '🌡️',
    fields: [{ key: 'value', label: '体温', type: 'number', unit: '°C', placeholder: '36.50' }],
  },
  weight: {
    key: 'weight', domain: 'health', label: '体重记录', emoji: '⚖️',
    fields: [{ key: 'value', label: '体重', type: 'number', unit: 'kg', placeholder: '58.0' }],
  },
  fetalMovement: {
    key: 'fetalMovement', domain: 'health', label: '胎动计数', emoji: '👣',
    fields: [{ key: 'count', label: '一小时胎动次数', type: 'number', unit: '次', placeholder: '3' }],
  },
  contraction: {
    key: 'contraction', domain: 'health', label: '宫缩记录', emoji: '⏱️',
    fields: [
      { key: 'duration', label: '持续时长', type: 'number', unit: '秒', placeholder: '40' },
      { key: 'interval', label: '间隔', type: 'number', unit: '分钟', placeholder: '10' },
    ],
  },
  symptom: {
    key: 'symptom', domain: 'health', label: '症状记录', emoji: '📝',
    fields: [{ key: 'note', label: '身体感受', type: 'text', placeholder: '如：轻微水肿、腰酸' }],
  },
};

const CARE_DEFS: Record<string, RecordDef> = {
  feeding: {
    key: 'feeding', domain: 'care', label: '喂养记录', emoji: '🍼',
    fields: [
      { key: 'type', label: '方式', type: 'select', options: ['母乳左', '母乳右', '奶粉', '辅食'] },
      { key: 'amount', label: '奶量/时长', type: 'number', unit: 'ml或分钟', placeholder: '120' },
    ],
  },
  sleep: {
    key: 'sleep', domain: 'care', label: '睡眠记录', emoji: '🌙',
    fields: [{ key: 'hours', label: '睡眠时长', type: 'number', unit: '小时', placeholder: '2.5' }],
  },
  diaper: {
    key: 'diaper', domain: 'care', label: '尿布记录', emoji: '👶',
    fields: [{ key: 'kind', label: '类型', type: 'select', options: ['尿', '便便', '混合'] }],
  },
};

function defsForStage(stage: Stage): RecordDef[] {
  if (stage === 'ttc') return [HEALTH_DEFS.cycle, HEALTH_DEFS.bbt, HEALTH_DEFS.weight];
  if (isPregnancyStage(stage))
    return [
      HEALTH_DEFS.weight,
      HEALTH_DEFS.fetalMovement,
      HEALTH_DEFS.contraction,
      HEALTH_DEFS.symptom,
    ];
  if (isBabyStage(stage)) return [CARE_DEFS.feeding, CARE_DEFS.sleep, CARE_DEFS.diaper];
  return [HEALTH_DEFS.weight];
}

export function RecordPage() {
  const stage = useAppStore((s) => s.stage);
  const addHealth = useAppStore((s) => s.addHealthRecord);
  const addCare = useAppStore((s) => s.addCareRecord);
  const updateMother = useAppStore((s) => s.updateMother);
  const [params] = useSearchParams();
  const focus = params.get('focus');

  const defs = defsForStage(stage);
  const initial = defs.find((d) => d.key === focus) ?? null;
  const [active, setActive] = useState<RecordDef | null>(initial);

  const handleSubmit = (payload: Record<string, number | string | boolean>) => {
    if (!active) return;
    if (active.domain === 'health') addHealth(active.key as HealthRecordType, payload);
    else addCare(active.key as CareRecordType, payload);

    // 月经记录：以末次月经日期 + 周期长度推断排卵期
    if (active.key === 'cycle') {
      const patch: { lastMenstrualPeriod?: string; cycleLength?: number } = {};
      if (typeof payload.startDate === 'string') patch.lastMenstrualPeriod = payload.startDate;
      if (typeof payload.cycleLength === 'number' && payload.cycleLength > 0) {
        patch.cycleLength = payload.cycleLength;
      }
      if (patch.lastMenstrualPeriod || patch.cycleLength) updateMother(patch);
    }
  };

  return (
    <div>
      <PageHeader title="记录" subtitle="按当前阶段聚合的记录入口与历史" />

      <SectionTitle>快速录入</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {defs.map((d) => (
          <Card key={d.key} onClick={() => setActive(d)} className="flex items-center gap-3 p-4">
            <span className="text-2xl">{d.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-500 text-[var(--color-ink)]">{d.label}</p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-clay-soft)]/40 text-[var(--color-clay-deep)]">
              <Plus size={16} />
            </span>
          </Card>
        ))}
      </div>

      {stage === 'ttc' && (
        <>
          <SectionTitle>排卵期推断</SectionTitle>
          <OvulationCard />
        </>
      )}

      <SectionTitle>数据趋势</SectionTitle>
      <WeightChart />

      <SectionTitle>历史记录</SectionTitle>
      <RecordHistory />

      <RecordSheet
        open={!!active}
        title={active?.label ?? ''}
        fields={active?.fields ?? []}
        onClose={() => setActive(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
