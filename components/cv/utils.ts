import type { CvData, CvTimelineItem } from "@/types/cv";
import type {
  IndexedTimelineItem,
  TimelineKind,
  TimelineSection,
} from "@/components/cv/types";

export function cloneCv(value: CvData): CvData {
  return JSON.parse(JSON.stringify(value)) as CvData;
}

export function createCvItemId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

/**
 * Keep whitespace and blank lines while a controlled textarea is being edited.
 * The payload is trimmed and empty entries are removed by createCvUpdatePayload.
 */
export function splitEditableLines(value: string) {
  return value.split("\n");
}

export function safeWebsite(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function safeAvatar(value: string | null) {
  if (!value) return null;
  if (value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function getWebsiteLabel(value: string) {
  return value.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function isTimelineKind(
  item: CvTimelineItem,
  section: TimelineSection,
  kind: TimelineKind,
) {
  if (section === "education") return kind === "education";
  const isProject = item.kind === "project" || item.id.startsWith("project-");
  return kind === "project" ? isProject : !isProject;
}

export function getTimelineItems(
  items: CvTimelineItem[],
  section: TimelineSection,
  kind: TimelineKind,
): IndexedTimelineItem[] {
  return items
    .map((item, sourceIndex) => ({ item, sourceIndex }))
    .filter(({ item }) => isTimelineKind(item, section, kind));
}

export function formatUpdatedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

