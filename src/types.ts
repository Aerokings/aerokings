export interface Maid {
  id: number;
  name: string;
  nationality: string;
  age: number | null;
  experience_years: number;
  bio: string | null;
  location_type: 'inside' | 'outside';
  status: 'available' | 'booked' | 'inactive';
  photo_url: string | null;
  cv_filename: string | null;
  monthly_salary: number | null;
  salary: number | null;
  languages: string | null;
  religion: string | null;
  marital_status: string | null;
  skills: string | null;
  category: 'Cook' | 'Cleaner' | 'Caregiver' | 'Nanny';
  weight: string | null;
  height: string | null;
  experience_breakdown: string | null;
  cooking_skills: string | null;
  available_emirates: string | null;
  passport_number: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Filters {
  search: string;
  nationality: string;
  category: string;
  rateRange: string;
}

export type ViewMode = 'browse' | 'admin';
