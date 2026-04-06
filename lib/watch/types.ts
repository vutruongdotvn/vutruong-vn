export type OPhimCategory = {
  id?: string;
  name: string;
  slug: string;
};

export type OPhimCountry = {
  id?: string;
  name: string;
  slug: string;
};

export type OPhimListType = {
  name: string;
  slug: string;
};

export type OPhimMovie = {
  _id?: string;
  name: string;
  slug: string;
  origin_name?: string;
  thumb_url?: string;
  poster_url?: string;
  episode_current?: string;
  quality?: string;
  lang?: string;
  year?: number | string;
  content?: string;
  category?: OPhimCategory[];
  country?: OPhimCountry[];
  imdb?: {
    vote_average?: number | string;
  };
  tmdb?: {
    vote_average?: number | string;
    season?: number | string;
  };
};

export type OPhimListResponse = {
  status?: string;
  data?: {
    items?: OPhimMovie[];
    APP_DOMAIN_CDN_IMAGE?: string;
    titlePage?: string;
    params?: {
      pagination?: {
        totalItems?: number;
        totalItemsPerPage?: number;
      };
    };
  };
};

export type OPhimDetailResponse = {
  status?: string;
  data?: {
    item?: OPhimMovie;
    APP_DOMAIN_CDN_IMAGE?: string;
  };
};

export type OPhimCategoryResponse = {
  status?: string;
  items?: OPhimCategory[];
};

export type OPhimCountryResponse = {
  status?: string;
  items?: OPhimCountry[];
};

export type WatchSectionConfig = {
  id: string;
  ti: string;
  hi: string;
  api: string;
  type: "the-loai" | "quoc-gia" | "danh-sach";
  slug: string;
};

export type WatchTopic = {
  label: string;
  type: "the-loai" | "quoc-gia" | "danh-sach";
  slug: string;
  cls: string;
};