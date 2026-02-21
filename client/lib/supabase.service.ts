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
