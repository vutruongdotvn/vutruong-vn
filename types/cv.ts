export type CvTimelineItem = {
  id: string;
  period: string;
  title: string;
  organization: string;
  location: string;
  description: string;
  highlights: string[];
};

export type CvSkillGroup = {
  id: string;
  title: string;
  icon: string;
  items: string[];
};

export type CvData = {
  id: number;
  full_name: string;
  nickname: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  website: string;
  avatar_url: string | null;
  experience: CvTimelineItem[];
  education: CvTimelineItem[];
  skills: CvSkillGroup[];
  interests: string[];
  is_published: boolean;
  updated_at: string;
};

export type CvUpdatePayload = Pick<
  CvData,
  | "full_name"
  | "nickname"
  | "headline"
  | "summary"
  | "location"
  | "email"
  | "website"
  | "avatar_url"
  | "experience"
  | "education"
  | "skills"
  | "interests"
>;
