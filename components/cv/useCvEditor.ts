"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import { createCvUpdatePayload, normalizeCvData } from "@/lib/cv";
import type { CvData, CvSkillGroup, CvTimelineItem } from "@/types/cv";
import type { TimelineKind, TimelineSection } from "@/components/cv/types";
import {
  cloneCv,
  createCvItemId,
  isTimelineKind,
  safeAvatar,
  safeWebsite,
} from "@/components/cv/utils";

const ADMIN_USER_ID = "785f79e8-223a-41ea-a52d-dead8e2bf383";
const CV_SELECT =
  "id,full_name,nickname,headline,summary,location,email,website,avatar_url,experience,education,skills,interests,is_published,updated_at";
const CV_CONFLICT_ERROR = "CV_STALE_VERSION";

export function useCvEditor(initialCv: CvData | null) {
  const { user, role, loading: authLoading } = useUser();
  const { showToast } = useToast();

  const [cv, setCv] = useState<CvData | null>(initialCv);
  const [draft, setDraft] = useState<CvData | null>(
    initialCv ? cloneCv(initialCv) : null,
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin =
    !authLoading && role === "admin" && user?.id === ADMIN_USER_ID;
  const data = editing ? draft : cv;
  const isDirty = useMemo(
    () => Boolean(cv && draft && JSON.stringify(cv) !== JSON.stringify(draft)),
    [cv, draft],
  );

  useEffect(() => {
    if (!editing || authLoading || isAdmin) return;
    setEditing(false);
    if (cv) setDraft(cloneCv(cv));
  }, [authLoading, cv, editing, isAdmin]);

  useEffect(() => {
    if (!editing || !isDirty) return;

    const preventAccidentalClose = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", preventAccidentalClose);
    return () =>
      window.removeEventListener("beforeunload", preventAccidentalClose);
  }, [editing, isDirty]);

  const updateField = <Key extends keyof CvData>(
    key: Key,
    value: CvData[Key],
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateTimeline = (
    section: TimelineSection,
    index: number,
    patch: Partial<CvTimelineItem>,
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            [section]: current[section].map((item, itemIndex) =>
              itemIndex === index ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );
  };

  const addTimeline = (section: TimelineSection, kind: TimelineKind) => {
    const item: CvTimelineItem = {
      id: createCvItemId(kind === "project" ? "project" : section),
      ...(kind === "project" ? { kind: "project" as const } : {}),
      period: "",
      title: "",
      organization: "",
      location: "",
      ...(kind === "project" ? { url: "" } : {}),
      description: "",
      highlights: [],
    };

    setDraft((current) =>
      current
        ? { ...current, [section]: [...current[section], item] }
        : current,
    );
  };

  const removeTimeline = (section: TimelineSection, index: number) => {
    const item = draft?.[section][index];
    const label = item?.title.trim() || "mục này";
    if (!window.confirm(`Xoá “${label}” khỏi bản nháp?`)) return;

    setDraft((current) =>
      current
        ? {
            ...current,
            [section]: current[section].filter(
              (_, itemIndex) => itemIndex !== index,
            ),
          }
        : current,
    );
  };

  const moveTimeline = (
    section: TimelineSection,
    index: number,
    direction: -1 | 1,
    kind: TimelineKind,
  ) => {
    setDraft((current) => {
      if (!current) return current;

      const next = [...current[section]];
      const matchingIndexes = next.reduce<number[]>(
        (indexes, item, itemIndex) => {
          if (isTimelineKind(item, section, kind)) indexes.push(itemIndex);
          return indexes;
        },
        [],
      );
      const visibleIndex = matchingIndexes.indexOf(index);
      const destination = matchingIndexes[visibleIndex + direction];

      if (visibleIndex < 0 || destination === undefined) return current;
      [next[index], next[destination]] = [next[destination], next[index]];
      return { ...current, [section]: next };
    });
  };

  const updateSkill = (index: number, patch: Partial<CvSkillGroup>) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            skills: current.skills.map((group, groupIndex) =>
              groupIndex === index ? { ...group, ...patch } : group,
            ),
          }
        : current,
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
                id: createCvItemId("skill"),
                title: "Nhóm kỹ năng mới",
                icon: "fa-sparkles",
                items: [],
              },
            ],
          }
        : current,
    );
  };

  const removeSkill = (index: number) => {
    const label = draft?.skills[index]?.title.trim() || "nhóm kỹ năng này";
    if (!window.confirm(`Xoá “${label}” khỏi bản nháp?`)) return;

    setDraft((current) =>
      current
        ? {
            ...current,
            skills: current.skills.filter(
              (_, groupIndex) => groupIndex !== index,
            ),
          }
        : current,
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

  const downloadCvBackup = () => {
    if (!cv) return;

    const file = new Blob([JSON.stringify(cv, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `cv-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    showToast("Đã tạo bản sao dữ liệu CV.", "success");
  };

  const saveCv = async () => {
    if (!isAdmin || !cv || !draft || saving) return;

    if (
      !draft.full_name.trim() ||
      !draft.headline.trim() ||
      !draft.summary.trim()
    ) {
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

    const hasInvalidProjectUrl = draft.experience.some(
      (item) => item.url && !safeWebsite(item.url),
    );
    if (hasInvalidProjectUrl) {
      showToast("Liên kết dự án chưa đúng định dạng URL.", "warning");
      return;
    }

    setSaving(true);

    try {
      const payload = createCvUpdatePayload(draft);
      const { data: saved, error } = await supabase
        .from("cv")
        .update(payload)
        .eq("id", 1)
        .eq("updated_at", cv.updated_at)
        .select(CV_SELECT)
        .maybeSingle();

      if (error) throw error;
      if (!saved) throw new Error(CV_CONFLICT_ERROR);

      const normalized = normalizeCvData(saved);
      if (!normalized) throw new Error("Dữ liệu phản hồi không hợp lệ.");

      setCv(normalized);
      setDraft(cloneCv(normalized));
      setEditing(false);
      showToast("Đã cập nhật CV.", "success");
    } catch (error) {
      console.error("CV update failed:", error);

      if (error instanceof Error && error.message === CV_CONFLICT_ERROR) {
        showToast(
          "CV đã được cập nhật ở tab khác. Hãy tải lại trang trước khi lưu tiếp.",
          "warning",
        );
      } else {
        showToast("Không thể lưu CV lúc này.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    data,
    editing,
    saving,
    isAdmin,
    isDirty,
    updateField,
    updateTimeline,
    addTimeline,
    removeTimeline,
    moveTimeline,
    updateSkill,
    addSkill,
    removeSkill,
    moveSkill,
    beginEditing,
    cancelEditing,
    downloadCvBackup,
    saveCv,
  };
}
