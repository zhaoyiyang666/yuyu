import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Droplets,
  Activity,
  Thermometer,
  Milk,
  Moon,
  Baby as BabyIcon,
  Timer,
  Scale,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { isPregnancyStage, isBabyStage } from '../../utils/stages';
import type { Stage } from '../../types';

interface QuickItem {
  key: string;
  label: string;
  icon: typeof Droplets;
  color: string;
}

function itemsForStage(stage: Stage): QuickItem[] {
  if (stage === 'ttc')
    return [
      { key: 'cycle', label: '月经', icon: Droplets, color: '#d99a6c' },
      { key: 'bbt', label: '基础体温', icon: Thermometer, color: '#c77b5a' },
      { key: 'weight', label: '体重', icon: Scale, color: '#4a5d4e' },
    ];
  if (isPregnancyStage(stage))
    return [
      { key: 'fetalMovement', label: '胎动', icon: Activity, color: '#c77b5a' },
      { key: 'weight', label: '体重', icon: Scale, color: '#4a5d4e' },
      { key: 'contraction', label: '宫缩', icon: Timer, color: '#a85f40' },
    ];
  if (isBabyStage(stage))
    return [
      { key: 'feeding', label: '喂养', icon: Milk, color: '#7c94a8' },
      { key: 'sleep', label: '睡眠', icon: Moon, color: '#4a5d4e' },
      { key: 'diaper', label: '尿布', icon: BabyIcon, color: '#d99a6c' },
    ];
  return [];
}

export function QuickRecord() {
  const stage = useAppStore((s) => s.stage);
  const navigate = useNavigate();
  const items = itemsForStage(stage);
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.button
            key={it.key}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/record?focus=${it.key}`)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-line)] bg-white/70 py-4"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: it.color + '22', color: it.color }}
            >
              <Icon size={20} strokeWidth={1.9} />
            </span>
            <span className="text-[12px] font-500 text-[var(--color-ink)]">{it.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
