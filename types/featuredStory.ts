export type FeaturedStoryImage = {
  id: string;
  story_id: string;
  public_id: string;
  secure_url: string;
  width: number | null;
  height: number | null;
  format: string | null;
  sort_order: number;
  created_at: string;
};

export type FeaturedStory = {
  id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  images: FeaturedStoryImage[];
};

export type FeaturedAssetInput = {
  public_id: string;
  secure_url: string;
  width?: number | null;
  height?: number | null;
  format?: string | null;
};

export type FeaturedCloudinaryAsset = FeaturedAssetInput & {
  asset_id: string;
  bytes: number;
  created_at: string;
};

export type FeaturedAssetsPage = {
  assets: FeaturedCloudinaryAsset[];
  next_cursor: string | null;
};
