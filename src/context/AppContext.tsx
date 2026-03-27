// @ts-nocheck
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Member, Payment, Package } from "../types";
export interface AppContextType {
  members: Member[];
  packages: Package[];
  payments: Payment[];
  staff: any[];
  isLoading: boolean;

  addMember: (data: any) => Promise<void>;
  updateMember: (id: string, data: any) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  getMemberById: (id: string) => Member | undefined;
  getMembersWithPending: () => Member[];

  addPackage: (data: any) => Promise<void>;
  updatePackage: (id: string, data: any) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  getPackageById: (id: string) => Package | undefined;

  addPayment: (data: any) => Promise<void>;
  getPaymentsByMember: (id: string) => Payment[];

  addStaff: (data: any) => Promise<void>;
  updateStaff: (id: string, data: any) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;

  getDashboardStats: () => any;
}
const API_URL = "https://gym-api.fitnessfreaks.workers.dev";
const AppContext = createContext<AppContextType>({} as AppContextType);

// Helper: Calculate Membership Status
const calculateStatus = (start, duration) => {
  if (!start || !duration) return { status: "no-package", expiryDate: null, daysRemaining: null };
  
  const s = new Date(start);
  const e = new Date(s);
  e.setDate(e.getDate() + Number(duration));
  
  const today = new Date();
  today.setHours(0,0,0,0);
  e.setHours(0,0,0,0);
  
  const diff = e.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  return {
    status: days >= 0 ? "active" : "expired",
    expiryDate: e.toISOString().split("T")[0],
    daysRemaining: days > 0 ? days : 0
  };
};

export const AppProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

 // --- LOAD DATA FROM CLOUDFLARE ---
const loadData = useCallback(async () => {
  try {

    const [mRes, pRes] = await Promise.all([
      fetch(`${API_URL}/members`),
      fetch(`${API_URL}/packages`)
    ]);

    if (!mRes.ok || !pRes.ok)
      throw new Error("Failed to fetch");

    const membersData = await mRes.json();
    const packagesData = await pRes.json();

    // FIX MEMBERS
    setMembers(
      membersData.map((m) => ({
        ...m,
        packageId: m.package_id ?? m.packageId,
        packagePrice: Number(
          m.package_price ?? m.packagePrice ?? 0
        ),
        totalAmount: Number(
          m.total_amount ?? m.totalAmount ?? 0
        ),
        paidAmount: Number(
          m.paid_amount ?? m.paidAmount ?? 0
        ),
        packageStartDate:
          m.package_start_date ??
          m.packageStartDate,
      }))
    );

    // FIX PACKAGES
    setPackages(
      packagesData.map((p) => ({
        ...p,
        durationDays: Number(
          p.duration_days ?? p.durationDays ?? 0
        ),
        basePrice: Number(
          p.base_price ?? p.basePrice ?? 0
        ),
      }))
    );

  } catch (err) {
    console.error("Load Error:", err);
  } finally {
    setIsLoading(false);
  }
}, []);

useEffect(() => {
  loadData();
}, [loadData]);

  // --- MEMBERS ---
  const addMember = async (data) => {
    try {
      await fetch(`${API_URL}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      await loadData();
    } catch (e) { alert("Error adding member"); }
  };

  const updateMember = async (id, data) => {
    try {
      await fetch(`${API_URL}/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      await loadData();
    } catch (e) { alert("Error updating member"); }
  };

  const deleteMember = async (id) => {
    if(!window.confirm("Delete this member?")) return;
    try {
      await fetch(`${API_URL}/members/${id}`, { method: "DELETE" });
      await loadData();
    } catch (e) { alert("Error deleting member"); }
  };

  const getMemberById = (id) => members.find(m => m.id === id);

  // ✅ FIXED: Robust handling of snake_case vs camelCase to prevent NaN
  const getMembersWithPending = () => {
    return members.map(m => {
      // 1. Find Package (Check both ID formats)
      const pkg = packages.find(p => p.id === (m.package_id || m.packageId));
      
      // 2. Get Duration (Check both formats)
      const dur = pkg ? (pkg.duration_days || pkg.durationDays) : null;
      
      // 3. Get Start Date (Check both formats)
      const start = m.package_start_date || m.packageStartDate;
      
      const status = calculateStatus(start, dur);
      
      // 4. SAFE MATH: Explicitly extract values, default to 0 if missing
      // We check snake_case first (from DB), then camelCase (from JS objects)
      let totalVal = m.total_amount;
      if (totalVal === undefined || totalVal === null) totalVal = m.totalAmount;
      if (totalVal === undefined || totalVal === null) totalVal = 0;
      
      let paidVal = m.paid_amount;
      if (paidVal === undefined || paidVal === null) paidVal = m.paidAmount;
      if (paidVal === undefined || paidVal === null) paidVal = 0;

      // Force conversion to Number to handle string inputs like "1000"
      const totalNum = Number(totalVal);
      const paidNum = Number(paidVal);

      // Calculate pending. If result is NaN, force to 0.
      let pending = totalNum - paidNum;
      if (isNaN(pending)) pending = 0;

      return {
        ...m,
        pendingAmount: pending, // Guaranteed to be a valid number
        packageName: pkg ? (pkg.name || "Unknown") : "No Package",
        membershipStatus: status.status,
        daysRemaining: status.daysRemaining,
        packageExpiryDate: status.expiryDate
      };
    });
  };

  // --- PACKAGES ---
  const addPackage = async (data: any) => {
  console.log("ADD PACKAGE DATA:", data);

  try {
    await fetch(`${API_URL}/packages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        durationDays: Number(data.durationDays),
        basePrice: Number(data.basePrice),
      }),
    });

    await loadData();
  } catch (e) {
    console.error("Add package error", e);
    alert("Error adding package");
  }
};
  const deletePackage = async (id) => {
    if(!window.confirm("Delete this package?")) return;
    try {
      await fetch(`${API_URL}/packages/${id}`, { method: "DELETE" });
      await loadData();
    } catch (e) { alert("Error deleting package"); }
  };

  const getPackageById = (id) => packages.find(p => p.id === id);

  // --- PAYMENTS ---
  const addPayment = async (data) => {
    try {
      await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      await loadData();
    } catch (e) { alert("Error adding payment"); }
  };

  const getPaymentsByMember = (id) => payments.filter(p => (p.member_id || p.memberId) === id);

  // --- STAFF ---
  const addStaff = async (data) => {
    try {
      await fetch(`${API_URL}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      alert("Staff added!");
    } catch (e) { alert("Error adding staff"); }
  };
  
  const updateStaff = async (id, data) => { /* Placeholder */ };
  const deleteStaff = async (id) => { /* Placeholder */ };

  // --- DASHBOARD ---
  const getDashboardStats = () => {
    const list = getMembersWithPending();
    const active = list.filter(m => m.membershipStatus === "active").length;
    const expired = list.filter(m => m.membershipStatus === "expired").length;
    const pendingList = list.filter(m => m.pendingAmount > 0);
    
    // Safe reduction
    const totalPending = pendingList.reduce((sum, m) => sum + (m.pendingAmount || 0), 0);
    
    const totalCollected = members.reduce((sum, m) => {
      let val = m.paid_amount;
      if (val === undefined || val === null) val = m.paidAmount;
      if (val === undefined || val === null) val = 0;
      return sum + Number(val);
    }, 0);

    return {
      totalMembers: members.length,
      activeMembers: active,
      expiredMembers: expired,
      pendingPaymentsCount: pendingList.length,
      totalPendingAmount: totalPending,
      totalCollected: totalCollected
    };
  };

  const value = {
    members, packages, payments, staff, isLoading,
    addMember, updateMember, deleteMember, getMemberById, getMembersWithPending,
    addPackage, updatePackage, deletePackage, getPackageById,
    addPayment, getPaymentsByMember,
    addStaff, updateStaff, deleteStaff,
    getDashboardStats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) {
  console.error("AppContext is undefined");
  return ctx as AppContextType;
}}