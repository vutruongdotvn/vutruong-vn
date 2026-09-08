import type { CvData, CvSkillGroup, CvTimelineItem } from "@/types/cv";

export type TimelineSection = "experience" | "education";
export type TimelineKind = "experience" | "project" | "education";

export type IndexedTimelineItem = {
  item: CvTimelineItem;
  sourceIndex: number;
};

export type CvFieldUpdater = <Key extends keyof CvData>(
  key: Key,
  value: CvData[Key],
) => void;

export type TimelineUpdater = (
  section: TimelineSection,
  index: number,
  patch: Partial<CvTimelineItem>,
) => void;

export type TimelineAdder = (
  section: TimelineSection,
  kind: TimelineKind,
) => void;

export type TimelineRemover = (
  section: TimelineSection,
  index: number,
) => void;

export type TimelineMover = (
  section: TimelineSection,
  index: number,
  direction: -1 | 1,
  kind: TimelineKind,
) => void;

export type SkillUpdater = (
  index: number,
  patch: Partial<CvSkillGroup>,
) => void;

