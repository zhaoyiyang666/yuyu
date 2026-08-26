import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Member, MemberRole } from '../../types';

const ROLE_OPTIONS: { key: MemberRole; label: string }[] = [
  { key: 'partner', label: '伴侣' },
  { key: 'elder', label: '祖辈' },
];

const AVATAR_CHOICES = ['🌷', '🌰', '🌼', '🌿', '🌸', '🍀', '🐰', '🐻', '🦊', '🐣', '🌙', '⭐️'];

export interface MemberDraft {
  name: string;
  avatar: string;
  role: MemberRole;
}

interface MemberSheetProps {
  open: boolean;
  /** 传入 member 表示编辑；不传表示新增 */
  member?: Member | null;
  onClose: () => void;
  onSubmit: (draft: MemberDraft) => void;
  onDelete?: () => void;
}

/** 家庭成员新增 / 编辑底部弹层 */
export function MemberSheet({ open, member, onClose, onSubmit, onDelete }: MemberSheetProps) {
  const isEdit = !!member;
  const isMom = member?.role === 'mom';
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_CHOICES[0]);
  const [role, setRole] = useState<MemberRole>('partner');

  useEffect(() => {
    if (!open) return;
    setName(member?.name ?? '');
    setAvatar(member?.avatar ?? AVATAR_CHOICES[0]);
    setRole(member?.role ?? 'partner');
  }, [open, member]);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), avatar, role });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[480px] rounded-t-3xl bg-[var(--color-paper)] p-5 pb-[calc(env(safe-area-inset-bottom)+20px)]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-line)]" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-600">{isEdit ? '编辑成员' : '添加成员'}</h3>
              <button onClick={onClose} className="text-[var(--color-ink-faint)]">
                <X size={20} />
              </button>
            </div>

            {/* 头像选择 */}
            <label className="mb-1 block text-[13px] font-500 text-[var(--color-ink-soft)]">头像</label>
            <div className="mb-4 flex flex-wrap gap-2">
              {AVATAR_CHOICES.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition ${
                    avatar === a
                      ? 'bg-[var(--color-clay-soft)]/50 ring-2 ring-[var(--color-clay)]'
                      : 'bg-[var(--color-paper-deep)]'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* 姓名 */}
            <label className="mb-1 block text-[13px] font-500 text-[var(--color-ink-soft)]">称呼</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：外婆 / 爸爸"
              className="mb-4 w-full rounded-xl border border-[var(--color-line)] bg-white/70 px-3.5 py-3 text-[15px] outline-none focus:border-[var(--color-clay)]"
            />

            {/* 角色（妈妈主账号不可改） */}
            {!isMom && (
              <>
                <label className="mb-1 block text-[13px] font-500 text-[var(--color-ink-soft)]">
                  家庭角色
                </label>
                <div className="mb-4 flex gap-2">
                  {ROLE_OPTIONS.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => setRole(r.key)}
                      className={`rounded-xl border px-4 py-2 text-sm transition ${
                        role === r.key
                          ? 'border-[var(--color-clay)] bg-[var(--color-clay-soft)]/40 text-[var(--color-clay-deep)]'
                          : 'border-[var(--color-line)] bg-white/60 text-[var(--color-ink-soft)]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {isMom && (
              <p className="mb-4 rounded-lg bg-[var(--color-paper-deep)] px-3 py-2 text-[12px] text-[var(--color-ink-soft)]">
                妈妈为家庭主账号，角色不可更改，也不可移除。
              </p>
            )}

            <Button size="lg" className="w-full" onClick={submit} disabled={!name.trim()}>
              {isEdit ? '保存' : '添加成员'}
            </Button>

            {isEdit && !isMom && onDelete && (
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-[13px] text-[var(--color-danger-bg)]"
              >
                <Trash2 size={14} /> 移除该成员
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
