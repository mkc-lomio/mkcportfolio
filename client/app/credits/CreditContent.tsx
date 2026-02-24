"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Subscription, SubscriptionFrequency,
  CreditLoan, CreditLoanStatus,
  DailyExpense, ExpenseCategory,
  getSubscriptions, createSubscription, updateSubscription, deleteSubscription,
  getCreditsLoans, createCreditLoan, updateCreditLoan, deleteCreditLoan,
  getDailyExpenses, createDailyExpense, updateDailyExpense, deleteDailyExpense,
  ALL_EXPENSE_CATEGORIES,
} from "../../lib/supabase.service";

/* ============================================================
   THEME  (matches portfolio globals)
   ============================================================ */

const T = {
  bg: "hsl(0,0%,7%)", surface: "hsl(240,2%,13%)", surface2: "hsl(240,2%,12%)",
  card: "hsl(240,1%,17%)", jet: "hsl(0,0%,22%)", border: "hsl(0,0%,25%)",
  gold: "hsl(45,100%,72%)", goldDim: "hsl(45,54%,58%)",
  white1: "hsl(0,0%,100%)", white2: "hsl(0,0%,98%)",
  gray: "hsl(0,0%,84%)", gray70: "hsla(0,0%,84%,0.7)", grayDim: "hsl(0,0%,55%)",
  font: "'Poppins', sans-serif", radius: 14,
  shadow: "0 16px 30px hsla(0,0%,0%,0.25)", transition: "0.25s ease",
};

/* ============================================================
   CONSTANTS
   ============================================================ */

const PASSWORD = "112628*";

const ALL_FREQUENCIES: SubscriptionFrequency[] = ["Monthly", "Quarterly", "Yearly"];
const ALL_LOAN_STATUSES: CreditLoanStatus[] = ["Active", "Paid Off", "Overdue", "Deferred"];

type Tab = "subscriptions" | "credits" | "expenses";

const frequencyConfig: Record<SubscriptionFrequency, { icon: string; color: string; bg: string }> = {
  Monthly:   { icon: "📅", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  Quarterly: { icon: "📆", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  Yearly:    { icon: "🗓️", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
};

const loanStatusConfig: Record<CreditLoanStatus, { icon: string; color: string; bg: string }> = {
  Active:   { icon: "🔵", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  "Paid Off": { icon: "✅", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  Overdue:  { icon: "🔴", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  Deferred: { icon: "⏸️", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
};

const categoryConfig: Record<ExpenseCategory, { icon: string; color: string }> = {
  Food:           { icon: "🍔", color: "#fb923c" },
  Transport:      { icon: "🚗", color: "#60a5fa" },
  Shopping:       { icon: "🛒", color: "#a78bfa" },
  Entertainment:  { icon: "🎮", color: "#f472b6" },
  Bills:          { icon: "💡", color: "#fbbf24" },
  Health:         { icon: "💊", color: "#4ade80" },
  Education:      { icon: "📚", color: "#38bdf8" },
  Groceries:      { icon: "🥬", color: "#34d399" },
  Personal:       { icon: "👤", color: "#c084fc" },
  Other:          { icon: "📦", color: "#94a3b8" },
};

const EMPTY_SUB: Omit<Subscription, "id" | "created_at" | "updated_at"> = {
  name: "", amount: 0, currency: "PHP", frequency: "Monthly", next_due: "", notes: "", is_active: true,
};

const EMPTY_LOAN: Omit<CreditLoan, "id" | "created_at" | "updated_at"> = {
  name: "", total_amount: 0, remaining_amount: 0, monthly_payment: 0, currency: "PHP",
  interest_rate: 0, status: "Active", due_date: "", lender: "", notes: "",
};

const EMPTY_EXPENSE: Omit<DailyExpense, "id" | "created_at" | "updated_at"> = {
  description: "", amount: 0, currency: "PHP", category: "Food", expense_date: new Date().toISOString().slice(0, 10), notes: "",
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function CreditContent() {
  /* ---- auth state ---- */
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  /* ---- tab state ---- */
  const [tab, setTab] = useState<Tab>("subscriptions");

  /* ---- subscriptions state ---- */
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsError, setSubsError] = useState<string | null>(null);
  const [showSubForm, setShowSubForm] = useState(false);
  const [editSubId, setEditSubId] = useState<number | null>(null);
  const [subForm, setSubForm] = useState(EMPTY_SUB);
  const [subSaving, setSubSaving] = useState(false);
  const [deleteSubConfirm, setDeleteSubConfirm] = useState<number | null>(null);
  const subFormRef = useRef<HTMLDivElement>(null);

  /* ---- credits/loans state ---- */
  const [loans, setLoans] = useState<CreditLoan[]>([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [loansError, setLoansError] = useState<string | null>(null);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [editLoanId, setEditLoanId] = useState<number | null>(null);
  const [loanForm, setLoanForm] = useState(EMPTY_LOAN);
  const [loanSaving, setLoanSaving] = useState(false);
  const [deleteLoanConfirm, setDeleteLoanConfirm] = useState<number | null>(null);
  const loanFormRef = useRef<HTMLDivElement>(null);

  /* ---- expenses state ---- */
  const [expenses, setExpenses] = useState<DailyExpense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  const [showExpForm, setShowExpForm] = useState(false);
  const [editExpId, setEditExpId] = useState<number | null>(null);
  const [expForm, setExpForm] = useState(EMPTY_EXPENSE);
  const [expSaving, setExpSaving] = useState(false);
  const [deleteExpConfirm, setDeleteExpConfirm] = useState<number | null>(null);
  const [expDateFilter, setExpDateFilter] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const expFormRef = useRef<HTMLDivElement>(null);

  /* ---- auth ---- */
  const handleAuth = () => {
    if (passwordInput === PASSWORD) {
      setUnlocking(true);
      setPasswordError(false);
      setTimeout(() => setAuthenticated(true), 600);
    } else {
      setPasswordError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => { setPasswordInput(""); setPasswordError(false); }, 1200);
    }
  };

  /* ---- loaders ---- */
  const loadSubs = useCallback(async () => {
    try { setSubsLoading(true); setSubsError(null); setSubs(await getSubscriptions()); }
    catch (e: unknown) { setSubsError(e instanceof Error ? e.message : "Failed to load subscriptions"); }
    finally { setSubsLoading(false); }
  }, []);

  const loadLoans = useCallback(async () => {
    try { setLoansLoading(true); setLoansError(null); setLoans(await getCreditsLoans()); }
    catch (e: unknown) { setLoansError(e instanceof Error ? e.message : "Failed to load credits/loans"); }
    finally { setLoansLoading(false); }
  }, []);

  const loadExpenses = useCallback(async () => {
    try { setExpensesLoading(true); setExpensesError(null); setExpenses(await getDailyExpenses()); }
    catch (e: unknown) { setExpensesError(e instanceof Error ? e.message : "Failed to load expenses"); }
    finally { setExpensesLoading(false); }
  }, []);

  useEffect(() => {
    if (authenticated) { loadSubs(); loadLoans(); loadExpenses(); }
  }, [authenticated, loadSubs, loadLoans, loadExpenses]);

  /* ============================================================
     SUBSCRIPTION HANDLERS
     ============================================================ */

  const openCreateSub = () => { setSubForm(EMPTY_SUB); setEditSubId(null); setShowSubForm(true); setTimeout(() => subFormRef.current?.scrollIntoView({ behavior: "smooth" }), 100); };
  const openEditSub = (s: Subscription) => {
    setSubForm({ name: s.name, amount: s.amount, currency: s.currency || "AUD", frequency: s.frequency, next_due: s.next_due || "", notes: s.notes || "", is_active: s.is_active ?? true });
    setEditSubId(s.id!); setShowSubForm(true);
    setTimeout(() => subFormRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };
  const cancelSubForm = () => { setShowSubForm(false); setEditSubId(null); setSubForm(EMPTY_SUB); };

  const handleSaveSub = async () => {
    if (!subForm.name.trim()) return;
    setSubSaving(true);
    try {
      const payload = { ...subForm, next_due: subForm.next_due || undefined, notes: subForm.notes || undefined };
      if (editSubId) { await updateSubscription(editSubId, payload); } else { await createSubscription(payload as Parameters<typeof createSubscription>[0]); }
      cancelSubForm(); await loadSubs();
    } catch (e: unknown) { setSubsError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSubSaving(false); }
  };

  const handleDeleteSub = async (id: number) => {
    try { await deleteSubscription(id); setDeleteSubConfirm(null); await loadSubs(); }
    catch (e: unknown) { setSubsError(e instanceof Error ? e.message : "Failed to delete"); }
  };

  /* ============================================================
     CREDIT/LOAN HANDLERS
     ============================================================ */

  const openCreateLoan = () => { setLoanForm(EMPTY_LOAN); setEditLoanId(null); setShowLoanForm(true); setTimeout(() => loanFormRef.current?.scrollIntoView({ behavior: "smooth" }), 100); };
  const openEditLoan = (l: CreditLoan) => {
    setLoanForm({
      name: l.name, total_amount: l.total_amount, remaining_amount: l.remaining_amount, monthly_payment: l.monthly_payment,
      currency: l.currency || "AUD", interest_rate: l.interest_rate || 0, status: l.status, due_date: l.due_date || "",
      lender: l.lender || "", notes: l.notes || "",
    });
    setEditLoanId(l.id!); setShowLoanForm(true);
    setTimeout(() => loanFormRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };
  const cancelLoanForm = () => { setShowLoanForm(false); setEditLoanId(null); setLoanForm(EMPTY_LOAN); };

  const handleSaveLoan = async () => {
    if (!loanForm.name.trim()) return;
    setLoanSaving(true);
    try {
      const payload = { ...loanForm, due_date: loanForm.due_date || undefined, lender: loanForm.lender || undefined, notes: loanForm.notes || undefined };
      if (editLoanId) { await updateCreditLoan(editLoanId, payload); } else { await createCreditLoan(payload as Parameters<typeof createCreditLoan>[0]); }
      cancelLoanForm(); await loadLoans();
    } catch (e: unknown) { setLoansError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setLoanSaving(false); }
  };

  const handleDeleteLoan = async (id: number) => {
    try { await deleteCreditLoan(id); setDeleteLoanConfirm(null); await loadLoans(); }
    catch (e: unknown) { setLoansError(e instanceof Error ? e.message : "Failed to delete"); }
  };

  /* ============================================================
     EXPENSE HANDLERS
     ============================================================ */

  const openCreateExp = () => { setExpForm({ ...EMPTY_EXPENSE, expense_date: new Date().toISOString().slice(0, 10) }); setEditExpId(null); setShowExpForm(true); setTimeout(() => expFormRef.current?.scrollIntoView({ behavior: "smooth" }), 100); };
  const openEditExp = (e: DailyExpense) => {
    setExpForm({ description: e.description, amount: e.amount, currency: e.currency || "AUD", category: e.category, expense_date: e.expense_date, notes: e.notes || "" });
    setEditExpId(e.id!); setShowExpForm(true);
    setTimeout(() => expFormRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };
  const cancelExpForm = () => { setShowExpForm(false); setEditExpId(null); setExpForm(EMPTY_EXPENSE); };

  const handleSaveExp = async () => {
    if (!expForm.description.trim()) return;
    setExpSaving(true);
    try {
      const payload = { ...expForm, notes: expForm.notes || undefined };
      if (editExpId) { await updateDailyExpense(editExpId, payload); } else { await createDailyExpense(payload as Parameters<typeof createDailyExpense>[0]); }
      cancelExpForm(); await loadExpenses();
    } catch (e: unknown) { setExpensesError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setExpSaving(false); }
  };

  const handleDeleteExp = async (id: number) => {
    try { await deleteDailyExpense(id); setDeleteExpConfirm(null); await loadExpenses(); }
    catch (e: unknown) { setExpensesError(e instanceof Error ? e.message : "Failed to delete"); }
  };

  /* ---- computed stats ---- */
  const subStats = {
    total: subs.length,
    active: subs.filter(s => s.is_active).length,
    monthlyTotal: subs.filter(s => s.is_active).reduce((sum, s) => {
      if (s.frequency === "Monthly") return sum + s.amount;
      if (s.frequency === "Quarterly") return sum + (s.amount / 3);
      if (s.frequency === "Yearly") return sum + (s.amount / 12);
      return sum;
    }, 0),
  };

  const loanStats = {
    total: loans.length,
    active: loans.filter(l => l.status === "Active").length,
    totalRemaining: loans.filter(l => l.status === "Active").reduce((sum, l) => sum + l.remaining_amount, 0),
    monthlyPayments: loans.filter(l => l.status === "Active").reduce((sum, l) => sum + l.monthly_payment, 0),
  };

  const filteredExpenses = expenses.filter(e => e.expense_date.startsWith(expDateFilter));
  const expStats = {
    monthTotal: filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    count: filteredExpenses.length,
    byCategory: ALL_EXPENSE_CATEGORIES.map(cat => ({
      category: cat,
      total: filteredExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
      count: filteredExpenses.filter(e => e.category === cat).length,
    })).filter(c => c.count > 0).sort((a, b) => b.total - a.total),
  };

  /* ---- monthly chart data (last 12 months) ---- */
  const monthlyChartData = (() => {
    const months: { key: string; label: string; short: string; total: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const short = d.toLocaleDateString("en-US", { month: "short" });
      const total = expenses.filter(e => e.expense_date.startsWith(key)).reduce((sum, e) => sum + e.amount, 0);
      months.push({ key, label, short, total });
    }
    return months;
  })();

  /* ============================================================
     PASSWORD SCREEN
     ============================================================ */

  const CODE_LENGTH = PASSWORD.length; // 7

  if (!authenticated) {
    const chars = passwordInput.split("");

    return (
      <div style={{
        minHeight: "100vh", background: T.bg, fontFamily: T.font,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}>
        {/* keyframe styles */}
        <style>{`
          @keyframes lockPulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.15); opacity: 0.25; }
          }
          @keyframes shakeX {
            0%, 100% { transform: translateX(0); }
            15%, 45%, 75% { transform: translateX(-10px); }
            30%, 60%, 90% { transform: translateX(10px); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes unlockScale {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(0.95); opacity: 0; }
          }
          @keyframes dotPop {
            0% { transform: scale(0); }
            60% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }
          @keyframes cursorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>

        <div style={{
          animation: unlocking ? "unlockScale 0.6s ease forwards" : "fadeUp 0.5s ease",
          width: "100%", maxWidth: 420,
        }}>
          {/* Card */}
          <div style={{
            position: "relative", overflow: "hidden",
            background: `linear-gradient(to bottom right, ${T.surface} 0%, ${T.surface2} 100%)`,
            borderRadius: 20, padding: "48px 32px 40px",
            border: `1px solid ${T.jet}`,
            boxShadow: `0 24px 80px hsla(0,0%,0%,0.4), 0 0 0 1px hsla(45,100%,72%,0.04)`,
            textAlign: "center",
          }}>
            {/* Subtle top gold accent line */}
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: 80, height: 3, borderRadius: "0 0 3px 3px",
              background: `linear-gradient(to right, transparent, ${T.gold}, transparent)`,
              opacity: 0.5,
            }} />

            {/* Lock icon with pulse ring */}
            <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
              <div style={{
                position: "absolute", inset: -12,
                borderRadius: "50%",
                border: `2px solid ${T.gold}`,
                opacity: 0.15,
                animation: "lockPulse 2.5s ease-in-out infinite",
              }} />
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: `linear-gradient(135deg, hsla(45,100%,72%,0.12) 0%, hsla(45,100%,72%,0.04) 100%)`,
                border: `1px solid hsla(45,100%,72%,0.15)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28,
              }}>
                {unlocking ? "🔓" : passwordError ? "🚫" : "🔐"}
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: 22, fontWeight: 600, margin: "0 0 4px 0",
              background: `linear-gradient(to right, ${T.gold}, ${T.goldDim})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Credit Monitoring
            </h2>
            <p style={{ color: T.grayDim, fontSize: 13, margin: "0 0 32px 0", lineHeight: 1.5 }}>
              Enter your access code to continue
            </p>

            {/* Hidden input that captures keyboard */}
            <input
              ref={hiddenInputRef}
              type="password"
              value={passwordInput}
              onChange={e => {
                const val = e.target.value;
                if (val.length <= CODE_LENGTH) {
                  setPasswordInput(val);
                  setPasswordError(false);
                }
                if (val.length === CODE_LENGTH) {
                  // Auto-submit when all chars entered
                  setTimeout(() => {
                    if (val === PASSWORD) {
                      setUnlocking(true);
                      setPasswordError(false);
                      setTimeout(() => setAuthenticated(true), 600);
                    } else {
                      setPasswordError(true);
                      setShaking(true);
                      setTimeout(() => setShaking(false), 500);
                      setTimeout(() => { setPasswordInput(""); setPasswordError(false); }, 1200);
                    }
                  }, 150);
                }
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && passwordInput.length > 0) handleAuth();
              }}
              autoFocus
              style={{ position: "fixed", top: -100, left: -100, opacity: 0, width: 1, height: 1, pointerEvents: "none" }}
            />

            {/* Code dots display */}
            <div
              onClick={() => hiddenInputRef.current?.focus()}
              style={{
                display: "flex", gap: 8, justifyContent: "center", marginBottom: 12,
                cursor: "text",
                animation: shaking ? "shakeX 0.4s ease" : undefined,
              }}
            >
              {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                const filled = i < chars.length;
                const isActive = i === chars.length;
                return (
                  <div key={i} style={{
                    width: 38, height: 46,
                    borderRadius: 10,
                    border: `2px solid ${passwordError ? "#f87171" : isActive ? T.gold : filled ? `hsla(45,100%,72%,0.4)` : T.jet}`,
                    background: filled
                      ? `linear-gradient(135deg, hsla(45,100%,72%,0.1) 0%, hsla(45,100%,72%,0.04) 100%)`
                      : passwordError ? "rgba(248,113,113,0.06)" : T.surface2,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? `0 0 0 3px hsla(45,100%,72%,0.1)` : filled ? `0 0 12px hsla(45,100%,72%,0.06)` : "none",
                    position: "relative",
                  }}>
                    {filled ? (
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: passwordError ? "#f87171" : T.gold,
                        animation: "dotPop 0.2s ease",
                      }} />
                    ) : isActive ? (
                      <div style={{
                        width: 2, height: 20,
                        background: T.gold,
                        borderRadius: 1,
                        animation: "cursorBlink 1s step-end infinite",
                      }} />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Error message */}
            <div style={{ minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              {passwordError && (
                <p style={{
                  color: "#f87171", fontSize: 12, margin: 0,
                  animation: "fadeUp 0.2s ease",
                }}>
                  Incorrect code. Please try again.
                </p>
              )}
            </div>

            {/* Unlock button */}
            <button
              onClick={() => { hiddenInputRef.current?.focus(); if (passwordInput.length > 0) handleAuth(); }}
              disabled={passwordInput.length === 0 || unlocking}
              style={{
                width: "100%", padding: "14px 0", fontSize: 14, fontWeight: 600,
                fontFamily: T.font, cursor: passwordInput.length > 0 ? "pointer" : "not-allowed",
                border: "none", borderRadius: 12,
                background: passwordInput.length > 0
                  ? `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDim} 100%)`
                  : T.jet,
                color: passwordInput.length > 0 ? T.surface : T.grayDim,
                transition: "all 0.3s ease",
                opacity: passwordInput.length > 0 ? 1 : 0.5,
                boxShadow: passwordInput.length > 0 ? `0 4px 20px hsla(45,100%,72%,0.2)` : "none",
                letterSpacing: 0.5,
              }}
            >
              {unlocking ? "Unlocking..." : "Unlock"}
            </button>

            {/* Subtle footer */}
            <p style={{ color: T.jet, fontSize: 11, marginTop: 20, letterSpacing: 1 }}>
              PROTECTED ACCESS
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.white2, padding: "24px 16px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ---- HEADER ---- */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a href="/?code=mkc" style={{ color: T.grayDim, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: T.transition }}
                onMouseEnter={e => (e.currentTarget.style.color = T.gold)} onMouseLeave={e => (e.currentTarget.style.color = T.grayDim)}>
                ← Portfolio
              </a>
              <span style={{ color: T.jet }}>|</span>
              <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, background: `linear-gradient(to right, ${T.gold}, ${T.goldDim})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                💳 Credit Monitoring
              </h1>
            </div>
            <p style={{ color: T.grayDim, fontSize: 13, margin: "4px 0 0 0" }}>Track subscriptions, loans & daily expenses</p>
          </div>
        </div>

        {/* ---- TABS ---- */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `1px solid ${T.jet}` }}>
          {([
            { key: "subscriptions" as Tab, label: "📦 Subscriptions", count: subs.length },
            { key: "credits" as Tab, label: "🏦 Credits / Loans", count: loans.length },
            { key: "expenses" as Tab, label: "💸 Daily Expenses", count: filteredExpenses.length },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "14px 12px", background: "transparent", border: "none", borderBottom: tab === t.key ? `2px solid ${T.gold}` : "2px solid transparent",
              color: tab === t.key ? T.gold : T.grayDim, fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
              fontFamily: T.font, cursor: "pointer", transition: T.transition, whiteSpace: "nowrap",
            }}>
              {t.label} <span style={{ fontSize: 11, opacity: 0.7 }}>({t.count})</span>
            </button>
          ))}
        </div>

        {/* ================================================================
           SUBSCRIPTIONS TAB
           ================================================================ */}
        {tab === "subscriptions" && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Total", value: subStats.total, color: T.gray },
                { label: "Active", value: subStats.active, color: "#4ade80" },
                { label: "Monthly Cost", value: `₱${subStats.monthlyTotal.toFixed(2)}`, color: T.gold },
              ].map(s => (
                <div key={s.label} style={{ background: T.surface, borderRadius: T.radius, padding: "14px 16px", border: `1px solid ${T.jet}` }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: T.grayDim, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={openCreateSub} style={btnStyle(T.gold, "transparent", T.gold)}>+ New Subscription</button>
            </div>

            {subsError && <ErrorBanner message={subsError} onDismiss={() => setSubsError(null)} />}

            {/* Form */}
            {showSubForm && (
              <div ref={subFormRef} style={formContainerStyle}>
                <h3 style={formTitleStyle}>{editSubId ? "Edit Subscription" : "New Subscription"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Name *</label>
                    <input value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} style={inputStyle("100%")} placeholder="Netflix, Spotify..." />
                  </div>
                  <div>
                    <label style={labelStyle}>Amount *</label>
                    <input type="number" step="0.01" value={subForm.amount || ""} onChange={e => setSubForm({ ...subForm, amount: parseFloat(e.target.value) || 0 })} style={inputStyle("100%")} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select value={subForm.currency} onChange={e => setSubForm({ ...subForm, currency: e.target.value })} style={selectStyle("100%")}>
                      {["PHP", "AUD", "USD", "EUR", "GBP"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Frequency</label>
                    <select value={subForm.frequency} onChange={e => setSubForm({ ...subForm, frequency: e.target.value as SubscriptionFrequency })} style={selectStyle("100%")}>
                      {ALL_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Next Due</label>
                    <input type="date" value={subForm.next_due} onChange={e => setSubForm({ ...subForm, next_due: e.target.value })} style={inputStyle("100%")} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Notes</label>
                    <input value={subForm.notes || ""} onChange={e => setSubForm({ ...subForm, notes: e.target.value })} style={inputStyle("100%")} placeholder="Optional notes..." />
                  </div>
                  <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" checked={subForm.is_active} onChange={e => setSubForm({ ...subForm, is_active: e.target.checked })} id="sub-active" />
                    <label htmlFor="sub-active" style={{ fontSize: 13, color: T.gray, cursor: "pointer" }}>Active</label>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
                  <button onClick={cancelSubForm} style={btnStyle(T.gray, "transparent", T.jet)}>Cancel</button>
                  <button onClick={handleSaveSub} disabled={subSaving} style={btnStyle(T.surface, T.gold, T.gold)}>{subSaving ? "Saving..." : editSubId ? "Update" : "Create"}</button>
                </div>
              </div>
            )}

            {/* List */}
            {subsLoading ? <LoadingSpinner /> : subs.length === 0 ? <EmptyState text="No subscriptions yet" /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {subs.map(s => (
                  <div key={s.id} style={{ background: T.surface, borderRadius: T.radius, padding: "16px 20px", border: `1px solid ${T.jet}`, opacity: s.is_active ? 1 : 0.5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: T.white1 }}>{s.name}</span>
                          <span style={{ ...badgeStyle(frequencyConfig[s.frequency].bg, frequencyConfig[s.frequency].color) }}>
                            {frequencyConfig[s.frequency].icon} {s.frequency}
                          </span>
                          {!s.is_active && <span style={{ ...badgeStyle("rgba(148,163,184,0.12)", "#94a3b8") }}>Inactive</span>}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 600, color: T.gold }}>₱{s.amount.toFixed(2)} <span style={{ fontSize: 12, color: T.grayDim, fontWeight: 400 }}>{s.currency}</span></div>
                        {s.next_due && <div style={{ fontSize: 12, color: T.grayDim, marginTop: 4 }}>Next due: {s.next_due}</div>}
                        {s.notes && <div style={{ fontSize: 12, color: T.gray70, marginTop: 4 }}>{s.notes}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEditSub(s)} style={iconBtnStyle(T.gold)} title="Edit">✏️</button>
                        {deleteSubConfirm === s.id ? (
                          <>
                            <button onClick={() => handleDeleteSub(s.id!)} style={iconBtnStyle("#f87171")} title="Confirm">✓</button>
                            <button onClick={() => setDeleteSubConfirm(null)} style={iconBtnStyle(T.grayDim)} title="Cancel">✕</button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteSubConfirm(s.id!)} style={iconBtnStyle("#f87171")} title="Delete">🗑️</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ================================================================
           CREDITS / LOANS TAB
           ================================================================ */}
        {tab === "credits" && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Total Loans", value: loanStats.total, color: T.gray },
                { label: "Active", value: loanStats.active, color: "#60a5fa" },
                { label: "Total Remaining", value: `₱${loanStats.totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "#f87171" },
                { label: "Monthly Payments", value: `₱${loanStats.monthlyPayments.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: T.gold },
              ].map(s => (
                <div key={s.label} style={{ background: T.surface, borderRadius: T.radius, padding: "14px 16px", border: `1px solid ${T.jet}` }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: T.grayDim, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={openCreateLoan} style={btnStyle(T.gold, "transparent", T.gold)}>+ New Credit / Loan</button>
            </div>

            {loansError && <ErrorBanner message={loansError} onDismiss={() => setLoansError(null)} />}

            {/* Form */}
            {showLoanForm && (
              <div ref={loanFormRef} style={formContainerStyle}>
                <h3 style={formTitleStyle}>{editLoanId ? "Edit Credit / Loan" : "New Credit / Loan"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Name *</label>
                    <input value={loanForm.name} onChange={e => setLoanForm({ ...loanForm, name: e.target.value })} style={inputStyle("100%")} placeholder="Home Loan, Credit Card..." />
                  </div>
                  <div>
                    <label style={labelStyle}>Total Amount</label>
                    <input type="number" step="0.01" value={loanForm.total_amount || ""} onChange={e => setLoanForm({ ...loanForm, total_amount: parseFloat(e.target.value) || 0 })} style={inputStyle("100%")} />
                  </div>
                  <div>
                    <label style={labelStyle}>Remaining</label>
                    <input type="number" step="0.01" value={loanForm.remaining_amount || ""} onChange={e => setLoanForm({ ...loanForm, remaining_amount: parseFloat(e.target.value) || 0 })} style={inputStyle("100%")} />
                  </div>
                  <div>
                    <label style={labelStyle}>Monthly Payment</label>
                    <input type="number" step="0.01" value={loanForm.monthly_payment || ""} onChange={e => setLoanForm({ ...loanForm, monthly_payment: parseFloat(e.target.value) || 0 })} style={inputStyle("100%")} />
                  </div>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select value={loanForm.currency} onChange={e => setLoanForm({ ...loanForm, currency: e.target.value })} style={selectStyle("100%")}>
                      {["PHP", "AUD", "USD", "EUR", "GBP"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Interest Rate (%)</label>
                    <input type="number" step="0.01" value={loanForm.interest_rate || ""} onChange={e => setLoanForm({ ...loanForm, interest_rate: parseFloat(e.target.value) || 0 })} style={inputStyle("100%")} />
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select value={loanForm.status} onChange={e => setLoanForm({ ...loanForm, status: e.target.value as CreditLoanStatus })} style={selectStyle("100%")}>
                      {ALL_LOAN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Due Date</label>
                    <input type="date" value={loanForm.due_date} onChange={e => setLoanForm({ ...loanForm, due_date: e.target.value })} style={inputStyle("100%")} />
                  </div>
                  <div>
                    <label style={labelStyle}>Lender</label>
                    <input value={loanForm.lender || ""} onChange={e => setLoanForm({ ...loanForm, lender: e.target.value })} style={inputStyle("100%")} placeholder="Bank, Person..." />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Notes</label>
                    <input value={loanForm.notes || ""} onChange={e => setLoanForm({ ...loanForm, notes: e.target.value })} style={inputStyle("100%")} placeholder="Optional notes..." />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
                  <button onClick={cancelLoanForm} style={btnStyle(T.gray, "transparent", T.jet)}>Cancel</button>
                  <button onClick={handleSaveLoan} disabled={loanSaving} style={btnStyle(T.surface, T.gold, T.gold)}>{loanSaving ? "Saving..." : editLoanId ? "Update" : "Create"}</button>
                </div>
              </div>
            )}

            {/* List */}
            {loansLoading ? <LoadingSpinner /> : loans.length === 0 ? <EmptyState text="No credits or loans yet" /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {loans.map(l => {
                  const progress = l.total_amount > 0 ? ((l.total_amount - l.remaining_amount) / l.total_amount) * 100 : 0;
                  return (
                    <div key={l.id} style={{ background: T.surface, borderRadius: T.radius, padding: "16px 20px", border: `1px solid ${T.jet}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: T.white1 }}>{l.name}</span>
                            <span style={{ ...badgeStyle(loanStatusConfig[l.status].bg, loanStatusConfig[l.status].color) }}>
                              {loanStatusConfig[l.status].icon} {l.status}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 8 }}>
                            <div>
                              <div style={{ fontSize: 11, color: T.grayDim }}>Remaining</div>
                              <div style={{ fontSize: 18, fontWeight: 600, color: "#f87171" }}>₱{l.remaining_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span style={{ fontSize: 11, color: T.grayDim, fontWeight: 400 }}>{l.currency}</span></div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: T.grayDim }}>Monthly</div>
                              <div style={{ fontSize: 18, fontWeight: 600, color: T.gold }}>₱{l.monthly_payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                            {l.interest_rate > 0 && (
                              <div>
                                <div style={{ fontSize: 11, color: T.grayDim }}>Interest</div>
                                <div style={{ fontSize: 18, fontWeight: 600, color: "#fbbf24" }}>{l.interest_rate}%</div>
                              </div>
                            )}
                          </div>
                          {/* Progress bar */}
                          {l.total_amount > 0 && (
                            <div style={{ marginBottom: 6 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.grayDim, marginBottom: 4 }}>
                                <span>Paid: ₱{(l.total_amount - l.remaining_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <span>of ₱{l.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div style={{ height: 6, borderRadius: 3, background: T.surface2, overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(to right, ${T.gold}, ${T.goldDim})`, width: `${Math.min(progress, 100)}%`, transition: "width 0.5s ease" }} />
                              </div>
                              <div style={{ fontSize: 11, color: T.gold, marginTop: 2, textAlign: "right" }}>{progress.toFixed(1)}%</div>
                            </div>
                          )}
                          {l.lender && <div style={{ fontSize: 12, color: T.grayDim }}>Lender: {l.lender}</div>}
                          {l.due_date && <div style={{ fontSize: 12, color: T.grayDim }}>Due: {l.due_date}</div>}
                          {l.notes && <div style={{ fontSize: 12, color: T.gray70, marginTop: 4 }}>{l.notes}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openEditLoan(l)} style={iconBtnStyle(T.gold)} title="Edit">✏️</button>
                          {deleteLoanConfirm === l.id ? (
                            <>
                              <button onClick={() => handleDeleteLoan(l.id!)} style={iconBtnStyle("#f87171")} title="Confirm">✓</button>
                              <button onClick={() => setDeleteLoanConfirm(null)} style={iconBtnStyle(T.grayDim)} title="Cancel">✕</button>
                            </>
                          ) : (
                            <button onClick={() => setDeleteLoanConfirm(l.id!)} style={iconBtnStyle("#f87171")} title="Delete">🗑️</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ================================================================
           DAILY EXPENSES TAB
           ================================================================ */}
        {tab === "expenses" && (
          <>
            {/* Month picker & Stats */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <label style={{ fontSize: 13, color: T.grayDim }}>Month:</label>
              <input type="month" value={expDateFilter} onChange={e => setExpDateFilter(e.target.value)} style={{ ...inputStyle(), padding: "8px 12px" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Month Total", value: `₱${expStats.monthTotal.toFixed(2)}`, color: T.gold },
                { label: "Transactions", value: expStats.count, color: T.gray },
              ].map(s => (
                <div key={s.label} style={{ background: T.surface, borderRadius: T.radius, padding: "14px 16px", border: `1px solid ${T.jet}` }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: T.grayDim, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            {expStats.byCategory.length > 0 && (
              <div style={{ background: T.surface, borderRadius: T.radius, padding: "16px 20px", border: `1px solid ${T.jet}`, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.gray, marginBottom: 12 }}>Breakdown by Category</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {expStats.byCategory.map(cat => {
                    const pct = expStats.monthTotal > 0 ? (cat.total / expStats.monthTotal) * 100 : 0;
                    const cfg = categoryConfig[cat.category];
                    return (
                      <div key={cat.category} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{cfg.icon}</span>
                        <span style={{ fontSize: 12, color: T.gray, width: 100 }}>{cat.category}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: T.surface2, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 4, background: cfg.color, width: `${pct}%`, transition: "width 0.3s ease" }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color, minWidth: 70, textAlign: "right" }}>₱{cat.total.toFixed(2)}</span>
                        <span style={{ fontSize: 11, color: T.grayDim, minWidth: 30, textAlign: "right" }}>({cat.count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---- Monthly Expenses Chart ---- */}
            <MonthlyExpensesChart data={monthlyChartData} selectedMonth={expDateFilter} onSelectMonth={setExpDateFilter} />

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={openCreateExp} style={btnStyle(T.gold, "transparent", T.gold)}>+ New Expense</button>
            </div>

            {expensesError && <ErrorBanner message={expensesError} onDismiss={() => setExpensesError(null)} />}

            {/* Form */}
            {showExpForm && (
              <div ref={expFormRef} style={formContainerStyle}>
                <h3 style={formTitleStyle}>{editExpId ? "Edit Expense" : "New Expense"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Description *</label>
                    <input value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} style={inputStyle("100%")} placeholder="Coffee, Lunch, Uber..." />
                  </div>
                  <div>
                    <label style={labelStyle}>Amount *</label>
                    <input type="number" step="0.01" value={expForm.amount || ""} onChange={e => setExpForm({ ...expForm, amount: parseFloat(e.target.value) || 0 })} style={inputStyle("100%")} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select value={expForm.currency} onChange={e => setExpForm({ ...expForm, currency: e.target.value })} style={selectStyle("100%")}>
                      {["PHP", "AUD", "USD", "EUR", "GBP"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value as ExpenseCategory })} style={selectStyle("100%")}>
                      {ALL_EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{categoryConfig[c].icon} {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" value={expForm.expense_date} onChange={e => setExpForm({ ...expForm, expense_date: e.target.value })} style={inputStyle("100%")} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Notes</label>
                    <input value={expForm.notes || ""} onChange={e => setExpForm({ ...expForm, notes: e.target.value })} style={inputStyle("100%")} placeholder="Optional notes..." />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
                  <button onClick={cancelExpForm} style={btnStyle(T.gray, "transparent", T.jet)}>Cancel</button>
                  <button onClick={handleSaveExp} disabled={expSaving} style={btnStyle(T.surface, T.gold, T.gold)}>{expSaving ? "Saving..." : editExpId ? "Update" : "Create"}</button>
                </div>
              </div>
            )}

            {/* List */}
            {expensesLoading ? <LoadingSpinner /> : filteredExpenses.length === 0 ? <EmptyState text="No expenses for this month" /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredExpenses.map(e => {
                  const cfg = categoryConfig[e.category];
                  return (
                    <div key={e.id} style={{ background: T.surface, borderRadius: T.radius, padding: "14px 18px", border: `1px solid ${T.jet}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 200 }}>
                          <span style={{ fontSize: 24, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: `${cfg.color}15`, borderRadius: 10 }}>{cfg.icon}</span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: T.white1 }}>{e.description}</div>
                            <div style={{ fontSize: 11, color: T.grayDim, display: "flex", gap: 8, marginTop: 2 }}>
                              <span>{e.expense_date}</span>
                              <span style={{ ...badgeStyle(`${cfg.color}18`, cfg.color), padding: "1px 8px", fontSize: 10 }}>{e.category}</span>
                            </div>
                            {e.notes && <div style={{ fontSize: 11, color: T.gray70, marginTop: 2 }}>{e.notes}</div>}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 16, fontWeight: 600, color: cfg.color }}>₱{e.amount.toFixed(2)} <span style={{ fontSize: 10, color: T.grayDim, fontWeight: 400 }}>{e.currency}</span></span>
                          <button onClick={() => openEditExp(e)} style={iconBtnStyle(T.gold)} title="Edit">✏️</button>
                          {deleteExpConfirm === e.id ? (
                            <>
                              <button onClick={() => handleDeleteExp(e.id!)} style={iconBtnStyle("#f87171")} title="Confirm">✓</button>
                              <button onClick={() => setDeleteExpConfirm(null)} style={iconBtnStyle(T.grayDim)} title="Cancel">✕</button>
                            </>
                          ) : (
                            <button onClick={() => setDeleteExpConfirm(e.id!)} style={iconBtnStyle("#f87171")} title="Delete">🗑️</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

/* ============================================================
   MONTHLY EXPENSES CHART (pure SVG)
   ============================================================ */

function MonthlyExpensesChart({ data, selectedMonth, onSelectMonth }: {
  data: { key: string; label: string; short: string; total: number }[];
  selectedMonth: string;
  onSelectMonth: (m: string) => void;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const chartH = 180;
  const barGap = 6;
  const labelH = 36;
  const topPad = 24;
  const totalH = chartH + labelH + topPad;

  // responsive bar width: chart takes full container
  const barCount = data.length;

  return (
    <div style={{ background: T.surface, borderRadius: T.radius, padding: "20px 16px 16px", border: `1px solid ${T.jet}`, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.gray }}>📊 Monthly Expenses</div>
        <div style={{ fontSize: 11, color: T.grayDim }}>Last 12 months</div>
      </div>

      {/* Y-axis labels + SVG chart */}
      <div style={{ display: "flex", gap: 0 }}>
        {/* Y-axis */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: chartH, paddingTop: topPad, paddingBottom: 0, marginRight: 6, flexShrink: 0 }}>
          {[maxVal, maxVal * 0.5, 0].map((v, i) => (
            <span key={i} style={{ fontSize: 9, color: T.grayDim, textAlign: "right", minWidth: 36, lineHeight: "1" }}>
              {v >= 1000 ? `₱${(v / 1000).toFixed(1)}k` : `₱${v.toFixed(0)}`}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ flex: 1, position: "relative" }}>
          <svg width="100%" height={totalH} viewBox={`0 0 ${barCount * 50} ${totalH}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
              <line key={i} x1="0" y1={topPad + chartH * (1 - pct)} x2={barCount * 50} y2={topPad + chartH * (1 - pct)}
                stroke={T.jet} strokeWidth="1" strokeDasharray={pct === 0 ? "0" : "3,3"} />
            ))}

            {/* Bars */}
            {data.map((d, i) => {
              const barW = 50 - barGap * 2;
              const barH = maxVal > 0 ? (d.total / maxVal) * chartH : 0;
              const x = i * 50 + barGap;
              const y = topPad + chartH - barH;
              const isSelected = d.key === selectedMonth;
              const isHovered = hoveredIdx === i;
              const hasValue = d.total > 0;

              return (
                <g key={d.key}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onSelectMonth(d.key)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Hover/select highlight background */}
                  {(isHovered || isSelected) && (
                    <rect x={i * 50} y={topPad} width={50} height={chartH}
                      fill={isSelected ? "hsla(45,100%,72%,0.04)" : "hsla(0,0%,100%,0.02)"}
                      rx={4}
                    />
                  )}

                  {/* Bar */}
                  {hasValue ? (
                    <rect x={x + 4} y={y} width={barW - 8} height={barH} rx={4}
                      fill={isSelected ? "url(#goldGrad)" : isHovered ? "hsla(45,100%,72%,0.5)" : "hsla(45,100%,72%,0.25)"}
                    />
                  ) : (
                    <rect x={x + 4} y={topPad + chartH - 2} width={barW - 8} height={2} rx={1}
                      fill={T.jet}
                    />
                  )}

                  {/* Tooltip on hover */}
                  {isHovered && hasValue && (
                    <g>
                      <rect x={x - 10} y={y - 26} width={barW + 12} height={20} rx={5}
                        fill={T.card} stroke={T.jet} strokeWidth="1" />
                      <text x={x + (barW - 8) / 2 + 4} y={y - 12} textAnchor="middle"
                        fill={T.gold} fontSize="9" fontFamily={T.font} fontWeight="600">
                        ₱{d.total.toFixed(0)}
                      </text>
                    </g>
                  )}

                  {/* Month label */}
                  <text x={i * 50 + 25} y={topPad + chartH + 16} textAnchor="middle"
                    fill={isSelected ? T.gold : T.grayDim} fontSize="8" fontFamily={T.font} fontWeight={isSelected ? "600" : "400"}>
                    {d.short}
                  </text>

                  {/* Selected dot */}
                  {isSelected && (
                    <circle cx={i * 50 + 25} cy={topPad + chartH + 28} r={2.5} fill={T.gold} />
                  )}
                </g>
              );
            })}

            {/* Gold gradient def */}
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(45,100%,72%)" />
                <stop offset="100%" stopColor="hsl(45,54%,58%)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Average line */}
      {(() => {
        const nonZero = data.filter(d => d.total > 0);
        if (nonZero.length < 2) return null;
        const avg = nonZero.reduce((s, d) => s + d.total, 0) / nonZero.length;
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.jet}` }}>
            <div style={{ width: 20, height: 1, background: T.goldDim, opacity: 0.6 }} />
            <span style={{ fontSize: 11, color: T.grayDim }}>Avg: <span style={{ color: T.goldDim, fontWeight: 600 }}>₱{avg.toFixed(2)}</span>/month</span>
          </div>
        );
      })()}
    </div>
  );
}

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: T.radius, padding: "12px 16px", marginBottom: 16, color: "#f87171", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>{message}</span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}>✕</button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: "center", padding: 40, color: T.grayDim, fontSize: 13 }}>Loading...</div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: T.grayDim, fontSize: 14, background: T.surface, borderRadius: T.radius, border: `1px solid ${T.jet}` }}>
      {text}
    </div>
  );
}

/* ============================================================
   STYLE HELPERS
   ============================================================ */

function btnStyle(color: string, bg: string, border: string, pad = 12): React.CSSProperties {
  return {
    padding: `8px ${pad}px`, background: bg, color, border: `1px solid ${border}`,
    borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500,
    fontFamily: T.font, transition: T.transition, whiteSpace: "nowrap",
  };
}

function iconBtnStyle(color: string): React.CSSProperties {
  return {
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: `1px solid ${T.jet}`, borderRadius: 8,
    color, cursor: "pointer", fontSize: 14, transition: T.transition, padding: 0,
  };
}

function inputStyle(width?: string): React.CSSProperties {
  return {
    flex: width === "1" ? 1 : undefined, width: width && width !== "1" ? width : undefined,
    padding: "10px 14px", background: T.surface2, border: `1px solid ${T.jet}`,
    borderRadius: 10, color: T.white2, fontSize: 13, fontFamily: T.font,
    outline: "none", boxSizing: "border-box",
  };
}

function selectStyle(width?: string): React.CSSProperties {
  return {
    ...inputStyle(width), cursor: "pointer", minWidth: width ? undefined : 140,
  };
}

function badgeStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
    background: bg, color, display: "inline-block",
  };
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 500, color: T.gray70,
  marginBottom: 6, fontFamily: T.font,
};

const formContainerStyle: React.CSSProperties = {
  background: T.surface, borderRadius: T.radius, padding: "24px 20px",
  border: `1px solid ${T.jet}`, marginBottom: 20, boxShadow: T.shadow,
};

const formTitleStyle: React.CSSProperties = {
  fontSize: 16, fontWeight: 600, color: T.white1, margin: "0 0 16px 0",
};