export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          best_streak: number
          fastest_bpm: number
          accuracy_average: number
          total_attempts: number
          badges: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          best_streak?: number
          fastest_bpm?: number
          accuracy_average?: number
          total_attempts?: number
          badges?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          best_streak?: number
          fastest_bpm?: number
          accuracy_average?: number
          total_attempts?: number
          badges?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          created_by: string
          title: string
          phrase: string
          difficulty: number
          language: string
          bpm: number
          mode: 'fixed' | 'ramp' | 'ladder'
          is_public: boolean
          is_daily: boolean
          play_count: number
          avg_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by: string
          title: string
          phrase: string
          difficulty?: number
          language?: string
          bpm?: number
          mode?: 'fixed' | 'ramp' | 'ladder'
          is_public?: boolean
          is_daily?: boolean
          play_count?: number
          avg_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string
          title?: string
          phrase?: string
          difficulty?: number
          language?: string
          bpm?: number
          mode?: 'fixed' | 'ramp' | 'ladder'
          is_public?: boolean
          is_daily?: boolean
          play_count?: number
          avg_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      attempts: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          score: number
          accuracy: number
          bpm_completed: number
          transcript: string | null
          audio_url: string | null
          video_url: string | null
          is_personal_best: boolean
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          score: number
          accuracy: number
          bpm_completed: number
          transcript?: string | null
          audio_url?: string | null
          video_url?: string | null
          is_personal_best?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          score?: number
          accuracy?: number
          bpm_completed?: number
          transcript?: string | null
          audio_url?: string | null
          video_url?: string | null
          is_personal_best?: boolean
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          challenge_id: string | null
          attempt_id: string | null
          reported_by: string
          reason: string
          status: 'pending' | 'reviewed' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id?: string | null
          attempt_id?: string | null
          reported_by: string
          reason: string
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string | null
          attempt_id?: string | null
          reported_by?: string
          reason?: string
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
