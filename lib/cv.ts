import type {
  CvData,
  CvSkillGroup,
  CvTimelineItem,
  CvUpdatePayload,
} from "@/types/cv";

const MAX_TIMELINE_ITEMS = 20;
const MAX_SKILL_GROUPS = 12;
const MAX_LIST_ITEMS = 24;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength = 2000): string {
  return typeof value === "string"
    ? value
        .replace(/\r\n/g, "\n")
        .replace(/\u0000/g, "")
        .trim()
        .slice(0, maxLength)
    : "";
}

function cleanList(value: unknown, limit = MAX_LIST_ITEMS): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanText(item, 240))
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeTimelineItem(
  value: unknown,
  index: number
): CvTimelineItem | null {
  if (!isRecord(value)) return null;

  const title = cleanText(value.title, 160);
  const organization = cleanText(value.organization, 200);
  if (!title && !organization) return null;
  const id = cleanText(value.id, 80) || "timeline-" + (index + 1);
  const isProject = value.kind === "project" || id.startsWith("project-");
  const url = cleanText(value.url, 500);

  return {
    id,
    ...(isProject ? { kind: "project" as const } : {}),
    period: cleanText(value.period, 80),
    title,
    organization,
    location: cleanText(value.location, 160),
    ...(url ? { url } : {}),
    description: cleanText(value.description, 1500),
    highlights: cleanList(value.highlights, 12),
  };
}

function normalizeTimeline(value: unknown): CvTimelineItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, MAX_TIMELINE_ITEMS)
    .map(normalizeTimelineItem)
    .filter((item): item is CvTimelineItem => item !== null);
}

function normalizeSkillGroup(
  value: unknown,
  index: number
): CvSkillGroup | null {
  if (!isRecord(value)) return null;

  const title = cleanText(value.title, 120);
  const items = cleanList(value.items);
  if (!title && items.length === 0) return null;

  return {
    id: cleanText(value.id, 80) || "skill-" + (index + 1),
    title: title || "Kỹ năng",
    icon: cleanText(value.icon, 80) || "fa-sparkles",
    items,
  };
}

function normalizeSkills(value: unknown): CvSkillGroup[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, MAX_SKILL_GROUPS)
    .map(normalizeSkillGroup)
    .filter((group): group is CvSkillGroup => group !== null);
}

export function normalizeCvData(value: unknown): CvData | null {
  if (!isRecord(value)) return null;

  const id = Number(value.id);
  const fullName = cleanText(value.full_name, 160);
  if (id !== 1 || !fullName) return null;

  return {
    id,
    full_name: fullName,
    nickname: cleanText(value.nickname, 120),
    headline: cleanText(value.headline, 240),
    summary: cleanText(value.summary, 2000),
    location: cleanText(value.location, 160),
    email: cleanText(value.email, 254),
    website: cleanText(value.website, 300),
    avatar_url: cleanText(value.avatar_url, 1000) || null,
    experience: normalizeTimeline(value.experience),
    education: normalizeTimeline(value.education),
    skills: normalizeSkills(value.skills),
    interests: cleanList(value.interests),
    is_published: value.is_published === true,
    updated_at: cleanText(value.updated_at, 80),
  };
}

export function createCvUpdatePayload(value: CvData): CvUpdatePayload {
  const normalized = normalizeCvData({ ...value, id: 1 });

  if (!normalized) {
    throw new Error("Dữ liệu CV không hợp lệ.");
  }

  return {
    full_name: normalized.full_name,
    nickname: normalized.nickname,
    headline: normalized.headline,
    summary: normalized.summary,
    location: normalized.location,
    email: normalized.email,
    website: normalized.website,
    avatar_url: normalized.avatar_url,
    experience: normalized.experience,
    education: normalized.education,
    skills: normalized.skills,
    interests: normalized.interests,
  };
}
