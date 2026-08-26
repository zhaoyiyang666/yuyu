import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/appStore';
import { STAGE_META } from '../utils/stages';
import { gestationalAge } from '../utils/pregnancy';
import type { Stage } from '../types';

/** 阶段切换向导：确认 + 表单引导 + 可回退，不破坏已有数据 */
export function StageSwitchPage() {
  const stage = useAppStore((s) => s.stage);
  const mother = useAppStore((s) => s.mother);
  const setStage = useAppStore((s) => s.setStage);
  const confirmPregnancy = useAppStore((s) => s.confirmPregnancy);
  const recordBirth = useAppStore((s) => s.recordBirth);
  const navigate = useNavigate();

  const [lmp, setLmp] = useState(mother.lastMenstrualPeriod ?? '');
  const [birth, setBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');

  // 决定目标阶段
  let target: Stage = 'pregnancy';
  if (stage === 'pregnancy') {
    const ga = mother.lastMenstrualPeriod ? gestationalAge(mother.lastMenstrualPeriod) : null;
    target = ga && ga.weeks >= 28 ? 'pregnancy_late' : 'pregnancy_late';
  } else if (stage === 'pregnancy_late') target = 'labor';
  else if (stage === 'postpartum') target = 'parenting';

  const from = STAGE_META[stage];
  const to = STAGE_META[target];

  const doSwitch = () => {
    if (stage === 'ttc') {
      if (lmp) confirmPregnancy(lmp);
    } else if (stage === 'pregnancy') {
      setStage('pregnancy_late');
    } else if (stage === 'pregnancy_late') {
      recordBirth({
        name: '宝宝',
        birthDate: birth || new Date().toISOString().slice(0, 10),
        birthWeight: weight ? Number(weight) : undefined,
        birthLength: length ? Number(length) : undefined,
      });
    } else if (stage === 'postpartum') {
      setStage('parenting');
    }
    navigate('/');
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[var(--color-paper)] px-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-10">
      <button onClick={() => navigate(-1)} className="mb-4 self-end text-[var(--color-ink-faint)]">
        <X size={22} />
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col">
        <div className="flex items-center justify-center gap-4 py-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl grayscale">{from.emoji}</span>
            <span className="text-[12px] text-[var(--color-ink-faint)]">{from.short}</span>
          </div>
          <ArrowRight className="text-[var(--color-clay)]" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl">{to.emoji}</span>
            <span className="text-[13px] font-600 text-[var(--color-clay-deep)]">{to.short}</span>
          </div>
        </div>

        <h1 className="text-center font-serif text-2xl font-700 text-[var(--color-ink)]">
          确认进入{to.label}
        </h1>

        <div className="mt-6 flex-1 space-y-4">
          {stage === 'ttc' && (
            <>
              <p className="text-center text-[13px] text-[var(--color-ink-soft)]">
                恭喜！确认后首页将切换为孕周中心，排卵预测会自动隐藏。
              </p>
              <div>
                <label className="mb-1 block text-[13px] font-500 text-[var(--color-ink-soft)]">
                  末次月经第一天
                </label>
                <input
                  type="date"
                  value={lmp}
                  onChange={(e) => setLmp(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-white/70 px-3.5 py-3 outline-none focus:border-[var(--color-clay)]"
                />
              </div>
            </>
          )}

          {stage === 'pregnancy' && (
            <p className="text-center text-[13px] text-[var(--color-ink-soft)]">
              开启待产模式后，宫缩计时器、待产包清单与产程引导将与孕周中心并行展示。
            </p>
          )}

          {stage === 'pregnancy_late' && (
            <>
              <p className="text-center text-[13px] text-[var(--color-ink-soft)]">
                记录宝宝的出生信息，孕周档案将自动归档可查，日常记录以「宝宝」为主体持续沿用。
              </p>
              <div>
                <label className="mb-1 block text-[13px] font-500 text-[var(--color-ink-soft)]">出生日期</label>
                <input
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-line)] bg-white/70 px-3.5 py-3 outline-none focus:border-[var(--color-clay)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[13px] font-500 text-[var(--color-ink-soft)]">
                    体重 (g)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="3200"
                    className="w-full rounded-xl border border-[var(--color-line)] bg-white/70 px-3.5 py-3 outline-none focus:border-[var(--color-clay)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-500 text-[var(--color-ink-soft)]">
                    身长 (cm)
                  </label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="50"
                    className="w-full rounded-xl border border-[var(--color-line)] bg-white/70 px-3.5 py-3 outline-none focus:border-[var(--color-clay)]"
                  />
                </div>
              </div>
            </>
          )}

          {stage === 'postpartum' && (
            <p className="text-center text-[13px] text-[var(--color-ink-soft)]">
              进入育儿期后，宝宝档案将成为主视角，妈妈恢复模块仍保留入口。
            </p>
          )}
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={stage === 'ttc' && !lmp}
          onClick={doSwitch}
        >
          确认切换
        </Button>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 flex items-center justify-center gap-2 py-2 text-[13px] text-[var(--color-ink-soft)]"
        >
          <RotateCcw size={14} /> 暂不切换，稍后再说
        </button>
      </motion.div>
    </div>
  );
}
