import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Download,
  Trash2,
  RefreshCw,
  ChevronRight,
  FileText,
  Heart,
  Lock,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/appStore';
import { STAGE_META, STAGE_FLOW } from '../utils/stages';
import { CONSENT_TEXT, DISCLAIMER } from '../utils/compliance';
import type { Stage } from '../types';

export function ProfilePage() {
  const stage = useAppStore((s) => s.stage);
  const setStage = useAppStore((s) => s.setStage);
  const resetAll = useAppStore((s) => s.resetAll);
  const store = useAppStore();
  const navigate = useNavigate();
  const [showStageMgmt, setShowStageMgmt] = useState(false);

  const exportData = () => {
    const data = {
      stage: store.stage,
      mother: store.mother,
      baby: store.baby,
      healthRecords: store.healthRecords,
      careRecords: store.careRecords,
      growthRecords: store.growthRecords,
      reminders: store.reminders,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `孕语数据导出-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rows = [
    { icon: ShieldCheck, label: '健康数据授权管理', desc: '敏感数据单独授权、加密存储' },
    { icon: FileText, label: '边界同意书', desc: '记录与参考工具，不替代医疗' },
    { icon: Lock, label: '分享链接失效设置', desc: '可设置分享链接有效期' },
  ];

  return (
    <div>
      <PageHeader title="我的" subtitle="账号 · 授权 · 数据主权" />

      <Card className="flex items-center gap-4 p-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-clay-soft)]/40 text-3xl">
          🌷
        </span>
        <div className="flex-1">
          <p className="font-serif text-lg font-600 text-[var(--color-ink)]">我</p>
          <p className="text-[12px] text-[var(--color-ink-soft)]">
            {STAGE_META[stage].emoji} 当前：{STAGE_META[stage].label}
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-sage)]/10 px-2.5 py-1 text-[11px] font-500 text-[var(--color-sage)]">
          数据主体
        </span>
      </Card>

      <SectionTitle>阶段管理</SectionTitle>
      <Card className="overflow-hidden">
        <button
          onClick={() => setShowStageMgmt((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-3.5"
        >
          <RefreshCw size={18} className="text-[var(--color-clay-deep)]" />
          <span className="flex-1 text-left text-sm font-500">手动修正 / 回退阶段</span>
          <ChevronRight
            size={16}
            className={`text-[var(--color-ink-faint)] transition ${showStageMgmt ? 'rotate-90' : ''}`}
          />
        </button>
        {showStageMgmt && (
          <div className="border-t border-[var(--color-line)] p-4">
            <p className="mb-3 text-[12px] text-[var(--color-ink-soft)]">
              阶段切换不会破坏已有数据，可随时回退修正。
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STAGE_FLOW.map((s: Stage) => (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  className={`rounded-xl border px-2 py-2.5 text-[12px] transition ${
                    stage === s
                      ? 'border-[var(--color-clay)] bg-[var(--color-clay-soft)]/40 text-[var(--color-clay-deep)]'
                      : 'border-[var(--color-line)] bg-white/60 text-[var(--color-ink-soft)]'
                  }`}
                >
                  {STAGE_META[s].emoji} {STAGE_META[s].short}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStage('paused')}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] py-2.5 text-[12px] text-[var(--color-ink-soft)]"
            >
              <Heart size={13} /> 妊娠中断 · 进入陪伴模式（数据归档不删除）
            </button>
          </div>
        )}
      </Card>

      <SectionTitle>隐私与授权</SectionTitle>
      <Card className="divide-y divide-[var(--color-line)] overflow-hidden">
        {rows.map((r) => (
          <button key={r.label} className="flex w-full items-center gap-3 px-4 py-3.5">
            <r.icon size={18} className="text-[var(--color-sage)]" />
            <div className="flex-1 text-left">
              <p className="text-sm font-500 text-[var(--color-ink)]">{r.label}</p>
              <p className="text-[11px] text-[var(--color-ink-faint)]">{r.desc}</p>
            </div>
            <ChevronRight size={16} className="text-[var(--color-ink-faint)]" />
          </button>
        ))}
      </Card>

      <SectionTitle>数据主权</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={exportData}>
          <Download size={16} /> 导出数据
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm('确定重置所有数据？此操作用于演示，将清空本地记录。')) resetAll();
          }}
        >
          <Trash2 size={16} /> 重置数据
        </Button>
      </div>

      <SectionTitle>产品边界与免责</SectionTitle>
      <Card className="p-4">
        <ul className="space-y-2">
          {CONSENT_TEXT.map((t, i) => (
            <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
              <span className="text-[var(--color-clay)]">·</span>
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-lg bg-[var(--color-paper-deep)] px-3 py-2 text-[11px] text-[var(--color-ink-soft)]">
          {DISCLAIMER}
        </p>
        <button
          onClick={() => navigate('/emergency?kw=演示')}
          className="mt-3 text-[12px] text-[var(--color-danger)] underline"
        >
          查看紧急就医红线示例
        </button>
      </Card>
    </div>
  );
}
