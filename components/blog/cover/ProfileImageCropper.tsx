"use client";

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import type { CropAreaPixels } from "@/lib/profileMediaCrop";

export type ProfileMediaKind = "cover" | "avatar";

type Props = {
  image: string;
  kind: ProfileMediaKind;
  disabled?: boolean;
  onCropAreaChange: (area: CropAreaPixels | null) => void;
};

export default function ProfileImageCropper({
  image,
  kind,
  disabled = false,
  onCropAreaChange,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    onCropAreaChange(null);
  }, [image, kind, onCropAreaChange]);

  const isAvatar = kind === "avatar";

  return (
    <div className="space-y-4">
      <div
        className={`relative w-full overflow-hidden bg-neutral-950 ${
          isAvatar ? "h-[320px]" : "aspect-[12/5] min-h-[230px]"
        }`}
      >
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={isAvatar ? 1 : 12 / 5}
          cropShape={isAvatar ? "round" : "rect"}
          showGrid={!isAvatar}
          objectFit="contain"
          restrictPosition
          minZoom={1}
          maxZoom={4}
          zoomSpeed={0.2}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, croppedAreaPixels) =>
            onCropAreaChange(croppedAreaPixels as CropAreaPixels)
          }
        />
      </div>

      <div className="rounded-2xl border border-black/5 bg-neutral-50 p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <i className="fad fa-magnifying-glass-plus" aria-hidden="true" />
            Thu phóng
          </span>
          <span>{zoom.toFixed(1)}×</span>
        </div>

        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={zoom}
          disabled={disabled}
          aria-label="Thu phóng ảnh"
          onChange={(event) => setZoom(Number(event.target.value))}
          className="w-full cursor-pointer accent-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <p className="text-center text-xs leading-5 text-neutral-500">
        Kéo ảnh để thay đổi vị trí, dùng thanh trượt để thu phóng.
        {isAvatar
          ? " Ảnh master tối đa 2048 × 2048px."
          : " Ảnh master tỷ lệ 12:5, chiều rộng tối đa 4096px."}
      </p>
    </div>
  );
}
