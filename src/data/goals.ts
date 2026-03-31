// ─── Goal-setting data per module ─────────────────────────────────────────────

export interface GoalConfig {
  moduleId: string;
  moduleTitle: string;
  programLabel: string; // e.g. "HEALTHY MOM, HEALTHY FAMILY"
  intro: string;
  instructions: string;
  goalOptions: string[];
}

export const GOAL_CONFIGS: GoalConfig[] = [
  {
    moduleId: 'mod-1',
    moduleTitle: 'Feeding Your Baby',
    programLabel: 'HEALTHY MOM, HEALTHY FAMILY',
    intro:
      "Now that you've explored this topic, take a moment to think about what changes you'd like to make for you and your baby. Setting small, realistic goals can help you build healthy habits over time.",
    instructions:
      "Choose one or more goals from the list below, or create your own. Then, write down the steps you'll take to reach your goal and set a date to get started. If challenges come up, think about how you can overcome them. Your home visitor is here to support you along the way!",
    goalOptions: [
      "Learn to recognize my baby's hunger and fullness cues.",
      "Try at least one new feeding position or technique.",
      "Talk to my doctor or WIC about breastfeeding or formula feeding questions.",
      "Build a consistent feeding routine for my baby.",
      "Try introducing one new food or texture to my baby.",
    ],
  },
];
