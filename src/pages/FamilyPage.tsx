import { useState } from 'react';
import { Copy, Eye, Pencil, EyeOff, Plus, Camera } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, SectionTitle } from '../components/ui/Card';
import { MemberSheet, type MemberDraft } from '../components/family/MemberSheet';
import { MomentSheet, type MomentDraft } from '../components/family/MomentSheet';
import { MomentCard } from '../components/family/MomentCard';
import { ImageViewer } from '../components/family/ImageViewer';
import { useAppStore } from '../store/appStore';
import type { DataDomain, MediaItem, Member, MemberRole, PermLevel } from '../types';

const ROLE_LABEL: Record<MemberRole, string> = {
  mom: '妈妈 · 主账号',
  partner: '伴侣',
  elder: '祖辈',
};

const DOMAIN_LABEL: Record<DataDomain, string> = {
  maternal: '孕产健康数据',
  baby: '宝宝健康数据',
  daily: '日常记录',
  media: '成长影像与日记',
};

const DOMAIN_ORDER: DataDomain[] = ['maternal', 'baby', 'daily', 'media'];

/** 权限循环切换顺序 */
const PERM_CYCLE: PermLevel[] = ['rw', 'r', 'none'];

function PermIcon({ p }: { p: PermLevel }) {
  if (p === 'rw') return <Pencil size={14} className="mx-auto text-[var(--color-sage)]" />;
  if (p === 'r') return <Eye size={14} className="mx-auto text-[var(--color-ink-soft)]" />;
  return <EyeOff size={14} className="mx-auto text-[var(--color-ink-faint)]/50" />;
}

export function FamilyPage() {
  const members = useAppStore((s) => s.members);
  const inviteCode = useAppStore((s) => s.inviteCode);
  const media = useAppStore((s) => s.media);
  const familyName = useAppStore((s) => s.familyName);
  const permissions = useAppStore((s) => s.permissions);
  const updateMember = useAppStore((s) => s.updateMember);
  const addMember = useAppStore((s) => s.addMember);
  const removeMember = useAppStore((s) => s.removeMember);
  const setPermission = useAppStore((s) => s.setPermission);
  const addMedia = useAppStore((s) => s.addMedia);
  const updateMedia = useAppStore((s) => s.updateMedia);
  const removeMedia = useAppStore((s) => s.removeMedia);

  // 成员编辑：null=未开，undefined=新增，Member=编辑
  const [memberSheet, setMemberSheet] = useState<Member | 'new' | null>(null);
  // 动态编辑：'new' 新建，MediaItem 编辑，null 关闭
  const [momentSheet, setMomentSheet] = useState<MediaItem | 'new' | null>(null);
  // 图片全屏预览
  const [viewer, setViewer] = useState<{ images: string[]; index: number } | null>(null);

  // 展示顺序：妈妈优先
  const roleColumns: MemberRole[] = ['mom', 'partner', 'elder'];

  const cyclePerm = (domain: DataDomain, role: MemberRole) => {
    if (role === 'mom') return; // 主账号锁定读写
    const cur = permissions[domain][role];
    const next = PERM_CYCLE[(PERM_CYCLE.indexOf(cur) + 1) % PERM_CYCLE.length];
    setPermission(domain, role, next);
  };

  const handleMemberSubmit = (draft: MemberDraft) => {
    if (memberSheet === 'new') {
      addMember(draft);
    } else if (memberSheet) {
      updateMember(memberSheet.id, draft);
    }
  };

  const handleMomentSubmit = (draft: MomentDraft) => {
    if (momentSheet === 'new') {
      addMedia(draft);
    } else if (momentSheet) {
      updateMedia(momentSheet.id, draft);
    }
  };

  return (
    <div>
      <PageHeader title="家庭" subtitle={familyName} />

      <SectionTitle
        action={
          <button
            onClick={() => setMemberSheet('new')}
            className="flex items-center gap-1 text-[12px] text-[var(--color-clay-deep)]"
          >
            <Plus size={14} /> 添加成员
          </button>
        }
      >
        家庭成员
      </SectionTitle>
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setMemberSheet(m)}
              className="group relative flex flex-col items-center gap-1.5 active:scale-[0.97]"
            >
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-paper-deep)] text-2xl">
                {m.avatar}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                  <Pencil size={11} className="text-[var(--color-ink-soft)]" />
                </span>
              </span>
              <span className="text-[13px] font-500 text-[var(--color-ink)]">{m.name}</span>
              <span className="text-[10px] text-[var(--color-ink-faint)]">{ROLE_LABEL[m.role]}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => navigator.clipboard?.writeText(inviteCode)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-line)] py-2.5 text-[13px] text-[var(--color-ink-soft)] active:scale-[0.99]"
        >
          <Copy size={14} /> 邀请码 {inviteCode} · 点击复制
        </button>
      </Card>

      <SectionTitle>数据权限矩阵</SectionTitle>
      <Card className="overflow-hidden p-4">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-y-2 text-[12px]">
          <div className="font-600 text-[var(--color-ink-soft)]">数据域</div>
          {roleColumns.map((r) => (
            <div key={r} className="text-center font-600 text-[var(--color-ink-soft)]">
              {r === 'mom' ? '妈妈' : r === 'partner' ? '伴侣' : '祖辈'}
            </div>
          ))}
          {DOMAIN_ORDER.map((domain) => (
            <div key={domain} className="contents">
              <div className="border-t border-[var(--color-line)] py-2 text-[var(--color-ink)]">
                {DOMAIN_LABEL[domain]}
              </div>
              {roleColumns.map((role) => (
                <button
                  key={role}
                  onClick={() => cyclePerm(domain, role)}
                  disabled={role === 'mom'}
                  className={`border-t border-[var(--color-line)] py-2 ${
                    role === 'mom'
                      ? 'cursor-default opacity-90'
                      : 'rounded-md active:scale-95 active:bg-[var(--color-paper-deep)]'
                  }`}
                >
                  <PermIcon p={permissions[domain][role]} />
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[11px] text-[var(--color-ink-faint)]">
          <span className="flex items-center gap-1">
            <Pencil size={12} /> 读写
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} /> 只读
          </span>
          <span className="flex items-center gap-1">
            <EyeOff size={12} /> 不可见
          </span>
        </div>
        <p className="mt-2 text-[11px] text-[var(--color-ink-faint)]">
          点击伴侣 / 祖辈的单元格可循环切换权限（读写 → 只读 → 不可见）。妈妈为主账号，始终可读写。
        </p>
      </Card>

      <SectionTitle>成长动态</SectionTitle>

      {/* 朋友圈式相册封面 */}
      <div className="relative mb-4 overflow-hidden rounded-[20px]">
        <div
          className="h-32 w-full"
          style={{
            background:
              'linear-gradient(135deg, var(--color-clay) 0%, var(--color-clay-deep) 55%, var(--color-sage) 130%)',
          }}
        />
        <div className="absolute right-4 top-4">
          <button
            onClick={() => setMomentSheet('new')}
            className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[12px] font-500 text-white backdrop-blur active:scale-95"
          >
            <Camera size={14} /> 发布动态
          </button>
        </div>
        {/* 家庭名 + 主账号头像，压在封面下缘 */}
        <div className="absolute -bottom-1 right-4 flex items-end gap-3">
          <span className="pb-3 text-[15px] font-600 text-white drop-shadow">{familyName}</span>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-[var(--color-paper)] bg-[var(--color-paper-deep)] text-3xl shadow-md">
            {members.find((m) => m.role === 'mom')?.avatar ?? '🌷'}
          </span>
        </div>
      </div>

      <Card className="px-4 pt-4">
        {media.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[var(--color-ink-soft)]">
            还没有成长动态，点击封面右上角「发布动态」记录第一个瞬间。
          </p>
        ) : (
          <div className="space-y-4">
            {media.map((m) => (
              <MomentCard
                key={m.id}
                moment={m}
                members={members}
                onEdit={() => setMomentSheet(m)}
                onPreview={(images, index) => setViewer({ images, index })}
              />
            ))}
          </div>
        )}
      </Card>

      <MemberSheet
        open={memberSheet !== null}
        member={memberSheet === 'new' ? null : memberSheet}
        onClose={() => setMemberSheet(null)}
        onSubmit={handleMemberSubmit}
        onDelete={
          memberSheet && memberSheet !== 'new'
            ? () => removeMember(memberSheet.id)
            : undefined
        }
      />

      <MomentSheet
        open={momentSheet !== null}
        item={momentSheet === 'new' ? null : momentSheet}
        onClose={() => setMomentSheet(null)}
        onSubmit={handleMomentSubmit}
        onDelete={
          momentSheet && momentSheet !== 'new'
            ? () => removeMedia(momentSheet.id)
            : undefined
        }
      />

      <ImageViewer
        images={viewer?.images ?? null}
        index={viewer?.index ?? 0}
        onClose={() => setViewer(null)}
      />
    </div>
  );
}
