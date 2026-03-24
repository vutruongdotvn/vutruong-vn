import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// random ID 10 số
export const generatePostId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// hashtag parser
export const extractHashtags = (text: string) => {
  return text.match(/#\w+/g) || [];
};

// format time
export const formatTimeAgo = (date: string) => {
  const now = new Date();
  const postDate = new Date(date);
  const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  if (diff < 172800) return "Hôm qua";

  const days = Math.floor(diff / 86400);
  if (days < 7) return `${days} ngày`;

  // 👉 format full
  const day = postDate.getDate();
  const month = postDate.getMonth() + 1;
  const year = postDate.getFullYear();

  const hours = postDate.getHours().toString().padStart(2, "0");
  const minutes = postDate.getMinutes().toString().padStart(2, "0");

  return `${day} tháng ${month}, ${year} lúc ${hours}:${minutes}`;
};