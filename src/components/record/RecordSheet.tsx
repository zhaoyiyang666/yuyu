import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { detectEmergency } from '../../utils/compliance';
import { useNavigate } from 'react-router-dom';

interface Field {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'date';
  unit?: string;
  options?: string[];
  placeholder?: string;
  defaultValue?: string;
}

interface RecordSheetProps {
  open: boolean;
  title: string;
  fields: Field[];
  onClose: () => void;
  onSubmit: (payload: Record<string, number | string | boolean>) => void;
}

/** 通用记录录入底部弹层，含急症关键词红线拦截 */
export function RecordSheet({ open, title, fields, onClose, onSubmit }: RecordSheetProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // 打开时以字段默认值预填（如日期默认今天）
  useEffect(() => {
    if (!open) return;
    const init: Record<string, string> = {};
    for (const f of fields) {
      if (f.defaultValue !== undefined) init[f.key] = f.defaultValue;
    }
    setValues(init);
  }, [open, fields]);

  const submit = () => {
    // 合规红线：对文本字段做急症关键词检测
    for (const f of fields) {
      if (f.type === 'text' && values[f.key]) {
        const hit = detectEmergency(values[f.key]);
        if (hit) {
          navigate(`/emergency?kw=${encodeURIComponent(hit)}`);
          return;
        }
      }
    }
    const payload: Record<string, number | string | boolean> = {};
    for (const f of fields) {
      const v = values[f.key];
      if (v === undefined || v === '') continue;
      payload[f.key] = f.type === 'number' ? Number(v) : v;
    }
    onSubmit(payload);
    setValues({});
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
              <h3 className="font-serif text-lg font-600">{title}</h3>
              <button onClick={onClose} className="text-[var(--color-ink-faint)]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-[13px] font-500 text-[var(--color-ink-soft)]">
                    {f.label}
                    {f.unit && <span className="text-[var(--color-ink-faint)]"> ({f.unit})</span>}
                  </label>
                  {f.type === 'select' ? (
                    <div className="flex flex-wrap gap-2">
                      {f.options?.map((o) => (
                        <button
                          key={o}
                          onClick={() => setValues((v) => ({ ...v, [f.key]: o }))}
                          className={`rounded-xl border px-3 py-2 text-sm transition ${
                            values[f.key] === o
                              ? 'border-[var(--color-clay)] bg-[var(--color-clay-soft)]/40 text-[var(--color-clay-deep)]'
                              : 'border-[var(--color-line)] bg-white/60 text-[var(--color-ink-soft)]'
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={f.type === 'date' ? 'date' : f.type}
                      inputMode={f.type === 'number' ? 'decimal' : 'text'}
                      placeholder={f.placeholder}
                      value={values[f.key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="w-full rounded-xl border border-[var(--color-line)] bg-white/70 px-3.5 py-3 text-[15px] outline-none focus:border-[var(--color-clay)]"
                    />
                  )}
                </div>
              ))}
            </div>

            <Button size="lg" className="mt-5 w-full" onClick={submit}>
              保存记录
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
