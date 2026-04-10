"use client";
import React, { useState } from "react";
import {
  X, MessageCircle, MapPin, Briefcase, Globe, Heart,
  BookOpen, DollarSign, Calendar, FileText, Ruler, Weight, UtensilsCrossed, Languages, CheckCircle
} from "lucide-react";
import { Maid } from "@/types";
import { getWhatsAppLink, formatSalary, formatRate, getLocationLabel, getStatusBadgeClass, getCategoryColor, getCategoryIcon } from "@/utils/helpers";
import { getPhotoUrl, supabase } from "@/lib/supabase";
import { ChatBot } from "./ChatBot";

interface MaidDetailProps {
  maid: Maid;
  onClose: () => void;
  onRefresh?: () => void;
}

export const MaidDetail: React.FC<MaidDetailProps> = ({ maid, onClose, onRefresh }) => {
  const [booking, setBooking] = useState(false);
  const [justBooked, setJustBooked] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const isBooked = maid.status === "booked" || justBooked;
  const maidRef = `AK-${String(maid.id).padStart(4, "0")}`;
  const photoUrl = getPhotoUrl(maid.photo_url);

  const handleBook = async () => {
    setBooking(true);
    try {
      const { error } = await supabase
        .from("maids")
        .update({ status: "booked" })
        .eq("id", maid.id);
      if (error) throw error;
      setJustBooked(true);
      onRefresh?.();
      setShowChat(true);
    } catch (err) {
      console.error("Booking failed:", err);
    } finally {
      setBooking(false);
    }
  };

  const expBreakdown = maid.experience_breakdown
    ? maid.experience_breakdown.split(",").map(item => {
        const parts = item.trim().split(":");
        return { country: parts[0]?.trim(), years: parts[1]?.trim() };
      })
    : [];

  const cookingList = maid.cooking_skills
    ? maid.cooking_skills.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-base-100 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
          {justBooked && (
            <div className="bg-success text-success-content p-4 text-center">
              <div className="text-2xl mb-1">🎉</div>
              <h3 className="font-bold text-lg">Thank You for Your Booking!</h3>
              <p className="text-sm text-success-content/80 mt-1">
                Reference: <span className="font-bold">{maidRef}</span>
              </p>
              <p className="text-sm text-success-content/80 mt-1">
                You have successfully selected <strong>{maid.name}</strong>. Our team will contact you within 24 hours.
              </p>
              <p className="text-xs text-success-content/60 mt-2">
                💬 Chat with our assistant below for any questions!
              </p>
            </div>
          )}

          <div className="relative h-64 bg-base-300">
            {photoUrl ? (
              <img src={photoUrl} alt={maid.name} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-base-content/30">
                <Globe size={64} />
                <span className="mt-2">No Photo</span>
              </div>
            )}
            <button className="btn btn-circle btn-sm btn-ghost absolute top-3 right-3 bg-base-100/80" onClick={onClose}>
              <X size={16} />
            </button>
            {isBooked && (
              <div className="absolute inset-0 bg-error/20 flex items-center justify-center">
                <span className="badge badge-error badge-lg text-white font-bold text-lg px-6 py-4 shadow-lg">🔒 BOOKED</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-base-100 to-transparent h-16" />
          </div>

          <div className="p-5 -mt-6 relative">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-bold">{maid.name}</h2>
              <span className={`badge ${getCategoryColor(maid.category)} badge-sm font-bold`}>
                {getCategoryIcon(maid.category)} {maid.category}
              </span>
              <span className={`badge ${isBooked ? "badge-error" : getStatusBadgeClass(maid.status)} badge-sm`}>
                {isBooked ? "🔒 Booked" : maid.status}
              </span>
            </div>
            <p className="text-sm text-base-content/60 mb-4">Reference ID: {maidRef}</p>

            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
              <BookOpen size={14} /> Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <InfoItem icon={<MapPin size={14} />} label="Nationality" value={maid.nationality} />
              <InfoItem icon={<Calendar size={14} />} label="Age" value={maid.age ? `${maid.age} years` : "N/A"} />
              <InfoItem icon={<Ruler size={14} />} label="Height" value={maid.height || "N/A"} />
              <InfoItem icon={<Weight size={14} />} label="Weight" value={maid.weight || "N/A"} />
              <InfoItem icon={<Heart size={14} />} label="Religion" value={maid.religion || "N/A"} />
              <InfoItem icon={<Heart size={14} />} label="Marital Status" value={maid.marital_status || "N/A"} />
            </div>

            {maid.languages && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
                  <Languages size={14} /> Languages Known
                </h4>
                <div className="flex flex-wrap gap-1">
                  {maid.languages.split(",").map((lang, i) => (
                    <span key={i} className="badge badge-outline badge-sm">{lang.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
              <Briefcase size={14} /> Work Details
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <InfoItem icon={<Briefcase size={14} />} label="Total Experience" value={`${maid.experience_years} years`} />
              <InfoItem
                icon={<Globe size={14} />}
                label="Location"
                value={isBooked ? "🔒 Booked" : getLocationLabel(maid.location_type)}
                highlight={isBooked ? "error" : undefined}
              />
              <InfoItem icon={<DollarSign size={14} />} label="Salary" value={formatSalary(maid.salary)} />
              <InfoItem icon={<DollarSign size={14} />} label="Rate" value={formatRate(maid.monthly_salary)} />
            </div>

            {maid.available_emirates && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
                  <MapPin size={14} /> Available in Emirates
                </h4>
                <div className="flex flex-wrap gap-1">
                  {maid.available_emirates.split(",").map((em, i) => (
                    <span key={i} className="badge badge-primary badge-sm">{em.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {expBreakdown.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
                  <Globe size={14} /> Experience Breakdown
                </h4>
                <div className="bg-base-200 rounded-lg overflow-hidden">
                  <table className="table table-sm">
                    <thead><tr><th className="text-xs">Country</th><th className="text-xs">Duration</th></tr></thead>
                    <tbody>
                      {expBreakdown.map((exp, i) => (
                        <tr key={i}><td className="text-sm">{exp.country}</td><td className="text-sm font-medium">{exp.years}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {cookingList.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
                  <UtensilsCrossed size={14} /> Cooking Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {cookingList.map((food, i) => (
                    <span key={i} className="badge badge-warning badge-sm">{food}</span>
                  ))}
                </div>
              </div>
            )}

            {maid.skills && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
                  <FileText size={14} /> Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {maid.skills.split(",").map((skill, i) => (
                    <span key={i} className="badge badge-outline badge-sm">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {maid.bio && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1">About</h4>
                <p className="text-sm text-base-content/70 whitespace-pre-wrap">{maid.bio}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {isBooked ? (
                <div className="alert alert-error py-3">
                  <CheckCircle size={18} />
                  <span className="font-semibold">This housemaid has been booked</span>
                </div>
              ) : (
                <button className="btn btn-primary btn-block" onClick={handleBook} disabled={booking}>
                  {booking ? <span className="loading loading-spinner loading-sm" /> : <><CheckCircle size={18} /> Book This Housemaid</>}
                </button>
              )}
              <a href={getWhatsAppLink(maid)} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-block">
                <MessageCircle size={18} /> Chat on WhatsApp About {maid.name}
              </a>
            </div>
          </div>
        </div>
      </div>

      {showChat && <ChatBot maidName={maid.name} maidRef={maidRef} onClose={() => setShowChat(false)} />}
    </>
  );
};

const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: "error" | "success";
}> = ({ icon, label, value, highlight }) => (
  <div className={`rounded-lg p-2 ${highlight === "error" ? "bg-error/10 border border-error/30" : "bg-base-200"}`}>
    <div className="flex items-center gap-1 text-xs text-base-content/50 mb-0.5">{icon} {label}</div>
    <p className={`text-sm font-medium ${highlight === "error" ? "text-error" : ""}`}>{value}</p>
  </div>
);
