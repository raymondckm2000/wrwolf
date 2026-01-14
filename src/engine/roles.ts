import { Role } from "./types";

export const baseRoles: Role[] = [
  {
    id: "seer",
    nameZh: "預言家",
    camp: "good",
    nightAction: { type: "selectTarget" },
    descriptionZh: "每晚可查驗一名玩家陣營。",
    enabled: true,
    count: 1
  },
  {
    id: "witch",
    nameZh: "女巫",
    camp: "good",
    nightAction: { type: "selectTargetOptional" },
    descriptionZh: "擁有解藥與毒藥，各一次。",
    enabled: true,
    count: 1
  },
  {
    id: "hunter",
    nameZh: "獵人",
    camp: "good",
    nightAction: { type: "yesNo" },
    descriptionZh: "死亡時可帶走一名玩家。",
    enabled: true,
    count: 1
  },
  {
    id: "villager",
    nameZh: "平民",
    camp: "good",
    descriptionZh: "沒有特殊技能。",
    enabled: true,
    count: 4
  },
  {
    id: "werewolf",
    nameZh: "狼人",
    camp: "wolf",
    nightAction: { type: "selectTarget" },
    descriptionZh: "每晚共同選擇擊殺目標。",
    enabled: true,
    count: 3
  }
];

export const expandRolePool = (roles: Role[]): Role[] => {
  const pool: Role[] = [];
  roles.forEach((role) => {
    const count = role.count ?? 1;
    for (let i = 0; i < count; i += 1) {
      pool.push({ ...role });
    }
  });
  return pool;
};

export const countByCamp = (roles: Role[]) => {
  return roles.reduce(
    (acc, role) => {
      acc[role.camp] += role.count ?? 1;
      return acc;
    },
    { good: 0, wolf: 0, third: 0 }
  );
};
