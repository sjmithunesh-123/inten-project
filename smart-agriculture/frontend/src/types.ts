export interface User {
  id: string | number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  location?: string | null;
  profile_image?: string | null;
  is_active: boolean;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponseData {
  user: User;
  access_token: string;
  refresh_token?: string;
  token_type?: string;
}

export interface DashboardSummary {
  total_users: number;
  active_users: number;
  total_predictions: number;
  disease_predictions: number;
  crop_recommendations: number;
}

export interface AnalyticsSlice {
  label?: string;
  month?: string;
  value?: number;
  count?: number;
}

export interface DashboardAnalytics {
  disease_distribution: AnalyticsSlice[];
  crop_distribution: AnalyticsSlice[];
  monthly_predictions: AnalyticsSlice[];
}

export interface Plant {
  id: number;
  plant_name: string;
  scientific_name?: string | null;
  category?: string | null;
  description?: string | null;
}

export interface Disease {
  id: number;
  plant_id: number;
  disease_name: string;
  description?: string | null;
  symptoms?: string | null;
  prevention?: string | null;
  treatment?: string | null;
  severity?: string | null;
}

export interface Crop {
  id: number;
  crop_name: string;
  scientific_name?: string | null;
  description?: string | null;
  season?: string | null;
  soil_type?: string | null;
  water_requirement?: string | null;
  temperature_min?: number | null;
  temperature_max?: number | null;
  ph_min?: number | null;
  ph_max?: number | null;
  rainfall_min?: number | null;
  rainfall_max?: number | null;
}

export interface CropRecommendationResult {
  recommendation?: string;
  crop_name?: string;
  predicted_crop?: string;
  confidence?: number;
  reason?: string;
  [key: string]: unknown;
}

export interface DiseasePredictionResult {
  prediction?: string;
  disease_name?: string;
  confidence?: number;
  [key: string]: unknown;
}
