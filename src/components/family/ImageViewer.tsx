import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ImageViewerProps {
  images: string[] | null;
  index: number;
  onClose: () => void;
}

/** 全屏图片预览（左右滑动切换） */
export function ImageViewer({ images, index, onClose }: ImageViewerProps) {
  const [cur, setCur] = useState(index);

  useEffect(() => setCur(index), [index, images]);

  return (
    <AnimatePresence>
      {images && images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/92"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-[calc(env(safe-area-inset-top)+16px)] flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <X size={20} />
          </button>

          <motion.img
            key={cur}
            src={images[cur]}
            alt={`预览${cur + 1}`}
            initial={{ scale: 0.96, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-h-[82vh] max-w-[92vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <div
              className="absolute bottom-[calc(env(safe-area-inset-bottom)+24px)] flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCur(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === cur ? 'w-5 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
