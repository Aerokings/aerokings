-- Run this in your Supabase SQL Editor to set up the database

-- Create maids table
CREATE TABLE IF NOT EXISTS maids (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  age INTEGER,
  experience_years INTEGER DEFAULT 0,
  bio TEXT,
  location_type TEXT NOT NULL DEFAULT 'inside' CHECK (location_type IN ('inside', 'outside')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'inactive')),
  photo_url TEXT,
  cv_url TEXT,
  monthly_salary NUMERIC,
  languages TEXT,
  religion TEXT,
  marital_status TEXT,
  skills TEXT,
  category TEXT NOT NULL DEFAULT 'Cleaner',
  weight TEXT,
  height TEXT,
  experience_breakdown TEXT,
  cooking_skills TEXT,
  available_emirates TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a storage bucket for maid photos
INSERT INTO storage.buckets (id, name, public) VALUES ('maid-photos', 'maid-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to maid photos
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'maid-photos');

-- Allow authenticated uploads (or use anon for simplicity)
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'maid-photos');

CREATE POLICY "Allow updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'maid-photos');

CREATE POLICY "Allow deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'maid-photos');

-- Enable Row Level Security but allow all operations (you can tighten this later)
ALTER TABLE maids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON maids FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON maids FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates" ON maids FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes" ON maids FOR DELETE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maids_updated_at
  BEFORE UPDATE ON maids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert sample data
INSERT INTO maids (name, nationality, age, experience_years, bio, location_type, status, monthly_salary, languages, religion, marital_status, skills, category, weight, height, experience_breakdown, cooking_skills, available_emirates) VALUES
('Maria Santos', 'Filipino', 32, 5, 'Experienced nanny with a warm and caring personality. Expert in infant care and child development activities.', 'inside', 'available', 1800, 'English, Tagalog, Arabic', 'Christian', 'Married', 'Baby Care, Child Development, Cooking, Laundry, Tutoring', 'Nanny', '58 kg', '157 cm', 'UAE:3 years, Saudi Arabia:2 years', NULL, 'Dubai, Sharjah, Ajman'),
('Asha Kumari', 'Indian', 28, 4, 'Talented cook specializing in Indian, Arabic and Continental cuisine. Very organized and hygienic.', 'inside', 'available', 1500, 'English, Hindi, Arabic', 'Hindu', 'Single', 'Cooking, Meal Planning, Kitchen Management, Baking', 'Cook', '52 kg', '155 cm', 'UAE:2 years, Oman:2 years', 'Indian Food, Arabic Food, Continental, Biryani, Tandoori, Baking, Pasta, Salads', 'Dubai, Abu Dhabi, Sharjah'),
('Fatima Negash', 'Ethiopian', 25, 3, 'Hardworking and detail-oriented cleaner. Experienced in maintaining luxury apartments and villas.', 'inside', 'available', 1400, 'English, Amharic', 'Muslim', 'Single', 'Deep Cleaning, Laundry, Ironing, Organization', 'Cleaner', '50 kg', '162 cm', 'UAE:2 years, Ethiopia:1 year', NULL, 'Dubai, Sharjah, Ajman, Ras Al Khaimah'),
('Priya Wickramasinghe', 'Sri Lankan', 35, 8, 'Highly experienced cook with mastery of multiple cuisines. Previously worked for high-profile families.', 'inside', 'available', 2200, 'English, Sinhala, Arabic, Tamil', 'Buddhist', 'Married', 'Cooking, Baking, Meal Prep, Kitchen Management, Catering', 'Cook', '60 kg', '158 cm', 'UAE:4 years, Kuwait:2 years, Sri Lanka:2 years', 'Sri Lankan Food, Arabic Food, Indian Food, Chinese Food, Continental, Baking, BBQ, Seafood', 'Dubai, Abu Dhabi, Sharjah, Ajman'),
('Grace Okonkwo', 'Nigerian', 30, 3, 'Caring and patient nanny. Great with toddlers and school-age children. Focuses on educational activities.', 'outside', 'available', 1600, 'English, Yoruba', 'Christian', 'Single', 'Baby Care, Tutoring, Activity Planning, Light Cooking', 'Nanny', '62 kg', '165 cm', 'Nigeria:3 years', NULL, 'Dubai, Abu Dhabi'),
('Neway Berhe', 'Ethiopian', 27, 2, 'Dedicated cleaner with a strong work ethic. Skilled in organizing and maintaining large properties.', 'outside', 'available', 1200, 'English, Amharic, Tigrinya', 'Christian', 'Single', 'Cleaning, Laundry, Ironing, Gardening', 'Cleaner', '48 kg', '159 cm', 'Ethiopia:2 years', NULL, 'Dubai, Sharjah'),
('Lakshmi Devi', 'Indian', 40, 12, 'Master cook with exceptional skills across multiple cuisines. Highly sought after for her diverse menu.', 'inside', 'available', 2500, 'English, Hindi, Malayalam, Arabic', 'Hindu', 'Married', 'Cooking, Baking, Catering, Meal Planning, Kitchen Training', 'Cook', '65 kg', '160 cm', 'UAE:6 years, Saudi Arabia:4 years, India:2 years', 'Indian Food, Arabic Food, Filipino Food, Chinese Food, Continental, Mughlai, Baking, Desserts, Kabsa, Mandi', 'Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah'),
('Rose Achieng', 'Kenyan', 29, 4, 'Professional and detail-oriented maid. Excellent at deep cleaning and maintaining luxury villas. Trained in hospitality management.', 'inside', 'available', 1500, 'English, Swahili', 'Christian', 'Single', 'Deep Cleaning, Cooking, Laundry, Ironing, Pet Care', 'Cleaner', '55 kg', '164 cm', 'Kenya:3 years, Tanzania:1 year', NULL, 'Dubai, Abu Dhabi, Umm Al Quwain'),
('Sita Tamang', 'Nepali', 26, 2, 'Gentle and compassionate caregiver. Excellent with elderly care and medical assistance basics.', 'inside', 'available', 1300, 'English, Nepali, Hindi', 'Buddhist', 'Single', 'Elderly Care, Medication Management, Companionship, Light Cooking, Cleaning', 'Caregiver', '47 kg', '152 cm', 'UAE:1 year, Nepal:1 year', NULL, 'Dubai, Sharjah, Ajman'),
('Ana Reyes', 'Filipino', 34, 7, 'Seasoned nanny with excellent English skills. Skilled in early childhood development and first aid certified.', 'inside', 'available', 2000, 'English, Tagalog, Arabic', 'Christian', 'Married', 'Baby Care, First Aid, Tutoring, Swimming Supervision, Light Housekeeping', 'Nanny', '54 kg', '155 cm', 'UAE:4 years, Singapore:3 years', NULL, 'Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah');
