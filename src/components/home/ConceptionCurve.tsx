import { motion } from 'framer-motion';
import type { ConceptionCurve as CurveData } from '../../utils/pregnancy';

/**
 * 备孕期首页橙色卡片内嵌的受孕概率曲线。
 * 以排卵日为中心绘制平滑面积曲线，高亮今日所在位置。
 */
export function ConceptionCurve({ curve }: { curve: CurveData }) {
  const { points } = curve;
  const W = 280;
  const H = 96;
  const padX = 10;
  const padTop = 14;
  const padBottom = 20;
  const maxP = Math.max(...points.map((p) => p.probability));

  const x = (i: number) => padX + (i * (W - padX * 2)) / (points.length - 1);
  const y = (p: number) => padTop + (1 - p / maxP) * (H - padTop - padBottom);

  // Catmull-Rom → 三次贝塞尔，得到平滑曲线
  const coords = points.map((p, i) => ({ x: x(i), y: y(p.probability) }));
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i - 1] ?? coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  const area = `${d} L ${coords[coords.length - 1].x} ${H - padBottom} L ${coords[0].x} ${H - padBottom} Z`;

  const todayIdx = points.findIndex((p) => p.isToday);
  const today = todayIdx >= 0 ? { x: x(todayIdx), y: y(points[todayIdx].probability) } : null;

  return (
    <div className="relative mt-1 w-full">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="overflow-visible">
        <defs>
          <linearGradient id="ccFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#ccFill)" />
        <motion.path
          d={d}
          fill="none"
          stroke="#fff"
          strokeWidth={2.2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.4 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        />

        {/* 排卵日 / 峰值刻度点 */}
        {points.map((p, i) => (
          <circle
            key={p.offset}
            cx={x(i)}
            cy={y(p.probability)}
            r={p.offset === 0 ? 2.6 : 1.6}
            fill="#fff"
            opacity={p.offset === 0 ? 0.95 : 0.4}
          />
        ))}

        {/* 今日位置标记 */}
        {today && (
          <g>
            <line
              x1={today.x}
              y1={today.y}
              x2={today.x}
              y2={H - padBottom}
              stroke="#fff"
              strokeWidth={1}
              strokeDasharray="2 2"
              opacity={0.6}
            />
            <motion.circle
              cx={today.x}
              cy={today.y}
              r={5}
              fill="#fff"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 320, damping: 16 }}
            />
            <circle cx={today.x} cy={today.y} r={5} fill="none" stroke="#fff" strokeWidth={1} opacity={0.5}>
              <animate attributeName="r" from="5" to="11" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* 排卵日刻度文字 */}
        {points.map((p, i) =>
          p.offset === 0 ? (
            <text
              key="ov-label"
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#fff"
              opacity={0.85}
            >
              排卵日
            </text>
          ) : today && p.isToday ? (
            <text
              key="today-label"
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#fff"
              opacity={0.85}
            >
              今天
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
