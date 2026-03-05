export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  added_by: string;
  created_at: string;
  image_url?: string | null;
  overall_score?: number;
  avg_friendly?: number;
  avg_safe?: number;
  avg_clean?: number;
  avg_happy?: number;
  rating_count?: number;
}

export interface Rating {
  id: string;
  shelter_id: string;
  user_id: string;
  friendly: number;
  safe: number;
  clean: number;
  happy: number;
  note: string | null;
  sub_ratings: Record<string, number | boolean> | null;
  created_at: string;
}

export type MainTabParamList = {
  Map: undefined;
  Top5: undefined;
  AddShelter: undefined;
};

export type MapStackParamList = {
  Tabs: undefined;
  MapHome: undefined;
  ShelterDetail: { shelter: Shelter };
  RateShelter: { shelter: Shelter };
};
