"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CvData } from "@/types/cv";
import type { CvFieldUpdater } from "@/components/cv/types";
import { CvInput, CvTextarea } from "@/components/cv/CvEditorControls";
import {
  getInitials,
  getWebsiteLabel,
  safeAvatar,
  safeWebsite,
} from "@/components/cv/utils";

export default function CvProfileCard({
  data,
  editing,
  onUpdateField,
}: {
  data: CvData;
  editing: boolean;
  onUpdateField: CvFieldUpdater;
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarUrl = safeAvatar(data.avatar_url);
  const websiteUrl = safeWebsite(data.website);
  const initials = getInitials(data.full_name) || "VT";

  useEffect(() => {
    setAvatarFailed(false);
  }, [data.avatar_url]);

  return (
    <section
      aria-label="Thông tin cá nhân"
      className="cv-profile-card overflow-hidden sm:rounded-2xl sm:border border-border bg-card shadow-[0_22px_70px_rgba(15,23,42,0.08)]"
    >
      <header className="relative isolate overflow-hidden bg-[#111216] px-5 pb-20 pt-6 text-white sm:px-8 sm:pb-24 sm:pt-8 lg:px-10">
        <div
          className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.13),transparent_27%),linear-gradient(120deg,rgba(255,255,255,0.055),transparent_42%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -top-40 -z-10 size-[28rem] rounded-full border border-white/[0.07]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 right-16 -z-10 size-72 rounded-full border border-white/[0.05]"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-12 right-4 -z-10 select-none text-[10rem] font-black leading-none tracking-[-0.08em] text-white/[0.025] sm:right-8 sm:text-[13rem]"
          aria-hidden="true"
        >
          {initials}
        </span>

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-sm text-white shadow-inner shadow-white/5">
              <i className="fa-duotone fa-id-card" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-white/45">
                Personal profile
              </p>
              <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.14em] text-white/80">
                Thông tin cá nhân
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="h-px w-10 bg-white/20" aria-hidden="true" />
            <span className="text-[0.65rem] font-bold tracking-[0.22em] text-white/35">
              CV
            </span>
          </div>
        </div>

        <div className="relative mt-9 lg:pl-[13.5rem] print:pl-0">
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_13rem]">
              <CvInput
                required
                label="Họ và tên"
                maxLength={160}
                value={data.full_name}
                onChange={(event) =>
                  onUpdateField("full_name", event.target.value)
                }
                fieldClassName="text-white/75"
                inputClassName="border-white/15 bg-white/[0.08] font-bold text-white placeholder:text-white/30 focus:border-white/35"
              />
              <CvInput
                label="Tên gọi khác"
                maxLength={120}
                value={data.nickname}
                onChange={(event) =>
                  onUpdateField("nickname", event.target.value)
                }
                fieldClassName="text-white/75"
                inputClassName="border-white/15 bg-white/[0.08] text-white placeholder:text-white/30 focus:border-white/35"
                placeholder="Ví dụ: Anh Bar"
              />
              <CvInput
                required
                label="Định hướng nghề nghiệp"
                maxLength={240}
                value={data.headline}
                onChange={(event) =>
                  onUpdateField("headline", event.target.value)
                }
                fieldClassName="text-white/75 sm:col-span-2"
                inputClassName="border-white/15 bg-white/[0.08] font-semibold text-white placeholder:text-white/30 focus:border-white/35"
              />
            </div>
          ) : (
            <>
              {data.nickname && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-white/70">
                  <i className="fa-duotone fa-signature" aria-hidden="true" />
                  {data.nickname}
                </span>
              )}

              <h2 className="mt-3 max-w-4xl text-3xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-[2.65rem] lg:text-5xl">
                {data.full_name}
              </h2>

              {data.headline && (
                <div className="mt-5 flex max-w-3xl items-start gap-3">
                  <span
                    className="mt-3 h-px w-9 shrink-0 bg-white/35"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold leading-6 text-white/65 sm:text-base">
                    {data.headline}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      <section className="relative px-5 pb-6 sm:px-8 sm:pb-8 lg:px-10 print:p-[5mm]">
        <div className="grid gap-7 lg:grid-cols-[11.5rem_minmax(0,1fr)] lg:gap-9 print:grid-cols-[24mm_minmax(0,1fr)] print:gap-[5mm]">
          <div className="relative z-10 -mt-14 w-36 sm:-mt-16 sm:w-40 lg:-mt-24 lg:w-[11.5rem] print:mt-0 print:w-[22mm]">
            <ProfileAvatar
              avatarUrl={avatarUrl}
              avatarFailed={avatarFailed}
              fullName={data.full_name}
              initials={initials}
              onAvatarError={() => setAvatarFailed(true)}
            />

            {editing ? (
              <div className="mt-5 print:hidden">
                <CvInput
                  type="url"
                  label="URL ảnh đại diện"
                  maxLength={1000}
                  value={data.avatar_url ?? ""}
                  onChange={(event) =>
                    onUpdateField("avatar_url", event.target.value || null)
                  }
                  placeholder="https://..."
                  hint="Chỉ sử dụng URL HTTPS hoặc đường dẫn nội bộ."
                />
              </div>
            ) : (
              <div className="mt-5 hidden items-center justify-between gap-3 print:hidden">
                <span className="text-[0.58rem] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
                  Curriculum Vitae
                </span>
                <span className="grid size-7 place-items-center rounded-full border border-border text-[0.65rem] text-foreground/55">
                  <i className="fa-duotone fa-sparkles" aria-hidden="true" />
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 pt-1 lg:pt-6 print:pt-0">
            <div className="grid gap-4 sm:grid-cols-[3rem_minmax(0,1fr)] items-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary text-base text-primary-foreground shadow-sm">
                <i className="fa-duotone fa-quote-left" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <h3 className="mt-1 text-xl font-black tracking-[-0.025em] text-foreground">
                  Lời giới thiệu
                </h3>
              </div>
            </div>

            {editing ? (
              <div className="mt-5">
                <CvTextarea
                  required
                  label="Giới thiệu ngắn"
                  rows={6}
                  maxLength={2000}
                  value={data.summary}
                  onChange={(event) =>
                    onUpdateField("summary", event.target.value)
                  }
                />
              </div>
            ) : (
              data.summary && (
                <div className="mt-5 border-l-2 border-foreground/10 pl-5 sm:pl-6">
                  <p className="cv-summary max-w-4xl whitespace-pre-line text-base leading-7 text-muted-foreground">
                    {data.summary}
                  </p>
                </div>
              )
            )}

            <div className="mt-7 border-t border-border pt-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="mt-1 text-base font-black text-foreground">
                    Thông tin liên hệ
                  </h3>
                </div>
                <i
                  className="fa-duotone fa-address-book text-xl text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              {editing ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <CvInput
                    label="Địa chỉ"
                    maxLength={160}
                    value={data.location}
                    onChange={(event) =>
                      onUpdateField("location", event.target.value)
                    }
                  />
                  <CvInput
                    type="email"
                    label="Email"
                    maxLength={254}
                    value={data.email}
                    onChange={(event) =>
                      onUpdateField("email", event.target.value)
                    }
                  />
                  <CvInput
                    type="url"
                    label="Website"
                    maxLength={300}
                    value={data.website}
                    onChange={(event) =>
                      onUpdateField("website", event.target.value)
                    }
                  />
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-3 print:grid-cols-3">
                  {data.location && (
                    <ContactItem icon="fa-location-dot" label="Địa chỉ">
                      <span>{data.location}</span>
                    </ContactItem>
                  )}

                  {data.email && (
                    <ContactItem icon="fa-envelope" label="Email">
                      <a
                        href={`mailto:${data.email}`}
                        className="break-all font-bold text-foreground underline-offset-4 hover:underline"
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
                        className="break-all font-bold text-foreground underline-offset-4 hover:underline"
                      >
                        {getWebsiteLabel(data.website)}
                      </a>
                    </ContactItem>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
function ProfileAvatar({
  avatarUrl,
  avatarFailed,
  fullName,
  initials,
  onAvatarError,
}: {
  avatarUrl: string | null;
  avatarFailed: boolean;
  fullName: string;
  initials: string;
  onAvatarError: () => void;
}) {
  return (
    <div className="relative isolate">
      <span
        className="absolute -bottom-2.5 -right-2.5 -z-10 h-full w-full rounded-2xl border border-foreground/10"
        aria-hidden="true"
      />
      <div className="cv-avatar grid aspect-[4/5] w-full overflow-hidden rounded-2xl border-[6px] border-card bg-primary text-3xl font-black text-primary-foreground shadow-[0_24px_55px_rgba(0,0,0,0.2)]">
        {avatarUrl && !avatarFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={`Ảnh đại diện của ${fullName}`}
            className="h-full w-full object-cover"
            onError={onAvatarError}
          />
        ) : (
          <span className="m-auto">{initials}</span>
        )}
      </div>

      <span className="absolute bottom-3 right-3 grid min-w-9 place-items-center rounded-full border border-white/15 bg-[#111216]/90 px-2.5 py-1.5 text-[0.62rem] font-black tracking-[0.12em] text-white shadow-lg backdrop-blur">
        {initials}
      </span>
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
  children: ReactNode;
}) {
  return (
    <div className="cv-contact-item group flex items-center gap-3.5 rounded-[1.25rem] border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-sm text-foreground/70 shadow-sm">
        <i className={cn("fa-duotone", icon)} aria-hidden="true" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm leading-5 text-foreground/80">
          {children}
        </div>
      </div>
    </div>
  );
}