import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, X } from 'lucide-react';

/** iOS Safari 不支持 beforeinstallprompt，需引导手动「添加到主屏幕」 */
function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari 私有属性
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

type BIPEvent = Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> };

/** PWA 安装引导 + 版本更新提示 */
export function PWAPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => void) | null>(null);

  // 注册 Service Worker，监听更新
  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });
    setUpdateSW(() => update);
  }, []);

  // 监听可安装事件（Android / 桌面 Chrome）
  useEffect(() => {
    if (isStandalone()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS 没有安装事件，首次访问时给出「添加到主屏幕」引导
    if (isIOS() && !localStorage.getItem('pwa:ios-hint-dismissed')) {
      const t = setTimeout(() => setShowIOSHint(true), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShowInstall(false);
  };

  const dismissIOS = () => {
    setShowIOSHint(false);
    localStorage.setItem('pwa:ios-hint-dismissed', '1');
  };

  return (
    <>
      {/* 版本更新条 */}
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed inset-x-0 top-0 z-[70] mx-auto flex max-w-[480px] items-center justify-between gap-3 bg-[var(--color-sage-deep)] px-4 py-3 text-white"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
          >
            <span className="text-[13px]">发现新版本，刷新即可更新</span>
            <button
              onClick={() => updateSW?.()}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-500 active:scale-95"
            >
              <RefreshCw size={14} /> 更新
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Android / 桌面：安装按钮 */}
      <AnimatePresence>
        {showInstall && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto flex max-w-[480px] items-center justify-between gap-3 border-t border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
          >
            <div className="flex items-center gap-2.5">
              <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="孕语" className="h-9 w-9 rounded-lg" />
              <div>
                <p className="text-[13px] font-600 text-[var(--color-ink)]">安装到主屏幕</p>
                <p className="text-[11px] text-[var(--color-ink-faint)]">像 App 一样全屏使用</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={install}
                className="flex items-center gap-1.5 rounded-full bg-[var(--color-clay)] px-4 py-2 text-[13px] font-500 text-white active:scale-95"
              >
                <Download size={14} /> 安装
              </button>
              <button onClick={() => setShowInstall(false)} className="text-[var(--color-ink-faint)]">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS：手动添加到主屏幕引导 */}
      <AnimatePresence>
        {showIOSHint && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-[480px] border-t border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          >
            <div className="flex items-start gap-3">
              <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="孕语" className="h-10 w-10 rounded-xl" />
              <div className="flex-1 text-[13px] leading-relaxed text-[var(--color-ink)]">
                在 Safari 中点击底部
                <span className="mx-1 inline-flex items-center rounded bg-[var(--color-paper-deep)] px-1.5 py-0.5 font-600">
                  分享 ⬆️
                </span>
                ，选择「添加到主屏幕」，即可像 App 一样全屏使用。
              </div>
              <button onClick={dismissIOS} className="text-[var(--color-ink-faint)]">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
