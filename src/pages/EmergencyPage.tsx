import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, AlertTriangle, ArrowLeft } from 'lucide-react';

/** 急症红线全屏页：命中急症关键词强制展示就医指引，优先于一切推荐逻辑 */
export function EmergencyPage() {
  const [params] = useSearchParams();
  const kw = params.get('kw') ?? '紧急情况';
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex w-full max-w-[480px] flex-col bg-[var(--color-danger-bg)] px-6 pt-[calc(env(safe-area-inset-top)+40px)] pb-10 text-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15"
        >
          <AlertTriangle size={40} strokeWidth={2} />
        </motion.span>

        <h1 className="mt-6 font-serif text-[28px] font-700 leading-tight">
          请立即就医
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/90">
          你描述的「{kw}」可能是紧急状况。
          <br />
          本产品不提供任何自我处理或安抚建议，
          <br />
          请立刻联系医生或前往最近的医院急诊。
        </p>

        <div className="mt-8 w-full space-y-3">
          <a
            href="tel:120"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-[17px] font-700 text-[var(--color-danger-bg)]"
          >
            <Phone size={20} /> 拨打急救电话 120
          </a>
          <a
            href="tel:120"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/40 py-3.5 text-[15px] font-500 text-white"
          >
            联系产科 / 儿科主治医生
          </a>
        </div>

        <p className="mt-6 text-[12px] leading-relaxed text-white/70">
          此提示优先于一切个性化与推荐内容。若为误触，可在确认安全后返回。
        </p>
      </motion.div>

      <button
        onClick={() => navigate('/')}
        className="mt-4 flex items-center justify-center gap-2 py-2 text-[13px] text-white/60"
      >
        <ArrowLeft size={14} /> 我已了解，返回首页
      </button>
    </div>
  );
}
