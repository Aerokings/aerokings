"use client";
import React from "react";
import { MessageCircle, Eye, Globe } from "lucide-react";
import { Maid } from "@/types";
import { getWhatsAppLink, formatSalary, getLocationLabel, getStatusBadgeClass, getCategoryColor, getCategoryIcon } from "@/utils/helpers";
import { getPhotoUrl } from "@/lib/supabase";

interface MaidCardProps {
  maid: Maid;
  onViewDetail: (maid: Maid) => void;
}

export const MaidCard: React.FC<MaidCardProps> = ({ maid, onViewDetail }) => {
  const photoUrl = getPhotoUrl(maid.photo_url);

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
      <figure className="relative aspect-[3/4] bg-base-300 overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt={maid.name} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-base-content/30">
            <Globe size={48} />
            <span className="text-sm mt-2">No Photo</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`badge ${getStatusBadgeClass(maid.status)} badge-sm`}>{maid.status}</span>
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="badge badge-primary badge-sm">ID: {maid.id}</span>
          <span className={`badge ${getCategoryColor(maid.category)} badge-sm font-bold`}>
            {getCategoryIcon(maid.category)} {maid.category}
          </span>
        </div>
        {maid.religion && (
          <div className="absolute bottom-2 left-2">
            <span className={`badge badge-sm font-bold ${maid.religion.toLowerCase() === "muslim" || maid.religion.toLowerCase() === "islam" ? "bg-emerald-600 text-white border-emerald-700" : "bg-amber-500 text-white border-amber-600"}`}>
              ☪ {maid.religion.toLowerCase() === "muslim" || maid.religion.toLowerCase() === "islam" ? "Muslim" : "Non-Muslim"}
            </span>
          </div>
        )}
      </figure>
      <div className="card-body p-4 gap-1">
        <h3 className="card-title text-base mb-1">{maid.name}</h3>
        {maid.passport_number && <p className="text-xs text-base-content/50 -mt-1 mb-1">🛂 {maid.passport_number}</p>}
        <table className="text-xs w-full">
          <tbody>
            <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Nationality</td><td className="py-0.5">{maid.nationality}</td></tr>
            <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Age</td><td className="py-0.5">{maid.age ? `${maid.age} years` : "N/A"}</td></tr>
            <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Role</td><td className="py-0.5"><span className={`badge ${getCategoryColor(maid.category)} badge-xs font-bold`}>{getCategoryIcon(maid.category)} {maid.category}</span></td></tr>
            <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Experience</td><td className="py-0.5">{maid.experience_years} years</td></tr>
            <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Location</td><td className="py-0.5">{maid.status === "booked" ? <span className="badge badge-error badge-xs font-bold">🔒 Booked</span> : getLocationLabel(maid.location_type)}</td></tr>
            <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Rate</td><td className="py-0.5 font-semibold text-primary">{formatSalary(maid.monthly_salary)}</td></tr>
          </tbody>
        </table>
        <div className="card-actions mt-3 flex gap-2">
          <button className="btn btn-outline btn-sm flex-1" onClick={() => onViewDetail(maid)}>
            <Eye size={14} /> View Profile
          </button>
          {maid.status === "booked" ? (
            <span className="btn btn-error btn-sm flex-1 no-animation cursor-default opacity-80">🔒 Booked</span>
          ) : (
            <a href={getWhatsAppLink(maid)} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm flex-1">
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
