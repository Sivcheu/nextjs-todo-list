export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: any
          content: string
          is_completed: boolean
          created_at: Date
        }
        Insert: {
          id: any
          content: string
          is_completed: boolean
          created_at: Date
        }
        Update: {
          id?: never
          content: string
          is_completed: boolean
          created_at: Date
        }
      }
    }
  }
}