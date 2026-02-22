import { supabase } from "./supabase";

// ============ TYPES ============

export type ApplicationStatus =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Technical"
  | "Offer"
  | "Accepted"
  | "Rejected"
  | "Withdrawn"
  | "Ghosted";

export interface JobApplication {
  id?: number;
  company: string;
  position: string;
  date_applied: string;
  status: ApplicationStatus;
  salary_range?: string;
  location?: string;
  job_url?: string;
  notes?: string;
  interview_dates?: string[];
  created_at?: string;
  updated_at?: string;
}

// ============ CRUD OPERATIONS ============

export async function getApplications(): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .order("date_applied", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getApplicationById(id: number): Promise<JobApplication | null> {
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createApplication(app: Omit<JobApplication, "id" | "created_at" | "updated_at">): Promise<JobApplication> {
  const { data, error } = await supabase
    .from("job_applications")
    .insert([{ ...app, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateApplication(id: number, app: Partial<JobApplication>): Promise<JobApplication> {
  const { data, error } = await supabase
    .from("job_applications")
    .update({ ...app, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteApplication(id: number): Promise<void> {
  const { error } = await supabase
    .from("job_applications")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============ INTERVIEW PREP TYPES ============

export type PrepCategory =
  | "Behavioral"
  | "System Design"
  | "C# / .NET"
  | "SQL / Database"
  | "Angular / Frontend"
  | "Azure / Cloud"
  | "API / Integration"
  | "General Technical"
  | "Culture Fit"
  | "Security"
  | "Project Management";

export type PrepDifficulty = "Easy" | "Medium" | "Hard";

export interface InterviewPrep {
  id?: number;
  category: PrepCategory;
  question: string;
  answer: string;
  difficulty: PrepDifficulty;
  tags?: string[];
  is_favorite?: boolean;
  last_reviewed?: string;
  created_at?: string;
  updated_at?: string;
}

// ============ INTERVIEW PREP CRUD ============

export async function getInterviewPreps(): Promise<InterviewPrep[]> {
  const { data, error } = await supabase
    .from("interview_prep")
    .select("*")
    .order("category", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createInterviewPrep(item: Omit<InterviewPrep, "id" | "created_at" | "updated_at">): Promise<InterviewPrep> {
  const { data, error } = await supabase
    .from("interview_prep")
    .insert([{ ...item, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInterviewPrep(id: number, item: Partial<InterviewPrep>): Promise<InterviewPrep> {
  const { data, error } = await supabase
    .from("interview_prep")
    .update({ ...item, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInterviewPrep(id: number): Promise<void> {
  const { error } = await supabase
    .from("interview_prep")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function togglePrepFavorite(id: number, is_favorite: boolean): Promise<void> {
  const { error } = await supabase
    .from("interview_prep")
    .update({ is_favorite, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function markAsReviewed(id: number): Promise<void> {
  const { error } = await supabase
    .from("interview_prep")
    .update({ last_reviewed: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
