-- Speed Rhyme Viral App - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  best_streak INTEGER DEFAULT 0,
  fastest_bpm INTEGER DEFAULT 0,
  accuracy_average DECIMAL(5,2) DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  phrase TEXT NOT NULL,
  difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
  language TEXT DEFAULT 'en',
  bpm INTEGER DEFAULT 100,
  mode TEXT DEFAULT 'fixed' CHECK (mode IN ('fixed', 'ramp', 'ladder')),
  is_public BOOLEAN DEFAULT true,
  is_daily BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  accuracy DECIMAL(5,2) NOT NULL,
  bpm_completed INTEGER NOT NULL,
  transcript TEXT,
  audio_url TEXT,
  video_url TEXT,
  is_personal_best BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_public ON challenges(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_daily ON challenges(is_daily, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_challenge ON attempts(challenge_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_personal_best ON attempts(user_id, challenge_id, is_personal_best);

-- Row Level Security Policies

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public challenges are viewable by everyone"
  ON challenges FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own challenges"
  ON challenges FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own challenges"
  ON challenges FOR DELETE
  USING (auth.uid() = created_by);

-- Attempts
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attempts are viewable by everyone"
  ON attempts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own attempts"
  ON attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
  ON attempts FOR UPDATE
  USING (auth.uid() = user_id);

-- Reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reported_by);

CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- Functions

-- Update challenge stats after attempt
CREATE OR REPLACE FUNCTION update_challenge_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE challenges
  SET
    play_count = play_count + 1,
    avg_score = (
      SELECT AVG(score)
      FROM attempts
      WHERE challenge_id = NEW.challenge_id
    )
  WHERE id = NEW.challenge_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_attempt_created
  AFTER INSERT ON attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_stats();

-- Update profile stats after attempt
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    total_attempts = total_attempts + 1,
    fastest_bpm = GREATEST(fastest_bpm, NEW.bpm_completed),
    accuracy_average = (
      SELECT AVG(accuracy)
      FROM attempts
      WHERE user_id = NEW.user_id
    ),
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_attempt_profile_update
  AFTER INSERT ON attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();

-- Check and mark personal best
CREATE OR REPLACE FUNCTION check_personal_best()
RETURNS TRIGGER AS $$
DECLARE
  prev_best INTEGER;
BEGIN
  -- Get previous best score for this user and challenge
  SELECT COALESCE(MAX(score), 0) INTO prev_best
  FROM attempts
  WHERE user_id = NEW.user_id
    AND challenge_id = NEW.challenge_id
    AND id != NEW.id;

  -- Mark as personal best if score is higher
  IF NEW.score > prev_best THEN
    NEW.is_personal_best = true;

    -- Unmark previous bests
    UPDATE attempts
    SET is_personal_best = false
    WHERE user_id = NEW.user_id
      AND challenge_id = NEW.challenge_id
      AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_attempt_check_pb
  BEFORE INSERT ON attempts
  FOR EACH ROW
  EXECUTE FUNCTION check_personal_best();

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed some starter challenges
INSERT INTO challenges (title, phrase, difficulty, bpm, mode, is_public, is_daily, created_by)
VALUES
  ('Classic Twister', 'She sells seashells by the seashore', 2, 100, 'fixed', true, true, NULL),
  ('Speed Demon', 'How much wood would a woodchuck chuck if a woodchuck could chuck wood', 3, 120, 'ramp', true, false, NULL),
  ('Rapid Fire', 'Peter Piper picked a peck of pickled peppers', 2, 80, 'fixed', true, false, NULL),
  ('Insane Mode', 'Red lorry yellow lorry red lorry yellow lorry', 4, 140, 'ladder', true, false, NULL),
  ('Beginner Beat', 'Toy boat toy boat toy boat', 1, 80, 'fixed', true, false, NULL);
