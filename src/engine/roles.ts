import { Role } from "./types";

export const baseRoles: Role[] = [
  {
    id: "seer",
    nameZh: "預言家",
    camp: "good",
    nightAction: { type: "selectTarget" },
    descriptionZh: "每晚可查驗一名玩家陣營。",
    enabled: true
  },
  {
    id: "witch",
    nameZh: "女巫",
    camp: "good",
    nightAction: { type: "selectTargetOptional" },
    descriptionZh: "擁有解藥與毒藥，各一次。",
    enabled: true
  },
  {
    id: "hunter",
    nameZh: "獵人",
    camp: "good",
    nightAction: { type: "yesNo" },
    descriptionZh: "死亡時可帶走一名玩家。",
    enabled: true
  },
  {
    id: "villager",
    nameZh: "平民",
    camp: "good",
    descriptionZh: "沒有特殊技能。",
    enabled: true
  },
  {
    id: "werewolf",
    nameZh: "狼人",
    camp: "wolf",
    nightAction: { type: "selectTarget" },
    descriptionZh: "每晚共同選擇擊殺目標。",
    enabled: true
  }
];

export const roleCounts: Record<string, number> = {
  seer: 1,
  witch: 1,
  hunter: 1,
  villager: 4,
  werewolf: 3
};

export const expandRolePool = (roles: Role[]): Role[] => {
  const pool: Role[] = [];
  roles.forEach((role) => {
    const count = roleCounts[role.id] ?? 1;
    for (let i = 0; i < count; i += 1) {
      pool.push({ ...role });
    }
  });
  return pool;
};

export const countByCamp = (roles: Role[]) => {
  return roles.reduce(
    (acc, role) => {
      acc[role.camp] += 1;
      return acc;
    },
    { good: 0, wolf: 0, third: 0 }
  );
};
