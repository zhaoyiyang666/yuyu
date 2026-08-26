// 孕语 · 医疗合规：急症关键词识别与免责话术

/** 急症关键词表 —— 命中即触发全屏就医红线，优先于一切推荐逻辑 */
export const EMERGENCY_KEYWORDS: string[] = [
  '大出血',
  '出血不止',
  '剧烈腹痛',
  '持续腹痛',
  '胎动消失',
  '胎动减少',
  '胎动明显减少',
  '破水',
  '持续高热',
  '高烧不退',
  '抽搐',
  '昏迷',
  '晕厥',
  '呼吸困难',
  '剧烈头痛',
  '视物模糊',
  '严重水肿',
  '宝宝高热',
  '婴儿抽搐',
  '囟门凸起',
];

/** 检测文本是否命中急症关键词，返回命中的词 */
export function detectEmergency(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  for (const kw of EMERGENCY_KEYWORDS) {
    if (t.includes(kw)) return kw;
  }
  return null;
}

/** AI / 参考类内容固定免责尾注 */
export const DISCLAIMER =
  '以上内容仅供参考，不替代专业医疗建议，如有不适请及时就医。';

/** 边界同意书正文 */
export const CONSENT_TEXT = [
  '「孕语」是记录与参考工具，不替代医院建档、产检、疫苗接种等线下医疗行为。',
  '本产品不提供任何诊断、治疗或用药结论。检测报告解读仅做信息提取与术语解释，异常项请咨询主治医生。',
  '孕产与宝宝健康数据属于敏感个人信息，将单独授权、加密存储、最小化采集，你可随时撤回授权、导出或删除。',
];

/** 内容分级说明 */
export const LEVEL_META: Record<
  string,
  { label: string; desc: string; color: string; bg: string }
> = {
  L0: { label: 'L0 科普', desc: '通用科普知识', color: '#4a5d4e', bg: '#e4ebe4' },
  L1: {
    label: 'L1 参考',
    desc: '健康管理参考，不替代医生',
    color: '#a85f40',
    bg: '#f2e0d5',
  },
  L2: {
    label: 'L2 解读',
    desc: '检测解读，仅术语解释不做结论',
    color: '#7c6a2f',
    bg: '#efe9d2',
  },
  L3: { label: 'L3 红线', desc: '诊断/用药，禁止，一律引导就医', color: '#b04a3f', bg: '#f2dcd8' },
};
