import { Rules } from "./types";

export const defaultRules: Rules = {
  noRevealOnDeath: false,
  wolfCanSameTargetConsecutive: true,
  witchFirstNightNoSelfSave: true,
  witchNoDoublePotionSameNight: true,
  hunterMaySkipOnDeath: true,
  hunterAndWolfKingChainSkill: false,
  winByRemainingSkillsEdge: false,
  doubleExplodeWarn: true
};

export const rulesDescriptions: Record<keyof Rules, string> = {
  noRevealOnDeath: "死亡不翻牌",
  wolfCanSameTargetConsecutive: "狼人可連續同刀",
  witchFirstNightNoSelfSave: "女巫首夜不可自救",
  witchNoDoublePotionSameNight: "女巫同夜不可雙藥",
  hunterMaySkipOnDeath: "獵人可跳過帶人",
  hunterAndWolfKingChainSkill: "獵人與狼王連鎖技能",
  winByRemainingSkillsEdge: "屠邊/技能判斷勝利",
  doubleExplodeWarn: "雙爆需提醒"
};
