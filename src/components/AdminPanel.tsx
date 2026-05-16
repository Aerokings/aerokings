"use client";
import React, { useState, useRef } from "react";
import { Plus, Trash2, Edit, Save, X, Upload, Globe, User, Briefcase, MapPin, Heart, ChevronDown, ChevronUp, Search, Camera, Image, BarChart3 } from "lucide-react";
import { Maid } from "@/types";
import { NATIONALITIES, CATEGORIES, EMIRATES, RELIGIONS, getStatusBadgeClass, getLocationLabel, formatSalary, getCategoryColor, getCategoryIcon } from "@/utils/helpers";
import { supabase, getPhotoUrl } from "@/lib/supabase";
import { Analytics } from "@/components/Analytics";

interface AdminPanelProps {
  maids: Maid[];
  onRefresh: () => void;
}

interface FormData {
  name: string; nationality: string; age: string; experience_years: string;
  bio: string; location_type: string; status: string; monthly_salary: string; salary: string;
  languages: string; religion: string; marital_status: string; skills: string;
  category: string; weight: string; height: string; experience_breakdown: string;
  cooking_skills: string; available_emirates: string; passport_number: string;
}

const emptyForm: FormData = {
  name: "", nationality: "", age: "", experience_years: "0",
  bio: "", location_type: "inside", status: "available",
  monthly_salary: "", salary: "", languages: "", religion: "", marital_status: "", skills: "",
  category: "Cleaner", weight: "", height: "", experience_breakdown: "", cooking_skills: "",
  available_emirates: "", passport_number: ""
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ maids, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<"maids" | "analytics">("maids");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [quickUploadMaidId, setQuickUploadMaidId] = useState<number | null>(null);

  const filteredMaids = maids.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const uploadPhoto = async (file: File, maidId: number): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `maid_${maidId}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("maid-photos").upload(filename, file, { upsert: true });
    if (error) throw error;
    return filename;
  };

  const handleQuickPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickUploadMaidId) return;
    const maidId = quickUploadMaidId;
    setUploadingPhoto(maidId);
    try {
      const path = await uploadPhoto(file, maidId);
      await supabase.from("maids").update({ photo_filename: path }).eq("id", maidId);
      onRefresh();
    } catch (err) {
      console.error("Quick photo upload failed:", err);
    } finally {
      setUploadingPhoto(null);
      setQuickUploadMaidId(null);
    }
    e.target.value = "";
  };

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setPhotoPreview(null);
    setPhotoFile(null);
    setShowForm(true);
  };

  const openEdit = (maid: Maid) => {
    setForm({
      name: maid.name, nationality: maid.nationality, age: maid.age?.toString() || "",
      experience_years: maid.experience_years.toString(), bio: maid.bio || "",
      location_type: maid.location_type, status: maid.status,
      monthly_salary: maid.monthly_salary?.toString() || "", salary: (maid as any).salary?.toString() || "", languages: maid.languages || "",
      religion: maid.religion || "", marital_status: maid.marital_status || "",
      skills: maid.skills || "", category: maid.category || "Cleaner",
      weight: maid.weight || "", height: maid.height || "",
      experience_breakdown: maid.experience_breakdown || "",
      cooking_skills: maid.cooking_skills || "", available_emirates: maid.available_emirates || "",
      passport_number: maid.passport_number || ""
    });
    setEditingId(maid.id);
    setPhotoFile(null);
    setPhotoPreview(maid.photo_filename ? getPhotoUrl(maid.photo_filename) : null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.nationality) return;
    setSaving(true);
    try {
      const record = {
        name: form.name, nationality: form.nationality,
        age: form.age ? parseInt(form.age) : null,
        experience_years: parseInt(form.experience_years) || 0,
        bio: form.bio || null, location_type: form.location_type,
        status: form.status, monthly_salary: form.monthly_salary ? parseFloat(form.monthly_salary) : null, salary: form.salary ? parseFloat(form.salary) : null,
        languages: form.languages || null, religion: form.religion || null,
        marital_status: form.marital_status || null, skills: form.skills || null,
        category: form.category, weight: form.weight || null, height: form.height || null,
        experience_breakdown: form.experience_breakdown || null,
        cooking_skills: form.cooking_skills || null, available_emirates: form.available_emirates || null,
        passport_number: form.passport_number || null,
      };

      if (editingId) {
        const { error } = await supabase.from("maids").update(record).eq("id", editingId);
        if (error) throw error;
        if (photoFile) {
          const path = await uploadPhoto(photoFile, editingId);
          await supabase.from("maids").update({ photo_filename: path }).eq("id", editingId);
        }
      } else {
        const { data, error } = await supabase.from("maids").insert(record).select("id").single();
        if (error) throw error;
        if (photoFile && data) {
          const path = await uploadPhoto(photoFile, data.id);
          await supabase.from("maids").update({ photo_filename: path }).eq("id", data.id);
        }
      }
      setShowForm(false);
      setEditingId(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to save maid:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      console.log("Deleting maid ID:", id);
      const { error } = await supabase.from("maids").delete().eq("id", id);
      if (error) {
        console.error("Delete error:", error);
        alert("Failed to delete: " + error.message);
        return;
      }
      console.log("Delete successful, refreshing...");
      setDeleteConfirm(null);
      // Add a small delay to ensure database catches up
      setTimeout(() => onRefresh(), 500);
    } catch (err) {
      console.error("Failed to delete maid:", err);
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const triggerQuickUpload = (maidId: number) => {
    setQuickUploadMaidId(maidId);
    setTimeout(() => quickFileInputRef.current?.click(), 50);
  };

  const updateField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleEmirate = (emirate: string) => {
    const current = form.available_emirates ? form.available_emirates.split(", ").filter(Boolean) : [];
    const updated = current.includes(emirate) ? current.filter(e => e !== emirate) : [...current, emirate];
    updateField("available_emirates", updated.join(", "));
  };

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="col-span-2 flex items-center gap-2 mt-2 mb-1 border-b border-base-300 pb-1">
      {icon}
      <span className="font-semibold text-sm text-primary">{title}</span>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Briefcase size={20} /> Admin Panel
        </h2>
      </div>

      <div className="tabs tabs-bordered mb-4">
        <button
          className={`tab ${activeTab === "maids" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("maids")}
        >
          <Briefcase size={16} className="mr-2" /> Manage Maids ({maids.length})
        </button>
        <button
          className={`tab ${activeTab === "analytics" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <BarChart3 size={16} className="mr-2" /> Analytics
        </button>
      </div>

      {activeTab === "maids" && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Manage Housemaids
              <span className="badge badge-primary badge-sm">{maids.length}</span>
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input className="input input-bordered input-sm pl-8 w-full sm:w-56" placeholder="Search maids..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14} /> Add New</button>
            </div>
          </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-base-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                {editingId ? <><Edit size={18} /> Edit Housemaid</> : <><Plus size={18} /> Add New Housemaid</>}
              </h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>

            {/* Photo Upload */}
            <div className="mb-4 p-4 bg-base-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Camera size={16} className="text-primary" />
                <span className="font-semibold text-sm text-primary">Maid Photo</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-xl bg-base-300 overflow-hidden flex items-center justify-center border-2 border-dashed border-base-content/20 flex-shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-base-content/30">
                      <Image size={32} className="mx-auto" />
                      <span className="text-xs mt-1 block">No photo</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" className="btn btn-outline btn-sm gap-1" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={14} /> {photoPreview ? "Change Photo" : "Upload Photo"}
                  </button>
                  {photoPreview && (
                    <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
                  <span className="text-xs text-base-content/40">JPG, PNG or WebP. Max 5MB.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SectionHeader icon={<User size={16} className="text-primary" />} title="Personal Information" />
              <div className="col-span-2">
                <label className="label"><span className="label-text text-xs font-medium">Full Name *</span></label>
                <input className="input input-bordered input-sm w-full" value={form.name}
                  onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Maria Santos" />
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Passport Number</span></label>
                <input className="input input-bordered input-sm w-full" value={form.passport_number}
                  onChange={(e) => updateField("passport_number", e.target.value)} placeholder="e.g. AB1234567" />
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Nationality *</span></label>
                <select className="select select-bordered select-sm w-full" value={form.nationality}
                  onChange={(e) => updateField("nationality", e.target.value)}>
                  <option value="">Select nationality...</option>
                  {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Age</span></label>
                <input type="number" className="input input-bordered input-sm w-full" value={form.age}
                  onChange={(e) => updateField("age", e.target.value)} placeholder="e.g. 28" min="18" max="65" />
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Height</span></label>
                <input className="input input-bordered input-sm w-full" value={form.height}
                  onChange={(e) => updateField("height", e.target.value)} placeholder="e.g. 160 cm" />
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Weight</span></label>
                <input className="input input-bordered input-sm w-full" value={form.weight}
                  onChange={(e) => updateField("weight", e.target.value)} placeholder="e.g. 55 kg" />
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Religion</span></label>
                <select className="select select-bordered select-sm w-full" value={form.religion}
                  onChange={(e) => updateField("religion", e.target.value)}>
                  <option value="">Select religion...</option>
                  {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Marital Status</span></label>
                <select className="select select-bordered select-sm w-full" value={form.marital_status}
                  onChange={(e) => updateField("marital_status", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label"><span className="label-text text-xs font-medium">Languages Known</span></label>
                <input className="input input-bordered input-sm w-full" value={form.languages}
                  onChange={(e) => updateField("languages", e.target.value)} placeholder="e.g. English, Arabic, Hindi" />
              </div>

              <SectionHeader icon={<Briefcase size={16} className="text-primary" />} title="Job Details" />
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Job Role / Category *</span></label>
                <select className="select select-bordered select-sm w-full" value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{getCategoryIcon(c)} {c}</option>)}
                </select>
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Total Experience (years)</span></label>
                <input type="number" className="input input-bordered input-sm w-full" value={form.experience_years}
                  onChange={(e) => updateField("experience_years", e.target.value)} min="0" max="30" />
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Rate / Tadbeer Fee (AED)</span></label>
                <input type="number" className="input input-bordered input-sm w-full" value={form.monthly_salary}
                  onChange={(e) => updateField("monthly_salary", e.target.value)} placeholder="e.g. 8000" />
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Maid Salary (AED/month)</span></label>
                <input type="number" className="input input-bordered input-sm w-full" value={form.salary}
                  onChange={(e) => updateField("salary", e.target.value)} placeholder="e.g. 1500" />
              </div>
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Status</span></label>
                <select className="select select-bordered select-sm w-full" value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}>
                  <option value="available">✅ Available</option>
                  <option value="booked">🔒 Booked</option>
                  <option value="inactive">❌ Inactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label"><span className="label-text text-xs font-medium">Experience Breakdown</span></label>
                <input className="input input-bordered input-sm w-full" value={form.experience_breakdown}
                  onChange={(e) => updateField("experience_breakdown", e.target.value)}
                  placeholder="e.g. UAE:3 years, Saudi Arabia:2 years" />
              </div>
              <div className="col-span-2">
                <label className="label"><span className="label-text text-xs font-medium">General Skills</span></label>
                <input className="input input-bordered input-sm w-full" value={form.skills}
                  onChange={(e) => updateField("skills", e.target.value)}
                  placeholder="e.g. Cooking, Cleaning, Baby Care" />
              </div>
              {form.category === "Cook" && (
                <div className="col-span-2">
                  <label className="label"><span className="label-text text-xs font-medium">🍳 Cooking Varieties</span></label>
                  <input className="input input-bordered input-sm w-full" value={form.cooking_skills}
                    onChange={(e) => updateField("cooking_skills", e.target.value)}
                    placeholder="e.g. Arabic Food, Indian Food, Baking" />
                </div>
              )}

              <SectionHeader icon={<MapPin size={16} className="text-primary" />} title="Location & Availability" />
              <div>
                <label className="label"><span className="label-text text-xs font-medium">Current Location</span></label>
                <select className="select select-bordered select-sm w-full" value={form.location_type}
                  onChange={(e) => updateField("location_type", e.target.value)}>
                  <option value="inside">🇦🇪 Inside UAE</option>
                  <option value="outside">✈️ Outside UAE</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label"><span className="label-text text-xs font-medium">Available in Which Emirates</span></label>
                <div className="flex flex-wrap gap-2 p-3 bg-base-200 rounded-lg">
                  {EMIRATES.map((emirate) => {
                    const selected = form.available_emirates?.split(", ").includes(emirate);
                    return (
                      <button key={emirate} type="button"
                        className={`badge badge-lg cursor-pointer transition-all ${selected ? "badge-primary" : "badge-ghost border-base-300"}`}
                        onClick={() => toggleEmirate(emirate)}>
                        {selected ? "✓ " : ""}{emirate}
                      </button>
                    );
                  })}
                </div>
              </div>

              <SectionHeader icon={<Heart size={16} className="text-primary" />} title="Bio & Additional Notes" />
              <div className="col-span-2">
                <label className="label"><span className="label-text text-xs font-medium">Bio / Description</span></label>
                <textarea className="textarea textarea-bordered w-full text-sm" rows={3} value={form.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Brief description of the housemaid..." />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-base-300">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm gap-1" onClick={handleSave}
                disabled={saving || !form.name || !form.nationality}>
                {saving ? <span className="loading loading-spinner loading-xs" /> : <Save size={14} />}
                {editingId ? "Update Maid" : "Add Maid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredMaids.length === 0 ? (
        <div className="text-center py-12 text-base-content/40">
          {maids.length === 0 ? (
            <><Plus size={48} className="mx-auto mb-3" /><p className="text-lg">No housemaids added yet</p><p className="text-sm">Click &quot;Add New&quot; to get started</p></>
          ) : (
            <><Search size={48} className="mx-auto mb-3" /><p className="text-lg">No results found</p><p className="text-sm">Try a different search term</p></>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200">
                <th>ID</th><th>Photo</th><th>Name</th><th>Role</th><th>Nationality</th>
                <th>Age</th><th>Exp</th><th>Location</th><th>Rate</th><th>Status</th><th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaids.map((maid) => (
                <React.Fragment key={maid.id}>
                  <tr className="hover cursor-pointer" onClick={() => setExpandedRow(expandedRow === maid.id ? null : maid.id)}>
                    <td className="font-mono text-xs">{maid.id}</td>
                    <td>
                      {uploadingPhoto === maid.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : maid.photo_filename ? (
                        <div className="flex items-center gap-1">
                          <span className="badge badge-success badge-xs">✓ Photo</span>
                          <button className="btn btn-ghost btn-xs" onClick={(e) => { e.stopPropagation(); triggerQuickUpload(maid.id); }}>
                            <Upload size={10} />
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-outline btn-xs gap-1" onClick={(e) => { e.stopPropagation(); triggerQuickUpload(maid.id); }}>
                          <Camera size={11} /> Add
                        </button>
                      )}
                    </td>
                    <td className="font-medium">{maid.name}</td>
                    <td><span className={`badge ${getCategoryColor(maid.category)} badge-xs gap-1`}>{getCategoryIcon(maid.category)} {maid.category}</span></td>
                    <td className="text-xs">{maid.nationality}</td>
                    <td className="text-xs">{maid.age || "-"}</td>
                    <td className="text-xs">{maid.experience_years}y</td>
                    <td><span className="text-xs">{getLocationLabel(maid.location_type, maid.status)}</span></td>
                    <td className="text-xs font-medium">{formatSalary(maid.monthly_salary)}</td>
                    <td><span className={`badge ${getStatusBadgeClass(maid.status)} badge-xs`}>{maid.status}</span></td>
                    <td>
                      <div className="flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-xs tooltip" data-tip="Edit" onClick={() => openEdit(maid)}>
                          <Edit size={13} className="text-info" />
                        </button>
                        {deleteConfirm === maid.id ? (
                          <div className="flex gap-1 items-center">
                            <button className="btn btn-error btn-xs" onClick={() => handleDelete(maid.id)}>Yes</button>
                            <button className="btn btn-ghost btn-xs" onClick={() => setDeleteConfirm(null)}>No</button>
                          </div>
                        ) : (
                          <button className="btn btn-ghost btn-xs tooltip" data-tip="Delete" onClick={() => setDeleteConfirm(maid.id)}>
                            <Trash2 size={13} className="text-error" />
                          </button>
                        )}
                        <span className="text-xs opacity-30 flex items-center">
                          {expandedRow === maid.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === maid.id && (
                    <tr>
                      <td colSpan={11} className="bg-base-200/50 p-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div><span className="font-semibold text-base-content/60">Height:</span> {maid.height || "-"}</div>
                          <div><span className="font-semibold text-base-content/60">Weight:</span> {maid.weight || "-"}</div>
                          <div><span className="font-semibold text-base-content/60">Religion:</span> {maid.religion || "-"}</div>
                          <div><span className="font-semibold text-base-content/60">Marital:</span> {maid.marital_status || "-"}</div>
                          <div className="col-span-2"><span className="font-semibold text-base-content/60">Languages:</span> {maid.languages || "-"}</div>
                          <div className="col-span-2"><span className="font-semibold text-base-content/60">Skills:</span> {maid.skills || "-"}</div>
                          {maid.experience_breakdown && (
                            <div className="col-span-4"><span className="font-semibold text-base-content/60">Exp Breakdown:</span> {maid.experience_breakdown}</div>
                          )}
                          {maid.cooking_skills && (
                            <div className="col-span-4"><span className="font-semibold text-base-content/60">🍳 Cooking:</span> {maid.cooking_skills}</div>
                          )}
                          {maid.bio && (
                            <div className="col-span-4"><span className="font-semibold text-base-content/60">Bio:</span> {maid.bio}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <input ref={quickFileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleQuickPhotoSelect} />

      <div className="alert mt-4">
        <Camera size={16} />
        <div className="text-sm">
          <strong>Photo Upload:</strong> Click the 📷 button in the table or use the photo upload section when adding/editing a maid.
        </div>
      </div>
        </>
      )}

      {activeTab === "analytics" && (
        <Analytics />
      )}
    </div>
  );
};
