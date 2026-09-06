"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { createCvUpdatePayload, normalizeCvData } from "@/lib/cv";
import type { CvData, CvSkillGroup, CvTimelineItem } from "@/types/cv";

const ADMIN_USER_ID = "785f79e8-223a-41ea-a52d-dead8e2bf383";
const CV_SELECT = "id,full_name,nickname,headline,summary,location,email,website,avatar_url,experience,education,skills,interests,is_published,updated_at";

type TimelineSection = "experience" | "education";

type CvPageProps = {
  initialCv: CvData | null;
};

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base font-normal text-foreground outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/20";

function cloneCv(value: CvData): CvData {
  return JSON.parse(JSON.stringify(value)) as CvData;
}

function createId(prefix: string) {
  return prefix + "-" + crypto.randomUUID();
}

function linesToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function safeWebsite(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function safeAvatar(value: string | null) {
  if (!value) return null;
  if (value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export default function CvPage({ initialCv }: CvPageProps) {
  const { user, role, loading: authLoading } = useUser();
  const { showToast } = useToast();

  const [cv, setCv] = useState<CvData | null>(initialCv);
  const [draft, setDraft] = useState<CvData | null>(
    initialCv ? cloneCv(initialCv) : null
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const isAdmin =
    !authLoading && role === "admin" && user?.id === ADMIN_USER_ID;
  const data = editing ? draft : cv;
  const isDirty = useMemo(
    () => Boolean(cv && draft && JSON.stringify(cv) !== JSON.stringify(draft)),
    [cv, draft]
  );

  useEffect(() => {
    if (!editing || authLoading || isAdmin) return;
    setEditing(false);
    if (cv) setDraft(cloneCv(cv));
  }, [authLoading, cv, editing, isAdmin]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [data?.avatar_url]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 pb-28 pt-24 md:pb-10">
        <section className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-muted text-xl text-muted-foreground">
            <i className="fa-duotone fa-file-user" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-semibold">CV đang được cập nhật</h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground">
            Nội dung chưa sẵn sàng. Vui lòng quay lại sau.
          </p>
        </section>
      </main>
    );
  }

  const updateField = <Key extends keyof CvData>(
    key: Key,
    value: CvData[Key]
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateTimeline = (
    section: TimelineSection,
    index: number,
    patch: Partial<CvTimelineItem>
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            [section]: current[section].map((item, itemIndex) =>
              itemIndex === index ? { ...item, ...patch } : item
            ),
          }
        : current
    );
  };

  const addTimeline = (section: TimelineSection) => {
    const item: CvTimelineItem = {
      id: createId(section),
      period: "",
      title: "",
      organization: "",
      location: "",
      description: "",
      highlights: [],
    };

    setDraft((current) =>
      current
        ? { ...current, [section]: [...current[section], item] }
        : current
    );
  };

  const removeTimeline = (section: TimelineSection, index: number) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            [section]: current[section].filter(
              (_, itemIndex) => itemIndex !== index
            ),
          }
        : current
    );
  };

  const moveTimeline = (
    section: TimelineSection,
    index: number,
    direction: -1 | 1
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const next = [...current[section]];
      const destination = index + direction;
      if (destination < 0 || destination >= next.length) return current;
      [next[index], next[destination]] = [next[destination], next[index]];
      return { ...current, [section]: next };
    });
  };

  const updateSkill = (
    index: number,
    patch: Partial<CvSkillGroup>
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            skills: current.skills.map((group, groupIndex) =>
              groupIndex === index ? { ...group, ...patch } : group
            ),
          }
        : current
    );
  };

  const addSkill = () => {
    setDraft((current) =>
      current
        ? {
            ...current,
            skills: [
              ...current.skills,
              {
                id: createId("skill"),
                title: "Nhóm kỹ năng mới",
                icon: "fa-sparkles",
                items: [],
              },
            ],
          }
        : current
    );
  };

  const removeSkill = (index: number) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            skills: current.skills.filter(
              (_, groupIndex) => groupIndex !== index
            ),
          }
        : current
    );
  };

  const moveSkill = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      if (!current) return current;
      const next = [...current.skills];
      const destination = index + direction;
      if (destination < 0 || destination >= next.length) return current;
      [next[index], next[destination]] = [next[destination], next[index]];
      return { ...current, skills: next };
    });
  };

  const beginEditing = () => {
    if (!isAdmin || !cv) return;
    setDraft(cloneCv(cv));
    setEditing(true);
  };

  const cancelEditing = () => {
    if (isDirty && !window.confirm("Bạn có thay đổi chưa lưu. Huỷ bỏ?")) {
      return;
    }

    setDraft(cv ? cloneCv(cv) : null);
    setEditing(false);
  };

  const saveCv = async () => {
    if (!isAdmin || !draft || saving) return;

    if (!draft.full_name.trim() || !draft.headline.trim() || !draft.summary.trim()) {
      showToast("Vui lòng nhập đủ tên, tiêu đề và phần giới thiệu.", "warning");
      return;
    }

    if (draft.email && !draft.email.includes("@")) {
      showToast("Email chưa đúng định dạng.", "warning");
      return;
    }

    if (draft.website && !safeWebsite(draft.website)) {
      showToast("Website chưa đúng định dạng URL.", "warning");
      return;
    }

    if (draft.avatar_url && !safeAvatar(draft.avatar_url)) {
      showToast("Ảnh đại diện phải là URL HTTPS hợp lệ.", "warning");
      return;
    }

    setSaving(true);

    try {
      const payload = createCvUpdatePayload(draft);
      const { data: saved, error } = await supabase
        .from("cv")
        .update(payload)
        .eq("id", 1)
        .select(CV_SELECT)
        .single();

      if (error) throw error;

      const normalized = normalizeCvData(saved);
      if (!normalized) throw new Error("Dữ liệu phản hồi không hợp lệ.");

      setCv(normalized);
      setDraft(cloneCv(normalized));
      setEditing(false);
      showToast("Đã cập nhật CV.", "success");
    } catch (error) {
      console.error("CV update failed:", error);
      showToast("Không thể lưu CV lúc này.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveCv();
  };

  const websiteUrl = safeWebsite(data.website);
  const avatarUrl = safeAvatar(data.avatar_url);
  const initials = data.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <main className="cv-page min-h-screen px-3 pb-28 pt-20 sm:px-5 sm:pt-24 md:pb-10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-6xl"
      >
        <div className="cv-no-print mb-3 flex min-h-11 items-center justify-end gap-2">
          {!editing && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground/75 shadow-sm transition hover:bg-muted hover:text-foreground active:scale-95"
            >
              <i className="fa-duotone fa-print" aria-hidden="true" />
              <span className="hidden sm:inline">In CV</span>
            </button>
          )}

          {isAdmin && !editing && (
            <button
              type="button"
              onClick={beginEditing}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
            >
              <i className="fa-duotone fa-pen" aria-hidden="true" />
              Chỉnh sửa
            </button>
          )}

          {isAdmin && editing && (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="cursor-pointer rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <i
                  className={cn(
                    "fa-duotone",
                    saving ? "fa-spinner-third fa-spin" : "fa-floppy-disk"
                  )}
                  aria-hidden="true"
                />
                {saving ? "Đang lưu" : "Lưu thay đổi"}
              </button>
            </>
          )}
        </div>

        <article className="cv-sheet overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:rounded-3xl">
          <header className="relative overflow-hidden border-b border-border px-5 py-8 sm:px-10 sm:py-11">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-muted),transparent_48%)] opacity-80"
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="shrink-0">
                <div className="grid size-24 overflow-hidden rounded-[1.75rem] bg-primary text-2xl font-bold text-primary-foreground shadow-sm sm:size-28">
                  {avatarUrl && !avatarFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={"Ảnh đại diện của " + data.full_name}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    <span className="m-auto">{initials || "VT"}</span>
                  )}
                </div>

                {editing && (
                  <label className="mt-3 block w-52 text-xs font-medium text-muted-foreground">
                    URL ảnh đại diện
                    <input
                      type="url"
                      maxLength={1000}
                      value={data.avatar_url ?? ""}
                      onChange={(event) =>
                        updateField("avatar_url", event.target.value || null)
                      }
                      className={cn(inputClass, "mt-1 text-sm")}
                      placeholder="https://..."
                    />
                  </label>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {editing ? (
                  <input
                    required
                    maxLength={160}
                    aria-label="Họ và tên"
                    value={data.full_name}
                    onChange={(event) =>
                      updateField("full_name", event.target.value)
                    }
                    className={cn(
                      inputClass,
                      "mb-3 text-2xl font-bold tracking-tight sm:text-4xl"
                    )}
                  />
                ) : (
                  <h1 className="text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">
                    {data.full_name}
                  </h1>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {editing ? (
                    <input
                      maxLength={120}
                      aria-label="Tên gọi khác"
                      value={data.nickname}
                      onChange={(event) =>
                        updateField("nickname", event.target.value)
                      }
                      className={cn(inputClass, "max-w-52 text-sm")}
                      placeholder="Tên gọi khác"
                    />
                  ) : (
                    data.nickname && (
                      <span className="rounded-full bg-muted px-3 py-1.5 font-medium text-foreground/75">
                        {data.nickname}
                      </span>
                    )
                  )}

                  {!editing && data.location && (
                    <span className="inline-flex items-center gap-1.5 px-1">
                      <i className="fa-duotone fa-location-dot" aria-hidden="true" />
                      {data.location}
                    </span>
                  )}
                </div>

                {editing ? (
                  <input
                    required
                    maxLength={240}
                    aria-label="Tiêu đề nghề nghiệp"
                    value={data.headline}
                    onChange={(event) =>
                      updateField("headline", event.target.value)
                    }
                    className={cn(
                      inputClass,
                      "mt-4 text-lg font-medium sm:text-xl"
                    )}
                  />
                ) : (
                  <p className="mt-4 max-w-3xl text-lg font-medium leading-7 text-foreground/80 sm:text-xl">
                    {data.headline}
                  </p>
                )}

                {editing ? (
                  <textarea
                    required
                    rows={5}
                    maxLength={2000}
                    aria-label="Giới thiệu ngắn"
                    value={data.summary}
                    onChange={(event) =>
                      updateField("summary", event.target.value)
                    }
                    className={cn(inputClass, "mt-5 resize-y leading-7")}
                  />
                ) : (
                  <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-7 text-muted-foreground">
                    {data.summary}
                  </p>
                )}
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-[0.78fr_1.45fr]">
            <aside className="space-y-8 border-b border-border bg-muted/20 p-5 sm:p-8 lg:border-b-0 lg:border-r lg:p-9">
              <CvSectionTitle icon="fa-address-card" title="Thông tin" />

              <div className="space-y-3">
                {editing ? (
                  <>
                    <LabeledInput
                      label="Địa điểm công khai"
                      value={data.location}
                      maxLength={160}
                      onChange={(value) => updateField("location", value)}
                    />
                    <LabeledInput
                      label="Email công khai"
                      value={data.email}
                      maxLength={254}
                      type="email"
                      onChange={(value) => updateField("email", value)}
                    />
                    <LabeledInput
                      label="Website"
                      value={data.website}
                      maxLength={300}
                      type="url"
                      onChange={(value) => updateField("website", value)}
                    />
                  </>
                ) : (
                  <>
                    {data.location && (
                      <ContactItem icon="fa-location-dot" label="Địa điểm">
                        <span>{data.location}</span>
                      </ContactItem>
                    )}
                    {data.email && (
                      <ContactItem icon="fa-envelope" label="Email">
                        <a
                          href={"mailto:" + data.email}
                          className="break-all font-medium text-foreground hover:underline"
                        >
                          {data.email}
                        </a>
                      </ContactItem>
                    )}
                    {websiteUrl && (
                      <ContactItem icon="fa-globe" label="Website">
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all font-medium text-foreground hover:underline"
                        >
                          {data.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                        </a>
                      </ContactItem>
                    )}
                  </>
                )}
              </div>

              <div>
                <CvSectionTitle icon="fa-sparkles" title="Kỹ năng" />
                <div className="mt-4 space-y-5">
                  {data.skills.map((group, index) => (
                    <div key={group.id} className="cv-skill-group">
                      <div className="flex items-center gap-2">
                        <i
                          className={cn(
                            "fa-duotone w-5 text-center text-muted-foreground",
                            group.icon
                          )}
                          aria-hidden="true"
                        />
                        {editing ? (
                          <input
                            maxLength={120}
                            aria-label={"Tên nhóm kỹ năng " + (index + 1)}
                            value={group.title}
                            onChange={(event) =>
                              updateSkill(index, { title: event.target.value })
                            }
                            className={cn(inputClass, "py-2 text-sm font-semibold")}
                          />
                        ) : (
                          <h3 className="text-sm font-semibold">{group.title}</h3>
                        )}

                        {editing && (
                          <ItemControls
                            index={index}
                            total={data.skills.length}
                            onMove={(direction) => moveSkill(index, direction)}
                            onRemove={() => removeSkill(index)}
                          />
                        )}
                      </div>

                      {editing ? (
                        <textarea
                          rows={5}
                          aria-label={"Danh sách kỹ năng " + (index + 1)}
                          value={group.items.join("\n")}
                          onChange={(event) =>
                            updateSkill(index, {
                              items: linesToList(event.target.value),
                            })
                          }
                          className={cn(inputClass, "mt-2 resize-y text-sm leading-6")}
                          placeholder="Mỗi kỹ năng một dòng"
                        />
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <span
                              key={item}
                              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm leading-5 text-foreground/75"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {editing && (
                    <AddItemButton label="Thêm nhóm kỹ năng" onClick={addSkill} />
                  )}
                </div>
              </div>

              <div>
                <CvSectionTitle icon="fa-heart" title="Sở thích" />
                {editing ? (
                  <textarea
                    rows={7}
                    aria-label="Danh sách sở thích"
                    value={data.interests.join("\n")}
                    onChange={(event) =>
                      updateField("interests", linesToList(event.target.value))
                    }
                    className={cn(inputClass, "mt-4 resize-y text-sm leading-6")}
                    placeholder="Mỗi sở thích một dòng"
                  />
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-muted px-3 py-1.5 text-sm text-foreground/75"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            <div className="space-y-10 p-5 sm:p-8 lg:p-10">
              <Timeline
                title="Kinh nghiệm và hoạt động"
                icon="fa-briefcase"
                section="experience"
                items={data.experience}
                editing={editing}
                onUpdate={updateTimeline}
                onAdd={addTimeline}
                onRemove={removeTimeline}
                onMove={moveTimeline}
              />

              <Timeline
                title="Học vấn"
                icon="fa-graduation-cap"
                section="education"
                items={data.education}
                editing={editing}
                onUpdate={updateTimeline}
                onAdd={addTimeline}
                onRemove={removeTimeline}
                onMove={moveTimeline}
              />
            </div>
          </div>
        </article>
      </form>
    </main>
  );
}

function CvSectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
        <i className={cn("fa-duotone", icon)} aria-hidden="true" />
      </span>
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/80">
        {title}
      </h2>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
        <i className={cn("fa-duotone", icon)} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm leading-5">{children}</div>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  maxLength,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  type?: "text" | "email" | "url";
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-medium text-muted-foreground">
      {label}
      <input
        type={type}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "mt-1 text-sm")}
      />
    </label>
  );
}

function Timeline({
  title,
  icon,
  section,
  items,
  editing,
  onUpdate,
  onAdd,
  onRemove,
  onMove,
}: {
  title: string;
  icon: string;
  section: TimelineSection;
  items: CvTimelineItem[];
  editing: boolean;
  onUpdate: (
    section: TimelineSection,
    index: number,
    patch: Partial<CvTimelineItem>
  ) => void;
  onAdd: (section: TimelineSection) => void;
  onRemove: (section: TimelineSection, index: number) => void;
  onMove: (
    section: TimelineSection,
    index: number,
    direction: -1 | 1
  ) => void;
}) {
  return (
    <section>
      <CvSectionTitle icon={icon} title={title} />

      <div className="relative mt-6 space-y-7 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="cv-timeline-item relative pl-8"
          >
            <span
              className="absolute left-0 top-2 size-[15px] rounded-full border-[4px] border-card bg-foreground/60 ring-1 ring-border"
              aria-hidden="true"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              {editing ? (
                <input
                  maxLength={80}
                  aria-label={"Thời gian " + (index + 1)}
                  value={item.period}
                  onChange={(event) =>
                    onUpdate(section, index, { period: event.target.value })
                  }
                  className={cn(inputClass, "w-full py-2 text-sm sm:max-w-40")}
                  placeholder="Thời gian"
                />
              ) : (
                <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {item.period}
                </span>
              )}

              {editing && (
                <ItemControls
                  index={index}
                  total={items.length}
                  onMove={(direction) => onMove(section, index, direction)}
                  onRemove={() => onRemove(section, index)}
                />
              )}
            </div>

            {editing ? (
              <div className="mt-3 space-y-2.5">
                <input
                  required
                  maxLength={160}
                  aria-label={"Vai trò " + (index + 1)}
                  value={item.title}
                  onChange={(event) =>
                    onUpdate(section, index, { title: event.target.value })
                  }
                  className={cn(inputClass, "font-semibold")}
                  placeholder="Vai trò hoặc chương trình"
                />
                <input
                  maxLength={200}
                  aria-label={"Đơn vị " + (index + 1)}
                  value={item.organization}
                  onChange={(event) =>
                    onUpdate(section, index, {
                      organization: event.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Đơn vị"
                />
                <input
                  maxLength={160}
                  aria-label={"Địa điểm " + (index + 1)}
                  value={item.location}
                  onChange={(event) =>
                    onUpdate(section, index, { location: event.target.value })
                  }
                  className={inputClass}
                  placeholder="Địa điểm"
                />
                <textarea
                  rows={3}
                  maxLength={1500}
                  aria-label={"Mô tả " + (index + 1)}
                  value={item.description}
                  onChange={(event) =>
                    onUpdate(section, index, {
                      description: event.target.value,
                    })
                  }
                  className={cn(inputClass, "resize-y leading-6")}
                  placeholder="Mô tả"
                />
                <textarea
                  rows={4}
                  aria-label={"Điểm nổi bật " + (index + 1)}
                  value={item.highlights.join("\n")}
                  onChange={(event) =>
                    onUpdate(section, index, {
                      highlights: linesToList(event.target.value),
                    })
                  }
                  className={cn(inputClass, "resize-y text-sm leading-6")}
                  placeholder="Mỗi điểm nổi bật một dòng"
                />
              </div>
            ) : (
              <>
                <h3 className="mt-3 text-lg font-bold leading-7 text-foreground">
                  {item.title}
                </h3>

                {(item.organization || item.location) && (
                  <p className="mt-1 text-sm font-medium leading-6 text-foreground/70">
                    {item.organization}
                    {item.organization && item.location ? " • " : ""}
                    {item.location}
                  </p>
                )}

                {item.description && (
                  <p className="mt-3 whitespace-pre-line text-base leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                )}

                {item.highlights.length > 0 && (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/75">
                    {item.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2.5">
                        <span className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-foreground/40" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </article>
        ))}
      </div>

      {editing && (
        <div className="mt-6 pl-8">
          <AddItemButton
            label={"Thêm " + title.toLowerCase()}
            onClick={() => onAdd(section)}
          />
        </div>
      )}
    </section>
  );
}

function ItemControls({
  index,
  total,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="cv-no-print ml-auto flex shrink-0 items-center gap-1">
      <SmallIconButton
        label="Di chuyển lên"
        icon="fa-arrow-up"
        disabled={index === 0}
        onClick={() => onMove(-1)}
      />
      <SmallIconButton
        label="Di chuyển xuống"
        icon="fa-arrow-down"
        disabled={index === total - 1}
        onClick={() => onMove(1)}
      />
      <SmallIconButton
        label="Xoá mục"
        icon="fa-trash"
        danger
        onClick={onRemove}
      />
    </div>
  );
}

function SmallIconButton({
  label,
  icon,
  disabled = false,
  danger = false,
  onClick,
}: {
  label: string;
  icon: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-9 cursor-pointer place-items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-25",
        danger
          ? "text-red-600 hover:bg-red-500/10 dark:text-red-300"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <i className={cn("fa-duotone", icon)} aria-hidden="true" />
    </button>
  );
}

function AddItemButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cv-no-print flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-input px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-foreground/25 hover:bg-muted/50 hover:text-foreground"
    >
      <i className="fa-duotone fa-plus" aria-hidden="true" />
      {label}
    </button>
  );
}
