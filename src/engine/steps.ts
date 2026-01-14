import { StepConfig } from "./types";

export const stepsConfig: StepConfig[] = [
  {
    id: "NIGHT_START",
    phase: "NIGHT",
    titleZh: "夜晚開始",
    scriptZh: "天黑請閉眼，狼人睜眼。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: true,
    minDurationSec: 2,
    maxDurationSec: 6,
    requiresInput: false,
    input: null
  },
  {
    id: "WEREWOLF_STEP",
    phase: "NIGHT",
    titleZh: "狼人行動",
    scriptZh: "狼人請選擇擊殺目標。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: true,
    minDurationSec: 2,
    maxDurationSec: 20,
    requiresInput: true,
    input: {
      kind: "selectSeat",
      promptZh: "狼人擊殺哪個座位？",
      allowNone: true
    }
  },
  {
    id: "SEER_STEP",
    phase: "NIGHT",
    titleZh: "預言家行動",
    scriptZh: "預言家請查驗一名玩家。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: true,
    minDurationSec: 2,
    maxDurationSec: 20,
    requiresInput: true,
    input: {
      kind: "selectSeat",
      promptZh: "預言家驗誰？",
      allowNone: false
    }
  },
  {
    id: "WITCH_STEP",
    phase: "NIGHT",
    titleZh: "女巫行動",
    scriptZh: "女巫請使用解藥或毒藥。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: true,
    minDurationSec: 2,
    maxDurationSec: 20,
    requiresInput: true,
    input: {
      kind: "selectSeat",
      promptZh: "女巫選擇救/毒座位，或不使用",
      allowNone: true
    }
  },
  {
    id: "NIGHT_RESOLVE",
    phase: "NIGHT_RESOLVE",
    titleZh: "夜晚結算",
    scriptZh: "整理夜晚結果。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: true,
    minDurationSec: 2,
    maxDurationSec: 10,
    requiresInput: false,
    input: null
  },
  {
    id: "DAY_START",
    phase: "DAY",
    titleZh: "天亮",
    scriptZh: "天亮了，大家請睜眼。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: true,
    minDurationSec: 2,
    maxDurationSec: 8,
    requiresInput: false,
    input: null
  },
  {
    id: "DAY_DISCUSSION",
    phase: "DAY",
    titleZh: "白天討論",
    scriptZh: "開始討論。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: false,
    minDurationSec: 20,
    maxDurationSec: 180,
    requiresInput: false,
    input: null
  },
  {
    id: "DAY_VOTING",
    phase: "DAY",
    titleZh: "白天投票",
    scriptZh: "開始投票。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: true,
    minDurationSec: 2,
    maxDurationSec: 60,
    requiresInput: true,
    input: {
      kind: "voteMatrix",
      promptZh: "請輸入票型",
      allowNone: false
    }
  },
  {
    id: "DAY_EXECUTION",
    phase: "DAY",
    titleZh: "處決",
    scriptZh: "投票結束，處決結果宣布。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: true,
    minDurationSec: 2,
    maxDurationSec: 20,
    requiresInput: true,
    input: {
      kind: "selectSeat",
      promptZh: "如有獵人技能，選擇帶走對象",
      allowNone: true
    }
  },
  {
    id: "CHECK_WIN",
    phase: "CHECK_WIN",
    titleZh: "勝負判定",
    scriptZh: "判斷勝負。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: true,
    minDurationSec: 2,
    maxDurationSec: 10,
    requiresInput: false,
    input: null
  },
  {
    id: "GAME_END",
    phase: "GAME_END",
    titleZh: "遊戲結束",
    scriptZh: "遊戲結束。",
    audioFile: null,
    autoPlay: true,
    autoAdvance: false,
    minDurationSec: 2,
    maxDurationSec: 10,
    requiresInput: false,
    input: null
  }
];

export const stepOrder = stepsConfig.map((step) => step.id);
