import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { MediaItem } from '../../types';

const EMOJI_CHOICES = ['🖼️', '📸', '👣', '🎀', '🍼', '🎂', '🌈', '💗', '🩺', '🦶', '🐾', '✨'];
const MAX_IMAGES = 9;

export interface MomentDraft {
  caption: string;
  emoji: string;
  images?: string[];
}

interface MomentSheetProps {
  open: boolean;
  /** 传入 item 表示编辑，不传表示新建 */
  item?: MediaItem | null;
  onClose: () => void;
  onSubmit: (draft: MomentDraft) => void;
  onDelete?: () => void;
}

/** 兼容旧数据：单图 imageDataUrl → images 数组 */
function readImages(item?: MediaItem | null): string[] {
  if (!item) return [];
  if (item.images?.length) return item.images;
  if (item.imageDataUrl) return [item.imageDataUrl];
  return [];
}

/** 压缩图片为不超过 maxSize 的 dataURL，避免 localStorage 超限 */
function fileToDataUrl(file: File, maxSize = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas 不可用'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** 成长动态发布 / 编辑底部弹层（朋友圈式：九宫格多图 + 文字） */
export function MomentSheet({ open, item, onClose, onSubmit, onDelete }: MomentSheetProps) {
  const isEdit = !!item;
  const [caption, setCaption] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setCaption(item?.caption ?? '');
    setEmoji(item?.emoji ?? EMOJI_CHOICES[0]);
    setImages(readImages(item));
    setBusy(false);
  }, [open, item]);

  const pickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    try {
      const room = MAX_IMAGES - images.length;
      const urls = await Promise.all(files.slice(0, room).map((f) => fileToDataUrl(f)));
      setImages((prev) => [...prev, ...urls].slice(0, MAX_IMAGES));
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const submit = () => {
    if (!caption.trim() && images.length === 0) return;
    onSubmit({
      caption: caption.trim(),
      emoji,
      images: images.length ? images : undefined,
    });
    onClose();
  };

  const canSubmit = (caption.trim().length > 0 || images.length > 0) && !busy;

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
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-[var(--color-paper)] p-5 pb-[calc(env(safe-area-inset-bottom)+20px)]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-line)]" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-600">{isEdit ? '编辑动态' : '发布成长动态'}</h3>
              <button onClick={onClose} className="text-[var(--color-ink-faint)]">
                <X size={20} />
              </button>
            </div>

            {/* 文字 */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="这一刻的想法…"
              rows={3}
              autoFocus
              className="mb-4 w-full resize-none rounded-xl border border-[var(--color-line)] bg-white/70 px-3.5 py-3 text-[15px] outline-none focus:border-[var(--color-clay)]"
            />

            {/* 九宫格图片 */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={pickImages}
            />
            <div className="mb-4 grid grid-cols-3 gap-2">
              {images.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                  <img src={src} alt={`图片${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--color-line)] text-[var(--color-ink-faint)] active:scale-95"
                >
                  <ImagePlus size={22} strokeWidth={1.6} />
                  <span className="text-[10px]">{busy ? '处理中' : '添加'}</span>
                </button>
              )}
            </div>

            {/* 无图片时的 emoji 占位选择 */}
            {images.length === 0 && (
              <>
                <label className="mb-1 block text-[12px] text-[var(--color-ink-faint)]">
                  未选图片时，用一个图标作为封面
                </label>
                <div className="mb-4 flex flex-wrap gap-2">
                  {EMOJI_CHOICES.map((em) => (
                    <button
                      key={em}
                      onClick={() => setEmoji(em)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition ${
                        emoji === em
                          ? 'bg-[var(--color-clay-soft)]/50 ring-2 ring-[var(--color-clay)]'
                          : 'bg-[var(--color-paper-deep)]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </>
            )}

            <Button size="lg" className="w-full" onClick={submit} disabled={!canSubmit}>
              {isEdit ? '保存' : '发布'}
            </Button>

            {isEdit && onDelete && (
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-[13px] text-[var(--color-danger-bg)]"
              >
                <Trash2 size={14} /> 删除这条动态
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
