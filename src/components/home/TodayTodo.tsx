import { motion } from 'framer-motion';
import { Check, Pill, Stethoscope, Syringe, Baby as BabyIcon } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { Reminder, ReminderCategory } from '../../types';
import { Card } from '../ui/Card';

const CATEGORY_ICON: Record<ReminderCategory, typeof Pill> = {
  supplement: Pill,
  checkup: Stethoscope,
  vaccine: Syringe,
  feeding: BabyIcon,
};

const CATEGORY_LABEL: Record<ReminderCategory, string> = {
  supplement: '补充剂',
  checkup: '产检',
  vaccine: '疫苗',
  feeding: '喂养',
};

function timeLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (isToday) return `今天 ${hm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}

export function TodayTodo() {
  const reminders = useAppStore((s) => s.reminders);
  const toggle = useAppStore((s) => s.toggleReminder);
  const members = useAppStore((s) => s.members);
  const activeMemberId = useAppStore((s) => s.activeMemberId);
  const claim = useAppStore((s) => s.claimReminder);

  const sorted = [...reminders].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <Card className="divide-y divide-[var(--color-line)] overflow-hidden">
      {sorted.map((r: Reminder, i) => {
        const Icon = CATEGORY_ICON[r.category];
        const claimer = members.find((m) => m.id === r.claimedBy);
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <button
              onClick={() => toggle(r.id)}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                r.done
                  ? 'border-[var(--color-sage)] bg-[var(--color-sage)] text-white'
                  : 'border-[var(--color-line)] text-transparent'
              }`}
              aria-label="完成"
            >
              <Check size={14} strokeWidth={3} />
            </button>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-paper-deep)] text-[var(--color-clay-deep)]">
              <Icon size={17} strokeWidth={1.9} />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-500 ${
                  r.done ? 'text-[var(--color-ink-faint)] line-through' : 'text-[var(--color-ink)]'
                }`}
              >
                {r.title}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--color-ink-faint)]">
                {CATEGORY_LABEL[r.category]} · {timeLabel(r.dueAt)}
              </p>
            </div>

            {claimer ? (
              <span className="shrink-0 text-lg" title={`${claimer.name} 已认领`}>
                {claimer.avatar}
              </span>
            ) : (
              <button
                onClick={() => claim(r.id, activeMemberId)}
                className="shrink-0 rounded-full border border-[var(--color-line)] px-2.5 py-1 text-[11px] text-[var(--color-ink-soft)] active:scale-95"
              >
                认领
              </button>
            )}
          </motion.div>
        );
      })}
      {sorted.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-[var(--color-ink-faint)]">
          今日暂无待办 🌿
        </p>
      )}
    </Card>
  );
}
