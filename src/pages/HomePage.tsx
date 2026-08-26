import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { StageHeroCard } from '../components/home/StageHeroCard';
import { TodayTodo } from '../components/home/TodayTodo';
import { QuickRecord } from '../components/home/QuickRecord';
import { KnowledgeCard } from '../components/knowledge/KnowledgeCard';
import { SectionTitle } from '../components/ui/Card';
import { KNOWLEDGE } from '../data/knowledge';
import { StageSwitchHint } from '../components/home/StageSwitchHint';

export function HomePage() {
  const stage = useAppStore((s) => s.stage);
  const familyName = useAppStore((s) => s.familyName);
  const media = useAppStore((s) => s.media);
  const navigate = useNavigate();

  const recommended = KNOWLEDGE.filter((a) => a.stages.includes(stage)).slice(0, 2);

  return (
    <div className="pt-[calc(env(safe-area-inset-top)+16px)]">
      <div className="mb-4 flex items-center justify-between px-1">
        <div>
          <p className="text-[13px] text-[var(--color-ink-soft)]">{familyName}</p>
          <p className="font-serif text-lg font-600 text-[var(--color-ink)]">今天也在好好记录</p>
        </div>
      </div>

      <StageHeroCard />

      <StageSwitchHint />

      <SectionTitle
        action={
          <button
            onClick={() => navigate('/record')}
            className="flex items-center text-[12px] text-[var(--color-ink-faint)]"
          >
            全部记录 <ChevronRight size={14} />
          </button>
        }
      >
        快捷记录
      </SectionTitle>
      <QuickRecord />

      <SectionTitle>今日待办</SectionTitle>
      <TodayTodo />

      <SectionTitle
        action={
          <span className="flex items-center gap-1 text-[12px] text-[var(--color-clay-deep)]">
            <Sparkles size={13} /> 为你推荐
          </span>
        }
      >
        阶段知识
      </SectionTitle>
      <div className="space-y-3">
        {recommended.map((a) => (
          <KnowledgeCard key={a.id} article={a} />
        ))}
      </div>

      <SectionTitle
        action={
          <button
            onClick={() => navigate('/family')}
            className="flex items-center text-[12px] text-[var(--color-ink-faint)]"
          >
            家庭动态 <ChevronRight size={14} />
          </button>
        }
      >
        成长瞬间
      </SectionTitle>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2"
      >
        {media.map((m) => {
          const cover = m.images?.[0] ?? m.imageDataUrl;
          return (
            <div
              key={m.id}
              className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white/70"
            >
              {cover ? (
                <>
                  <img src={cover} alt={m.caption} className="h-16 w-full object-cover" />
                  <span className="px-2 text-center text-[11px] text-[var(--color-ink-soft)] line-clamp-1">
                    {m.caption}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-4xl">{m.emoji}</span>
                  <span className="px-2 text-center text-[11px] text-[var(--color-ink-soft)] line-clamp-1">
                    {m.caption}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
