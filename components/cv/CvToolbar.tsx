import { cn } from "@/lib/utils";

const secondaryButtonClass =
  "inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-foreground/65 transition hover:bg-muted hover:text-foreground active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40";

const primaryButtonClass =
  "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#111216] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#292a30] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#111216] dark:hover:bg-white/85";

export default function CvToolbar({
  isAdmin,
  editing,
  saving,
  isDirty,
  onEdit,
  onBackup,
  onCancel,
}: {
  isAdmin: boolean;
  editing: boolean;
  saving: boolean;
  isDirty: boolean;
  onEdit: () => void;
  onBackup: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="cv-no-print mb-5 flex min-h-11 flex-wrap items-center justify-end gap-2">
      <div className="inline-flex flex-wrap items-center justify-end gap-1 rounded-[1.1rem] border border-border bg-card p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        {!editing && (
          <button
            type="button"
            onClick={() => window.print()}
            className={secondaryButtonClass}
            title="Mở hộp thoại in hoặc lưu CV dưới dạng PDF"
          >
            <i className="fa-duotone fa-print" aria-hidden="true" />
            <span className="hidden sm:inline">In CV</span>
          </button>
        )}

        {isAdmin && !editing && (
          <>
            <span className="mx-0.5 h-6 w-px bg-border" aria-hidden="true" />
            <button
              type="button"
              onClick={onEdit}
              className={primaryButtonClass}
            >
              <i className="fa-duotone fa-pen-to-square" aria-hidden="true" />
              Chỉnh sửa
            </button>
          </>
        )}

        {isAdmin && editing && (
          <>
            <button
              type="button"
              onClick={onBackup}
              disabled={saving}
              className={secondaryButtonClass}
              title="Tải bản sao JSON của dữ liệu đang được lưu"
            >
              <i className="fa-duotone fa-download" aria-hidden="true" />
              <span className="hidden sm:inline">Sao lưu</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className={secondaryButtonClass}
            >
              <i className="fa-duotone fa-xmark" aria-hidden="true" />
              Huỷ
            </button>

            <button
              type="submit"
              disabled={saving || !isDirty}
              className={primaryButtonClass}
            >
              <i
                className={cn(
                  "fa-duotone",
                  saving ? "fa-spinner-third fa-spin" : "fa-floppy-disk",
                )}
                aria-hidden="true"
              />
              {saving ? "Đang lưu" : "Lưu thay đổi"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
