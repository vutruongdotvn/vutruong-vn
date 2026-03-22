export type Post = {
  id: string;

  content: string;
  images: string[];

  author: {
    name: string;
    avatar: string;
  };

  hashtags: string[];

  createdAt: string;
  updatedAt?: string;

  isPinned?: boolean;
};