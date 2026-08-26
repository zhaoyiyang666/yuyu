import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Baby,
  CareRecord,
  CareRecordType,
  DataDomain,
  GrowthRecord,
  HealthRecord,
  HealthRecordType,
  MediaItem,
  Member,
  MemberRole,
  MotherProfile,
  PermissionMatrix,
  PermLevel,
  Reminder,
  Stage,
} from '../types';
import { estimatedDueDate } from '../utils/pregnancy';

interface AppState {
  onboarded: boolean;
  stage: Stage;
  familyName: string;
  inviteCode: string;
  members: Member[];
  activeMemberId: string;
  permissions: PermissionMatrix;
  mother: MotherProfile;
  baby: Baby;
  healthRecords: HealthRecord[];
  careRecords: CareRecord[];
  growthRecords: GrowthRecord[];
  reminders: Reminder[];
  media: MediaItem[];

  // actions
  completeOnboarding: (mother: Partial<MotherProfile>, stage: Stage) => void;
  setStage: (stage: Stage) => void;
  updateMother: (patch: Partial<MotherProfile>) => void;
  confirmPregnancy: (lmp: string) => void;
  recordBirth: (baby: Baby) => void;
  updateMember: (id: string, patch: Partial<Pick<Member, 'name' | 'avatar' | 'role'>>) => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  removeMember: (id: string) => void;
  setPermission: (domain: DataDomain, role: MemberRole, level: PermLevel) => void;
  addHealthRecord: (type: HealthRecordType, payload: HealthRecord['payload']) => void;
  addCareRecord: (type: CareRecordType, payload: CareRecord['payload']) => void;
  addGrowthRecord: (r: Omit<GrowthRecord, 'id' | 'recordedAt'>) => void;
  toggleReminder: (id: string) => void;
  claimReminder: (id: string, memberId: string) => void;
  setActiveMember: (id: string) => void;
  addMedia: (m: { emoji: string; caption: string; images?: string[] }) => void;
  updateMedia: (id: string, patch: Partial<Pick<MediaItem, 'emoji' | 'caption' | 'images'>>) => void;
  removeMedia: (id: string) => void;
  toggleMomentLike: (id: string, memberId: string) => void;
  addMomentComment: (id: string, memberId: string, text: string) => void;
  removeMomentComment: (id: string, commentId: string) => void;
  resetAll: () => void;
}

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_MEMBERS: Member[] = [
  { id: 'm-mom', role: 'mom', name: '我', avatar: '🌷' },
  { id: 'm-partner', role: 'partner', name: '伴侣', avatar: '🌰' },
  { id: 'm-elder', role: 'elder', name: '外婆', avatar: '🌼' },
];

/** 默认数据权限矩阵：新成员最小可见，医疗数据仅妈妈可写 */
const DEFAULT_PERMISSIONS: PermissionMatrix = {
  maternal: { mom: 'rw', partner: 'r', elder: 'none' },
  baby: { mom: 'rw', partner: 'rw', elder: 'r' },
  daily: { mom: 'rw', partner: 'rw', elder: 'r' },
  media: { mom: 'rw', partner: 'rw', elder: 'r' },
};

// 生成示例提醒
function seedReminders(): Reminder[] {
  const today = new Date();
  const at = (days: number, h = 9) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    d.setHours(h, 0, 0, 0);
    return d.toISOString();
  };
  return [
    { id: uid(), category: 'supplement', title: '服用叶酸 400μg', dueAt: at(0, 8), done: false },
    { id: uid(), category: 'checkup', title: '预约孕中期产检', dueAt: at(2, 10), done: false },
    { id: uid(), category: 'supplement', title: '补充钙剂', dueAt: at(0, 20), done: true },
    { id: uid(), category: 'vaccine', title: '宝宝乙肝第二针提醒', dueAt: at(5, 9), done: false },
  ];
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboarded: false,
      stage: 'ttc',
      familyName: '我的小家',
      inviteCode: 'YY-' + uid().toUpperCase().slice(0, 6),
      members: DEFAULT_MEMBERS,
      activeMemberId: 'm-mom',
      permissions: DEFAULT_PERMISSIONS,
      mother: { cycleLength: 28 },
      baby: { name: '宝宝' },
      healthRecords: [],
      careRecords: [],
      growthRecords: [],
      reminders: seedReminders(),
      media: [
        {
          id: uid(),
          emoji: '🖼️',
          caption: '第一次听到心跳，那一刻眼泪就掉下来了。',
          createdAt: now(),
          byMemberId: 'm-mom',
          likes: ['m-partner'],
          comments: [
            {
              id: uid(),
              memberId: 'm-partner',
              text: '我也好激动，等你回家一起听回放！',
              createdAt: now(),
            },
          ],
        },
      ],

      completeOnboarding: (mother, stage) =>
        set((s) => ({
          onboarded: true,
          stage,
          mother: { ...s.mother, ...mother },
        })),

      setStage: (stage) => set({ stage }),

      updateMother: (patch) =>
        set((s) => ({ mother: { ...s.mother, ...patch } })),

      confirmPregnancy: (lmp) =>
        set({
          stage: 'pregnancy',
          mother: {
            cycleLength: 28,
            lastMenstrualPeriod: lmp,
            dueDate: estimatedDueDate(lmp),
            conceptionConfirmedAt: now(),
          },
        }),

      recordBirth: (baby) =>
        set({
          stage: 'postpartum',
          baby,
        }),

      updateMember: (id, patch) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      addMember: (member) =>
        set((s) => ({
          members: [...s.members, { ...member, id: 'm-' + uid() }],
        })),

      removeMember: (id) =>
        set((s) => {
          // 主账号（妈妈）不可移除
          const target = s.members.find((m) => m.id === id);
          if (!target || target.role === 'mom') return {};
          return {
            members: s.members.filter((m) => m.id !== id),
            activeMemberId: s.activeMemberId === id ? 'm-mom' : s.activeMemberId,
          };
        }),

      setPermission: (domain, role, level) =>
        set((s) => ({
          permissions: {
            ...s.permissions,
            [domain]: { ...s.permissions[domain], [role]: level },
          },
        })),

      addHealthRecord: (type, payload) =>
        set((s) => ({
          healthRecords: [
            { id: uid(), type, payload, recordedAt: now(), byMemberId: s.activeMemberId },
            ...s.healthRecords,
          ],
        })),

      addCareRecord: (type, payload) =>
        set((s) => ({
          careRecords: [
            { id: uid(), type, payload, recordedAt: now(), byMemberId: s.activeMemberId },
            ...s.careRecords,
          ],
        })),

      addGrowthRecord: (r) =>
        set((s) => ({
          growthRecords: [{ ...r, id: uid(), recordedAt: now() }, ...s.growthRecords],
        })),

      toggleReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, done: !r.done } : r
          ),
        })),

      claimReminder: (id, memberId) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, claimedBy: memberId } : r
          ),
        })),

      setActiveMember: (id) => set({ activeMemberId: id }),

      addMedia: ({ emoji, caption, images }) =>
        set((s) => ({
          media: [
            {
              id: uid(),
              emoji,
              caption,
              images,
              createdAt: now(),
              byMemberId: s.activeMemberId,
              likes: [],
              comments: [],
            },
            ...s.media,
          ],
        })),

      updateMedia: (id, patch) =>
        set((s) => ({
          media: s.media.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      removeMedia: (id) =>
        set((s) => ({ media: s.media.filter((m) => m.id !== id) })),

      toggleMomentLike: (id, memberId) =>
        set((s) => ({
          media: s.media.map((m) => {
            if (m.id !== id) return m;
            const likes = m.likes ?? [];
            return {
              ...m,
              likes: likes.includes(memberId)
                ? likes.filter((x) => x !== memberId)
                : [...likes, memberId],
            };
          }),
        })),

      addMomentComment: (id, memberId, text) =>
        set((s) => ({
          media: s.media.map((m) =>
            m.id === id
              ? {
                  ...m,
                  comments: [
                    ...(m.comments ?? []),
                    { id: uid(), memberId, text, createdAt: now() },
                  ],
                }
              : m
          ),
        })),

      removeMomentComment: (id, commentId) =>
        set((s) => ({
          media: s.media.map((m) =>
            m.id === id
              ? { ...m, comments: (m.comments ?? []).filter((c) => c.id !== commentId) }
              : m
          ),
        })),

      resetAll: () =>
        set({
          onboarded: false,
          stage: 'ttc',
          members: DEFAULT_MEMBERS,
          permissions: DEFAULT_PERMISSIONS,
          activeMemberId: 'm-mom',
          mother: { cycleLength: 28 },
          baby: { name: '宝宝' },
          healthRecords: [],
          careRecords: [],
          growthRecords: [],
          reminders: seedReminders(),
        }),
    }),
    { name: 'pregvoice:app' }
  )
);
