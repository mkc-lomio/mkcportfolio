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

// ============ TODO TYPES ============

export type TodoPriority = "Low" | "Medium" | "High" | "Urgent";
export type TodoStatus = "Pending" | "In Progress" | "Done";

export interface Todo {
  id?: number;
  title: string;
  description?: string;
  priority: TodoPriority;
  status: TodoStatus;
  due_date?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

// ============ TODO CRUD ============

export async function getTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTodo(todo: Omit<Todo, "id" | "created_at" | "updated_at">): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert([{ ...todo, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTodo(id: number, todo: Partial<Todo>): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ ...todo, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTodo(id: number): Promise<void> {
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============ SUBSCRIPTION TYPES ============

export type SubscriptionFrequency = "Monthly" | "Quarterly" | "Yearly";

export interface Subscription {
  id?: number;
  name: string;
  amount: number;
  currency: string;
  frequency: SubscriptionFrequency;
  next_due?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============ SUBSCRIPTION CRUD ============

export async function getSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSubscription(sub: Omit<Subscription, "id" | "created_at" | "updated_at">): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert([{ ...sub, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubscription(id: number, sub: Partial<Subscription>): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({ ...sub, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubscription(id: number): Promise<void> {
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============ CREDIT/LOAN TYPES ============

export type CreditLoanStatus = "Active" | "Paid Off" | "Overdue" | "Deferred";

export interface CreditLoan {
  id?: number;
  name: string;
  total_amount: number;
  remaining_amount: number;
  monthly_payment: number;
  currency: string;
  interest_rate: number;
  status: CreditLoanStatus;
  due_date?: string;
  lender?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// ============ CREDIT/LOAN CRUD ============

export async function getCreditsLoans(): Promise<CreditLoan[]> {
  const { data, error } = await supabase
    .from("credits_loans")
    .select("*")
    .order("status", { ascending: true })
    .order("remaining_amount", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCreditLoan(loan: Omit<CreditLoan, "id" | "created_at" | "updated_at">): Promise<CreditLoan> {
  const { data, error } = await supabase
    .from("credits_loans")
    .insert([{ ...loan, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCreditLoan(id: number, loan: Partial<CreditLoan>): Promise<CreditLoan> {
  const { data, error } = await supabase
    .from("credits_loans")
    .update({ ...loan, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCreditLoan(id: number): Promise<void> {
  const { error } = await supabase
    .from("credits_loans")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============ DAILY EXPENSE TYPES ============

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Bills"
  | "Health"
  | "Education"
  | "Groceries"
  | "Personal"
  | "Other";

export const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food", "Transport", "Shopping", "Entertainment", "Bills",
  "Health", "Education", "Groceries", "Personal", "Other",
];

export interface DailyExpense {
  id?: number;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  expense_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// ============ DAILY EXPENSE CRUD ============

export async function getDailyExpenses(): Promise<DailyExpense[]> {
  const { data, error } = await supabase
    .from("daily_expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createDailyExpense(exp: Omit<DailyExpense, "id" | "created_at" | "updated_at">): Promise<DailyExpense> {
  const { data, error } = await supabase
    .from("daily_expenses")
    .insert([{ ...exp, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDailyExpense(id: number, exp: Partial<DailyExpense>): Promise<DailyExpense> {
  const { data, error } = await supabase
    .from("daily_expenses")
    .update({ ...exp, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDailyExpense(id: number): Promise<void> {
  const { error } = await supabase
    .from("daily_expenses")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============ KNOWLEDGE BASE TYPES ============

export type KnowledgeCategory =
  | "English"
  | "Vocabulary"
  | "Grammar"
  | "History"
  | "Science"
  | "Health"
  | "Finance"
  | "Philosophy"
  | "Psychology"
  | "Books"
  | "Life Lessons"
  | "Fun Facts"
  | "General";

export interface KnowledgeEntry {
  id?: number;
  title: string;
  content: string;
  category: KnowledgeCategory;
  source?: string;
  source_url?: string;
  tags?: string[];
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============ KNOWLEDGE BASE CRUD ============

export async function getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .order("category", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createKnowledgeEntry(entry: Omit<KnowledgeEntry, "id" | "created_at" | "updated_at">): Promise<KnowledgeEntry> {
  const { data, error } = await supabase
    .from("knowledge_base")
    .insert([{ ...entry, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateKnowledgeEntry(id: number, entry: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> {
  const { data, error } = await supabase
    .from("knowledge_base")
    .update({ ...entry, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteKnowledgeEntry(id: number): Promise<void> {
  const { error } = await supabase
    .from("knowledge_base")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function toggleKnowledgeFavorite(id: number, is_favorite: boolean): Promise<void> {
  const { error } = await supabase
    .from("knowledge_base")
    .update({ is_favorite, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}