// 孕语 · 核心领域类型定义

/** 阶段状态机取值 */
export type Stage =
  | 'ttc' // 备孕期
  | 'pregnancy' // 怀孕期
  | 'pregnancy_late' // 孕晚期（待产模式并行）
  | 'labor' // 分娩当天
  | 'postpartum' // 产后 42 天恢复
  | 'parenting' // 0-2 岁养育
  | 'paused'; // 妊娠中断

/** 家庭成员角色 */
export type MemberRole = 'mom' | 'partner' | 'elder';

export interface Member {
  id: string;
  role: MemberRole;
  name: string;
  avatar: string; // emoji 头像
}

export interface MotherProfile {
  lastMenstrualPeriod?: string; // 末次月经 ISO date
  dueDate?: string; // 预产期
  conceptionConfirmedAt?: string;
  cycleLength: number; // 平均周期天数
}

export interface Baby {
  name: string;
  birthDate?: string;
  birthWeight?: number; // g
  birthLength?: number; // cm
  photo?: string;
}

/** 健康记录（孕产 + 备孕） */
export type HealthRecordType =
  | 'weight'
  | 'fetalMovement'
  | 'contraction'
  | 'cycle'
  | 'bbt' // 基础体温
  | 'symptom';

export interface HealthRecord {
  id: string;
  type: HealthRecordType;
  recordedAt: string; // ISO datetime
  payload: Record<string, number | string | boolean>;
  byMemberId: string;
}

/** 日常育儿记录 */
export type CareRecordType = 'feeding' | 'sleep' | 'diaper';

export interface CareRecord {
  id: string;
  type: CareRecordType;
  recordedAt: string;
  payload: Record<string, number | string | boolean>;
  byMemberId: string;
}

/** 成长监测记录 */
export type GrowthRecordType = 'height' | 'weight' | 'head' | 'milestone' | 'vaccine';

export interface GrowthRecord {
  id: string;
  type: GrowthRecordType;
  recordedAt: string;
  payload: Record<string, number | string | boolean>;
}

/** 提醒 */
export type ReminderCategory = 'supplement' | 'checkup' | 'vaccine' | 'feeding';

export interface Reminder {
  id: string;
  category: ReminderCategory;
  title: string;
  dueAt: string;
  done: boolean;
  claimedBy?: string; // memberId
}

/** 成长动态评论（朋友圈式互动） */
export interface MomentComment {
  id: string;
  memberId: string;
  text: string;
  createdAt: string;
}

/** 成长影像 / 动态 */
export interface MediaItem {
  id: string;
  emoji: string; // 占位影像（无图片时展示）
  imageDataUrl?: string; // 旧版单图（向后兼容）
  images?: string[]; // 多图九宫格（base64 dataURL）
  caption: string;
  createdAt: string;
  byMemberId: string;
  likes?: string[]; // 点赞成员 id
  comments?: MomentComment[]; // 评论
}

/** 数据权限：读写 / 只读 / 不可见 */
export type PermLevel = 'rw' | 'r' | 'none';

/** 数据域 key */
export type DataDomain = 'maternal' | 'baby' | 'daily' | 'media';

/** 权限矩阵：数据域 → 角色 → 权限级别 */
export type PermissionMatrix = Record<DataDomain, Record<MemberRole, PermLevel>>;

/** 知识内容分级 */
export type ContentLevel = 'L0' | 'L1' | 'L2' | 'L3';

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  level: ContentLevel;
  stages: Stage[];
  monthAge?: [number, number]; // 适用月龄区间
  source: string;
  reviewer?: string;
  reviewedAt?: string;
}
