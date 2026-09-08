import { cn } from "@/lib/utils";
import type { CvTimelineItem } from "@/types/cv";
import CvSectionCard from "@/components/cv/CvSectionCard";
import {
  AddItemButton,
  CvInput,
  CvTextarea,
  ItemControls,
} from "@/components/cv/CvEditorControls";
import type {
  IndexedTimelineItem,
  TimelineAdder,
  TimelineKind,
  TimelineMover,
  TimelineRemover,
  TimelineSection,
  TimelineUpdater,
} from "@/components/cv/types";
import { safeWebsite, splitEditableLines } from "@/components/cv/utils";

type CvTimelineProps = {
  title: string;
  eyebrow: string;
  sectionNumber: string;
  icon: string;
  section: TimelineSection;
  kind: TimelineKind;
  addLabel: string;
  items: IndexedTimelineItem[];
  editing: boolean;
  onUpdate: TimelineUpdater;
  onAdd: TimelineAdder;
  onRemove: TimelineRemover;
  onMove: TimelineMover;
};

export default function CvTimeline({
  title,
  eyebrow,
  sectionNumber,
  icon,
  section,
  kind,
  addLabel,
  items,
  editing,
  onUpdate,
  onAdd,
  onRemove,
  onMove,
}: CvTimelineProps) {
  if (!editing && items.length === 0) return null;

  return (
    <CvSectionCard
      icon={icon}
      eyebrow={eyebrow}
      title={title}
      sectionNumber={sectionNumber}
      count={items.length}
    >
      {items.length > 0 ? (
        <div className="cv-timeline-list relative space-y-8 before:absolute before:bottom-6 before:left-4 before:top-4 before:w-px before:bg-gradient-to-b before:from-foreground/30 before:via-foreground/20 before:to-foreground/10">
          {items.map(({ item, sourceIndex }, index) => (
            <TimelineEntry
              key={item.id}
              item={item}
              sourceIndex={sourceIndex}
              visibleIndex={index}
              total={items.length}
              section={section}
              kind={kind}
              editing={editing}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onMove={onMove}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.25rem] border border-dashed border-border bg-muted/15 px-5 py-9 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-[#111216] text-sm text-white">
            <i className={cn("fa-duotone", icon)} aria-hidden="true" />
          </span>
          <p className="mt-3 text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
            Empty section
          </p>
          <p className="mt-1 text-sm font-bold text-foreground/70">
            Chưa có nội dung trong mục này
          </p>
        </div>
      )}

      {editing && (
        <div className="mt-5 sm:pl-12">
          <AddItemButton
            label={addLabel}
            onClick={() => onAdd(section, kind)}
          />
        </div>
      )}
    </CvSectionCard>
  );
}

function TimelineEntry({
  item,
  sourceIndex,
  visibleIndex,
  total,
  section,
  kind,
  editing,
  onUpdate,
  onRemove,
  onMove,
}: {
  item: CvTimelineItem;
  sourceIndex: number;
  visibleIndex: number;
  total: number;
  section: TimelineSection;
  kind: TimelineKind;
  editing: boolean;
  onUpdate: TimelineUpdater;
  onRemove: TimelineRemover;
  onMove: TimelineMover;
}) {
  const projectUrl = item.url ? safeWebsite(item.url) : null;
  const markerIcon =
    kind === "project"
      ? "fa-code-branch"
      : kind === "education"
        ? "fa-graduation-cap"
        : "fa-briefcase";
  const itemNumber = String(visibleIndex + 1).padStart(2, "0");
  const itemLabel =
    kind === "project"
      ? "Project"
      : kind === "education"
        ? "Education"
        : "Experience";
  const organizationLabel =
    kind === "project"
      ? "Dự án / Đơn vị"
      : kind === "education"
        ? "Cơ sở đào tạo"
        : "Nơi công tác / làm việc";
  const organizationIcon =
    kind === "project"
      ? "fa-code"
      : kind === "education"
        ? "fa-building-columns"
        : "fa-building";

  return (
    <article className="cv-timeline-entry relative pl-11 sm:pl-12">
      <span className="absolute left-0 top-0 z-10 grid size-9 place-items-center rounded-full bg-[#111216] text-xs text-white shadow-md dark:bg-background">
        <i className={cn("fa-duotone", markerIcon)} aria-hidden="true" />
      </span>

      <div
        className={cn(
          "pt-0.5",
          visibleIndex < total - 1 && "border-0",
        )}
      >
        {editing ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="w-full sm:max-w-56">
                <CvInput
                  label="Thời gian"
                  maxLength={80}
                  value={item.period}
                  onChange={(event) =>
                    onUpdate(section, sourceIndex, {
                      period: event.target.value,
                    })
                  }
                  placeholder="Ví dụ: 2023 – 2024"
                />
              </div>

              <ItemControls
                index={visibleIndex}
                total={total}
                onMove={(direction) =>
                  onMove(section, sourceIndex, direction, kind)
                }
                onRemove={() => onRemove(section, sourceIndex)}
              />
            </div>

            <div className="mt-4 grid gap-4">
              <CvInput
                required
                label={
                  kind === "education"
                    ? "Chương trình / Bằng cấp"
                    : "Vai trò / Tên dự án"
                }
                maxLength={160}
                value={item.title}
                onChange={(event) =>
                  onUpdate(section, sourceIndex, { title: event.target.value })
                }
                inputClassName="font-bold"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <CvInput
                  label="Đơn vị"
                  maxLength={200}
                  value={item.organization}
                  onChange={(event) =>
                    onUpdate(section, sourceIndex, {
                      organization: event.target.value,
                    })
                  }
                />
                <CvInput
                  label="Địa chỉ"
                  maxLength={160}
                  value={item.location}
                  onChange={(event) =>
                    onUpdate(section, sourceIndex, {
                      location: event.target.value,
                    })
                  }
                />
              </div>

              {kind === "project" && (
                <CvInput
                  type="url"
                  label="Liên kết dự án"
                  maxLength={500}
                  value={item.url ?? ""}
                  onChange={(event) =>
                    onUpdate(section, sourceIndex, { url: event.target.value })
                  }
                  placeholder="https://..."
                />
              )}

              <CvTextarea
                label="Mô tả ngắn"
                rows={3}
                maxLength={1500}
                value={item.description}
                onChange={(event) =>
                  onUpdate(section, sourceIndex, {
                    description: event.target.value,
                  })
                }
              />

              <CvTextarea
                label="Điểm nổi bật"
                rows={5}
                maxLength={3200}
                value={item.highlights.join("\n")}
                onChange={(event) =>
                  onUpdate(section, sourceIndex, {
                    highlights: splitEditableLines(event.target.value),
                  })
                }
                hint="Nhấn Enter để tạo dòng mới. Khoảng trắng và dòng đang nhập được giữ nguyên; dữ liệu chỉ được làm sạch khi bấm Lưu."
                placeholder="Mỗi điểm nổi bật một dòng"
                textareaClassName="text-sm"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 sm:block">
              {item.period && (
                <span className="inline-flex rounded-full bg-muted-foreground/15 border border-black/10 dark:border-border
                px-5 py-1.75 text-xs font-semibold text-slate-700 dark:text-muted-foreground tracking-[0.1em] dark:bg-background">
                  {item.period}
                </span>
              )}

              {/* <p className="shrink-0 text-[0.56rem] font-black uppercase tracking-[0.18em] text-muted-foreground sm:mt-2.5">
                <span className="text-foreground/35">{itemNumber}</span>
                <span className="mx-1.5 text-foreground/20">/</span>
                {itemLabel}
              </p> */}
            </div>

            <div className="min-w-0">
              <h3 className="text-lg/6 font-black text-foreground">
                {item.title}
              </h3>

              {(item.organization || item.location) && (
                <div className="mt-3 space-y-2">
                  {item.organization && (
                    <TimelineMeta
                      icon={organizationIcon}
                      label={organizationLabel}
                      value={item.organization}
                    />
                  )}
                  {item.location && (
                    <TimelineMeta
                      icon="fa-location-dot"
                      label="Địa chỉ"
                      value={item.location}
                    />
                  )}
                </div>
              )}

              {/* {kind === "project" && projectUrl && (
                <a
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 border-b border-foreground/25 pb-0.5 text-xs font-black text-foreground transition hover:border-foreground hover:opacity-65"
                >
                  Xem dự án
                  <i
                    className="fa-duotone fa-arrow-up-right-from-square text-[0.65rem]"
                    aria-hidden="true"
                  />
                </a>
              )} */}

              {item.description && (
                <p className="my-3 whitespace-pre-line text-sm/6 sm:text-[.9375rem] text-muted-foreground">
                  {item.description}
                </p>
              )}

              {item.highlights.length > 0 && (
                <section className="my-3">
                  {/* <div className="flex items-center gap-2 pb-2">
                    <i
                      className="fa-duotone fa-sparkles text-[0.65rem] text-foreground/40"
                      aria-hidden="true"
                    />
                    <p className="text-[0.58rem] font-black uppercase tracking-[0.18em] text-foreground/55">
                      Điểm nổi bật
                    </p>
                    <span className="ml-auto text-[0.56rem] font-black tabular-nums tracking-[0.12em] text-foreground/25">
                      {String(item.highlights.length).padStart(2, "0")}
                    </span>
                  </div> */}

                  <ul className="space-y-1 text-sm leading-6 text-foreground/75">
                    {item.highlights.map((highlight, highlightIndex) => (
                      <li
                        key={`${item.id}-highlight-${highlightIndex}`}
                        className="flex items-start gap-2.5"
                      >
                        <i
                          className="fa-duotone fa-hand-point-right mt-1.25 shrink-0 text-foreground/35"
                          aria-hidden="true"
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function TimelineMeta({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 bg-background/75 border border-border/75 p-3 rounded-lg">
      <i
        className={cn(
          "fa-duotone shrink-0 text-center text-xs text-foreground/50",
          icon,
        )}
        aria-hidden="true"
      />
      <div className="">
        <p className="text-[0.52rem] font-black uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-bold text-foreground/80">
          {value}
        </p>
      </div>
    </div>
  );
}