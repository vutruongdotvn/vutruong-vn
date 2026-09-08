import { cn } from "@/lib/utils";
import type { CvData } from "@/types/cv";
import CvSectionCard from "@/components/cv/CvSectionCard";
import {
  AddItemButton,
  CvInput,
  CvTextarea,
  ItemControls,
} from "@/components/cv/CvEditorControls";
import type { CvFieldUpdater, SkillUpdater } from "@/components/cv/types";
import { splitEditableLines } from "@/components/cv/utils";

export function CvSkillsCard({
  data,
  editing,
  onUpdateSkill,
  onAddSkill,
  onRemoveSkill,
  onMoveSkill,
}: {
  data: CvData;
  editing: boolean;
  onUpdateSkill: SkillUpdater;
  onAddSkill: () => void;
  onRemoveSkill: (index: number) => void;
  onMoveSkill: (index: number, direction: -1 | 1) => void;
}) {
  if (!editing && data.skills.length === 0) return null;

  return (
    <CvSectionCard
      icon="fa-sparkles"
      eyebrow="Expertise"
      title="Kỹ năng"
      sectionNumber="05"
      count={data.skills.length}
    >
      <div className="space-y-6">
        {data.skills.map((group, index) => {
          const groupNumber = String(index + 1).padStart(2, "0");

          return (
            <article
              key={group.id}
              className=""
            >
              <span
                className="pointer-events-none absolute -bottom-5 -right-1 -z-10 select-none text-7xl font-black tracking-[-0.08em] text-foreground/[0.025]"
                aria-hidden="true"
              >
                {groupNumber}
              </span>

              <div className="flex items-center gap-3">
                <span className="">
                  <i
                    className={cn(
                      "fa-duotone",
                      group.icon || "fa-sparkles",
                    )}
                    aria-hidden="true"
                  />
                </span>

                {editing ? (
                  <div className="min-w-0 flex-1">
                    <CvInput
                      label={`Tên nhóm ${index + 1}`}
                      maxLength={120}
                      value={group.title}
                      onChange={(event) =>
                        onUpdateSkill(index, { title: event.target.value })
                      }
                      inputClassName="font-bold"
                    />
                  </div>
                ) : (
                  <div className="min-w-0 flex-1 pt-0.5">
                    {/* <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
                      Skill set / {groupNumber}
                    </p> */}
                    <h3 className="text-base/6 font-black text-foreground">
                      {group.title}
                    </h3>
                  </div>
                )}

                {editing && (
                  <ItemControls
                    index={index}
                    total={data.skills.length}
                    onMove={(direction) => onMoveSkill(index, direction)}
                    onRemove={() => onRemoveSkill(index)}
                  />
                )}
              </div>

              {editing ? (
                <div className="mt-4">
                  <CvTextarea
                    label="Danh sách kỹ năng"
                    rows={6}
                    maxLength={4000}
                    value={group.items.join("\n")}
                    onChange={(event) =>
                      onUpdateSkill(index, {
                        items: splitEditableLines(event.target.value),
                      })
                    }
                    hint="Mỗi kỹ năng một dòng. Có thể dùng phím cách và Enter bình thường."
                    placeholder="Mỗi kỹ năng một dòng"
                    textareaClassName="text-sm"
                  />
                </div>
              ) : (
                group.items.length > 0 && (
                  <ul className="mt-3 space-y-2.5 border-t border-border pt-3 text-sm text-foreground/75">
                    {group.items.map((item, itemIndex) => (
                      <li
                        key={`${group.id}-skill-${itemIndex}`}
                        className="flex items-start gap-2.5"
                      >
                        <i
                          className="fa-duotone fa-hand-point-right mt-1 shrink-0 text-foreground/40"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </article>
          );
        })}

        {editing && (
          <AddItemButton label="Thêm nhóm kỹ năng" onClick={onAddSkill} />
        )}
      </div>
    </CvSectionCard>
  );
}

export function CvInterestsCard({
  data,
  editing,
  onUpdateField,
}: {
  data: CvData;
  editing: boolean;
  onUpdateField: CvFieldUpdater;
}) {
  if (!editing && data.interests.length === 0) return null;

  return (
    <CvSectionCard
      icon="fa-heart"
      eyebrow="Interests"
      title="Sở thích"
      sectionNumber="06"
      count={data.interests.length}
    >
      {editing ? (
        <CvTextarea
          label="Danh sách sở thích"
          rows={7}
          maxLength={3000}
          value={data.interests.join("\n")}
          onChange={(event) =>
            onUpdateField("interests", splitEditableLines(event.target.value))
          }
          hint="Mỗi sở thích một dòng. Nội dung được chuẩn hoá khi bấm Lưu."
          placeholder="Mỗi sở thích một dòng"
          textareaClassName="text-sm"
        />
      ) : (
        <article className="cv-skill-group">
          <ul className="space-y-2.5 text-sm leading-5 text-foreground/75">
            {data.interests.map((interest, index) => (
              <li
                key={`interest-${index}`}
                className="flex items-start gap-2.5"
              >
                <i
                  className="fa-duotone fa-hand-point-right mt-1 shrink-0 text-foreground/40"
                  aria-hidden="true"
                />
                <span>{interest}</span>
              </li>
            ))}
          </ul>
        </article>
      )}
    </CvSectionCard>
  );
}