import { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Pencil, Send } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { MediaItem, Member } from '../../types';

/** 相对时间：刚刚 / N分钟前 / N小时前 / N天前 / 日期 */
function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min}分钟前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  if (d < 8) return `${d}天前`;
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}

function readImages(m: MediaItem): string[] {
  if (m.images?.length) return m.images;
  if (m.imageDataUrl) return [m.imageDataUrl];
  return [];
}

/** 九宫格布局：1 张大图，2/4 张双列，其余三列 */
function gridClass(count: number): string {
  if (count === 1) return 'grid-cols-1 w-3/5';
  if (count === 2 || count === 4) return 'grid-cols-2 w-4/5';
  return 'grid-cols-3';
}

interface MomentCardProps {
  moment: MediaItem;
  members: Member[];
  onEdit: () => void;
  onPreview: (images: string[], index: number) => void;
}

/** 朋友圈式动态卡片：头像 + 昵称 + 正文 + 九宫格图 + 点赞/评论 */
export function MomentCard({ moment, members, onEdit, onPreview }: MomentCardProps) {
  const activeMemberId = useAppStore((s) => s.activeMemberId);
  const toggleLike = useAppStore((s) => s.toggleMomentLike);
  const addComment = useAppStore((s) => s.addMomentComment);
  const removeComment = useAppStore((s) => s.removeMomentComment);

  const [panelOpen, setPanelOpen] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [text, setText] = useState('');

  const author = members.find((x) => x.id === moment.byMemberId);
  const images = readImages(moment);
  const likes = moment.likes ?? [];
  const comments = moment.comments ?? [];
  const liked = likes.includes(activeMemberId);
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? '成员';

  const submitComment = () => {
    if (!text.trim()) return;
    addComment(moment.id, activeMemberId, text.trim());
    setText('');
    setCommenting(false);
  };

  return (
    <div className="flex gap-3 border-b border-[var(--color-line)] pb-4">
      {/* 头像 */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-paper-deep)] text-xl">
        {author?.avatar ?? '🌷'}
      </span>

      <div className="min-w-0 flex-1">
        {/* 昵称 */}
        <p className="text-[14px] font-600 text-[var(--color-clay-deep)]">{author?.name ?? '成员'}</p>

        {/* 正文 */}
        {moment.caption && (
          <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-ink)]">
            {moment.caption}
          </p>
        )}

        {/* 九宫格 / emoji 占位 */}
        {images.length > 0 ? (
          <div className={`mt-2 grid gap-1.5 ${gridClass(images.length)}`}>
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => onPreview(images, i)}
                className="aspect-square overflow-hidden rounded-md bg-[var(--color-paper-deep)]"
              >
                <img src={src} alt={`图片${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex h-20 w-20 items-center justify-center rounded-md bg-[var(--color-paper-deep)] text-4xl">
            {moment.emoji}
          </div>
        )}

        {/* 时间 + 互动入口 */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12px] text-[var(--color-ink-faint)]">{relTime(moment.createdAt)}</span>
          <div className="flex items-center gap-1">
            {moment.byMemberId === activeMemberId && (
              <button
                onClick={onEdit}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ink-faint)] active:bg-[var(--color-paper-deep)]"
                aria-label="编辑"
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-paper-deep)] text-[var(--color-ink-soft)] active:scale-95"
              aria-label="互动"
            >
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* 点赞 / 评论操作面板 */}
        {panelOpen && (
          <div className="mt-2 inline-flex overflow-hidden rounded-lg bg-[var(--color-sage-deep)] text-[13px] text-white">
            <button
              onClick={() => {
                toggleLike(moment.id, activeMemberId);
                setPanelOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 active:bg-black/20"
            >
              <Heart size={14} fill={liked ? '#fff' : 'none'} /> {liked ? '取消' : '赞'}
            </button>
            <span className="my-1 w-px bg-white/20" />
            <button
              onClick={() => {
                setCommenting(true);
                setPanelOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 active:bg-black/20"
            >
              <MessageCircle size={14} /> 评论
            </button>
          </div>
        )}

        {/* 点赞与评论展示区 */}
        {(likes.length > 0 || comments.length > 0) && (
          <div className="mt-2 rounded-lg bg-[var(--color-paper-deep)]/60 px-3 py-2">
            {likes.length > 0 && (
              <div className="flex items-center gap-1.5 text-[13px] text-[var(--color-clay-deep)]">
                <Heart size={13} fill="currentColor" />
                <span className="flex-1">{likes.map(nameOf).join('，')}</span>
              </div>
            )}
            {likes.length > 0 && comments.length > 0 && (
              <div className="my-1.5 h-px bg-[var(--color-line)]" />
            )}
            {comments.map((c) => (
              <div key={c.id} className="py-0.5 text-[13px] leading-relaxed">
                <span className="font-600 text-[var(--color-clay-deep)]">{nameOf(c.memberId)}</span>
                <span className="text-[var(--color-ink)]">：{c.text}</span>
                {c.memberId === activeMemberId && (
                  <button
                    onClick={() => removeComment(moment.id, c.id)}
                    className="ml-2 text-[11px] text-[var(--color-ink-faint)]"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 评论输入框 */}
        {commenting && (
          <div className="mt-2 flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              placeholder="说点什么…"
              autoFocus
              className="flex-1 rounded-full border border-[var(--color-line)] bg-white/80 px-3.5 py-2 text-[13px] outline-none focus:border-[var(--color-clay)]"
            />
            <button
              onClick={submitComment}
              disabled={!text.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-clay)] text-white disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
