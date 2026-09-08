import {
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export const cvInputClass =
  "w-full rounded-[0.95rem] border border-input bg-muted/20 px-4 py-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground/55 hover:border-foreground/20 focus:border-foreground/40 focus:ring-2 focus:ring-ring/15";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  fieldClassName?: string;
  inputClassName?: string;
};

export function CvInput({
  label,
  hint,
  fieldClassName,
  inputClassName,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "block text-[0.66rem] font-extrabold uppercase tracking-[0.13em] text-foreground/70",
        fieldClassName,
      )}
    >
      {label}
      <input
        {...props}
        id={inputId}
        className={cn(cvInputClass, "mt-2", inputClassName)}
      />
      {hint && (
        <span className="mt-1.5 block text-xs font-normal normal-case leading-5 tracking-normal text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  fieldClassName?: string;
  textareaClassName?: string;
};

export function CvTextarea({
  label,
  hint,
  fieldClassName,
  textareaClassName,
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <label
      htmlFor={textareaId}
      className={cn(
        "block text-[0.66rem] font-extrabold uppercase tracking-[0.13em] text-foreground/70",
        fieldClassName,
      )}
    >
      {label}
      <textarea
        {...props}
        id={textareaId}
        className={cn(
          cvInputClass,
          "mt-2 min-h-24 resize-y font-normal normal-case leading-6 tracking-normal",
          textareaClassName,
        )}
      />
      {hint && (
        <span className="mt-1.5 block text-xs font-normal normal-case leading-5 tracking-normal text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}

export function ItemControls({
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
    <div className="cv-no-print ml-auto flex shrink-0 items-center gap-0.5 rounded-xl border border-border bg-card p-1 shadow-sm">
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
        "grid size-8 cursor-pointer place-items-center rounded-lg text-xs transition disabled:cursor-not-allowed disabled:opacity-25",
        danger
          ? "text-red-600 hover:bg-red-500/10 dark:text-red-300"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <i className={cn("fa-duotone", icon)} aria-hidden="true" />
    </button>
  );
}

export function AddItemButton({
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
      className="cv-no-print group flex w-full cursor-pointer items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-input px-4 py-3 text-sm font-bold text-muted-foreground transition hover:border-foreground/30 hover:bg-muted/35 hover:text-foreground"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-[#111216] text-xs text-white transition-transform group-hover:rotate-90">
        <i className="fa-duotone fa-plus" aria-hidden="true" />
      </span>
      {label}
    </button>
  );
}
