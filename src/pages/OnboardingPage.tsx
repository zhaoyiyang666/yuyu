import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/appStore';
import { STAGE_META } from '../utils/stages';
import { CONSENT_TEXT } from '../utils/compliance';
import type { Stage } from '../types';

const CHOOSABLE: Stage[] = ['ttc', 'pregnancy', 'postpartum', 'parenting'];

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [stage, setStage] = useState<Stage>('ttc');
  const [lmp, setLmp] = useState('');
  const [birth, setBirth] = useState('');
  const complete = useAppStore((s) => s.completeOnboarding);
  const confirmPregnancy = useAppStore((s) => s.confirmPregnancy);
  const recordBirth = useAppStore((s) => s.recordBirth);
  const navigate = useNavigate();

  const finish = () => {
    if (stage === 'pregnancy' && lmp) {
      complete({ lastMenstrualPeriod: lmp }, 'pregnancy');
      confirmPregnancy(lmp);
    } else if ((stage === 'parenting' || stage === 'postpartum') && birth) {
      recordBirth({ name: '宝宝', birthDate: birth });
      complete({}, stage);
    } else {
      complete(lmp ? { lastMenstrualPeriod: lmp } : {}, stage);
    }
    navigate('/');
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[var(--color-paper)] px-6 pt-[calc(env(safe-area-inset-top)+48px)] pb-10">
      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col">
          <span className="text-5xl">🌷</span>
          <h1 className="mt-6 font-serif text-[32px] font-700 leading-tight text-[var(--color-ink)]">
            孕语
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            陪伴你从备孕到宝宝 2 岁，
            <br />
            一个账号，记录、预测、提醒、知识一站式。
          </p>

          <div className="mt-8 flex-1 space-y-3">
            {(
              [
                ['🌱', '备孕', '排卵预测 · 备孕打卡'],
                ['🤰', '孕期', '孕周中心 · 产检提醒'],
                ['🌿', '产后', '恢复计划 · 情绪自测'],
                ['👶', '育儿', '喂养睡眠 · 成长曲线'],
              ] as const
            ).map(([e, t, d], i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-white/60 p-4"
              >
                <span className="text-2xl">{e}</span>
                <div>
                  <p className="text-sm font-600 text-[var(--color-ink)]">{t}</p>
                  <p className="text-[12px] text-[var(--color-ink-faint)]">{d}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Button size="lg" className="mt-6 w-full" onClick={() => setStep(1)}>
            开始使用
          </Button>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-1 flex-col">
          <div className="mb-2 flex items-center gap-2 text-[var(--color-sage)]">
            <ShieldCheck size={20} />
            <span className="font-serif text-lg font-600">授权与边界同意</span>
          </div>
          <p className="text-[13px] text-[var(--color-ink-soft)]">开始前，请阅读并同意以下条款。</p>

          <div className="mt-5 flex-1 space-y-3">
            {CONSENT_TEXT.map((t, i) => (
              <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-white/60 p-4 text-[13px] leading-relaxed text-[var(--color-ink)]">
                {t}
              </div>
            ))}
          </div>

          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            onClick={() => setAgreed((v) => !v)}
            className="mt-5 flex items-center gap-3 rounded-2xl bg-[var(--color-paper-deep)] p-4"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${
                agreed
                  ? 'border-[var(--color-sage)] bg-[var(--color-sage)] text-white'
                  : 'border-[var(--color-line)] text-transparent'
              }`}
            >
              <Check size={14} strokeWidth={3} />
            </span>
            <span className="text-left text-[13px] font-500 text-[var(--color-ink)]">
              我已阅读并同意《健康数据授权》与《产品边界同意书》
            </span>
          </button>

          <Button size="lg" className="mt-4 w-full" disabled={!agreed} onClick={() => setStep(2)}>
            同意并继续
          </Button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-1 flex-col">
          <h2 className="font-serif text-xl font-600 text-[var(--color-ink)]">你现在处于哪个阶段？</h2>
          <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">系统将据此定位你的首页中心，随时可调整。</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {CHOOSABLE.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`flex flex-col items-start gap-2 rounded-2xl border p-4 transition ${
                  stage === s
                    ? 'border-[var(--color-clay)] bg-[var(--color-clay-soft)]/30'
                    : 'border-[var(--color-line)] bg-white/60'
                }`}
              >
                <span className="text-3xl">{STAGE_META[s].emoji}</span>
                <span className="text-sm font-600 text-[var(--color-ink)]">{STAGE_META[s].label}</span>
              </button>
            ))}
          </div>

          {stage === 'pregnancy' && (
            <div className="mt-5">
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
          )}
          {(stage === 'parenting' || stage === 'postpartum') && (
            <div className="mt-5">
              <label className="mb-1 block text-[13px] font-500 text-[var(--color-ink-soft)]">
                宝宝出生日期
              </label>
              <input
                type="date"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-line)] bg-white/70 px-3.5 py-3 outline-none focus:border-[var(--color-clay)]"
              />
            </div>
          )}

          <div className="flex-1" />
          <Button
            size="lg"
            className="mt-6 w-full"
            disabled={
              (stage === 'pregnancy' && !lmp) ||
              ((stage === 'parenting' || stage === 'postpartum') && !birth)
            }
            onClick={finish}
          >
            进入孕语
          </Button>
        </motion.div>
      )}
    </div>
  );
}
