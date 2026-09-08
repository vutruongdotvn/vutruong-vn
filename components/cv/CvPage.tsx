"use client";

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
    <main className="cv-page min-h-screen px-3 py-20 pb-24 sm:pb-4">
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

        <div className="cv-document space-y-3">

          <CvProfileCard
            data={data}
            editing={editor.editing}
            onUpdateField={editor.updateField}
          />

          <div className="cv-content-grid grid items-start gap-3 xl:grid-cols-[minmax(0,1.38fr)_minmax(330px,0.62fr)]">
            <div className="cv-primary-column space-y-3">
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
    <main className="flex min-h-screen items-center justify-center px-4 pb-28 pt-24 md:pb-10">
      <section className="relative isolate w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-[0_22px_70px_rgba(15,23,42,0.08)] sm:p-10">
        <div
          className="pointer-events-none absolute -right-20 -top-24 -z-10 size-64 rounded-full border border-foreground/[0.05]"
          aria-hidden="true"
        />
        <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[#111216] text-xl text-white shadow-lg">
          <i className="fa-duotone fa-file-user" aria-hidden="true" />
        </span>
        <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
          Curriculum Vitae
        </p>
        <h1 className="mt-2 text-xl font-black text-foreground">
          CV đang được cập nhật
        </h1>
        <p className="mt-2 text-base leading-7 text-muted-foreground">
          Nội dung chưa sẵn sàng. Vui lòng quay lại sau.
        </p>
      </section>
    </main>
  );
}
