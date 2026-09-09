"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import type { CvData } from "@/types/cv";
import CvFooter from "@/components/cv/CvFooter";
import CvProfileCard from "@/components/cv/CvProfileCard";
import { CvInterestsCard, CvSkillsCard } from "@/components/cv/CvSkillsCard";
import CvSmartSidebar from "@/components/cv/CvSmartSidebar";
import CvTimeline from "@/components/cv/CvTimeline";
import CvToolbar from "@/components/cv/CvToolbar";
import { useCvEditor } from "@/components/cv/useCvEditor";
import {
  formatUpdatedDate,
  getTimelineItems,
} from "@/components/cv/utils";
import PremiumGlassCard from "../ui/PremiumGlassCard";

export default function CvPage({ initialCv }: { initialCv: CvData | null }) {
  const editor = useCvEditor(initialCv);
  const { data } = editor;

  if (!data) {
    return <CvUnavailable />;
  }

  const experienceItems = getTimelineItems(
    data.experience,
    "experience",
    "experience",
  );
  const projectItems = getTimelineItems(
    data.experience,
    "experience",
    "project",
  );
  const educationItems = getTimelineItems(
    data.education,
    "education",
    "education",
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void editor.saveCv();
  };

  return (
    <main className="cv-page min-h-screen px-0 sm:px-3 py-20 pb-24 sm:pb-4">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-6xl">
        <CvToolbar
          isAdmin={editor.isAdmin}
          editing={editor.editing}
          saving={editor.saving}
          isDirty={editor.isDirty}
          onEdit={editor.beginEditing}
          onBackup={editor.downloadCvBackup}
          onCancel={editor.cancelEditing}
        />

        <div className="cv-document sm:space-y-3">

          <CvProfileCard
            data={data}
            editing={editor.editing}
            onUpdateField={editor.updateField}
          />

          <div className="cv-content-grid grid items-start sm:gap-3 xl:grid-cols-[minmax(0,1.38fr)_minmax(330px,0.62fr)]">
            <div className="cv-primary-column sm:space-y-3">
              <CvTimeline
                title="Kinh nghiệm & hoạt động"
                eyebrow="Career"
                sectionNumber="02"
                icon="fa-briefcase"
                section="experience"
                kind="experience"
                addLabel="Thêm kinh nghiệm"
                items={experienceItems}
                editing={editor.editing}
                onUpdate={editor.updateTimeline}
                onAdd={editor.addTimeline}
                onRemove={editor.removeTimeline}
                onMove={editor.moveTimeline}
              />

              <CvTimeline
                title="Dự án cá nhân"
                eyebrow="Selected work"
                sectionNumber="03"
                icon="fa-code"
                section="experience"
                kind="project"
                addLabel="Thêm dự án"
                items={projectItems}
                editing={editor.editing}
                onUpdate={editor.updateTimeline}
                onAdd={editor.addTimeline}
                onRemove={editor.removeTimeline}
                onMove={editor.moveTimeline}
              />

              <CvTimeline
                title="Học vấn"
                eyebrow="Education"
                sectionNumber="04"
                icon="fa-graduation-cap"
                section="education"
                kind="education"
                addLabel="Thêm học vấn"
                items={educationItems}
                editing={editor.editing}
                onUpdate={editor.updateTimeline}
                onAdd={editor.addTimeline}
                onRemove={editor.removeTimeline}
                onMove={editor.moveTimeline}
              />
            </div>

            <CvSmartSidebar>
              <CvSkillsCard
                data={data}
                editing={editor.editing}
                onUpdateSkill={editor.updateSkill}
                onAddSkill={editor.addSkill}
                onRemoveSkill={editor.removeSkill}
                onMoveSkill={editor.moveSkill}
              />
              <CvInterestsCard
                data={data}
                editing={editor.editing}
                onUpdateField={editor.updateField}
              />
            </CvSmartSidebar>
          </div>

          <CvFooter updatedDate={formatUpdatedDate(data.updated_at)} />
        </div>
      </form>
    </main>
  );
}

function CvUnavailable() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <PremiumGlassCard className="max-w-3xl" contentClassName="text-center p-4 sm:p-8 py-8">
        <div className="size-16 mb-6 flex items-center mx-auto justify-center rounded-full bg-red-50 dark:bg-red-400/15 border border-red-200 dark:border-red-400/25">
          <i className="fa-duotone fa-lock-keyhole text-3xl text-red-500"></i>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1.5">Truy cập bị từ chối</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-8">
          Bạn không có quyền truy cập vào trang này.
        </p>
        <Link href="/" className="flex items-center gap-3 justify-center mt-6 mx-auto px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-95 w-sm max-w-full">
          <i className="fad fa-arrow-left" /> Về Trang chủ
        </Link>
      </PremiumGlassCard>
    </div>
  );
}
