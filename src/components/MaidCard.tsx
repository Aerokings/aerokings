"use client";
import React, { useState } from "react";
import { MessageCircle, Eye, Globe, Video } from "lucide-react";
import { Maid } from "@/types";
import { getWhatsAppLink, formatSalary, formatRate, getLocationLabel, getStatusBadgeClass, getCategoryColor, getCategoryIcon } from "@/utils/helpers";
import { getPhotoUrl } from "@/lib/supabase";
import { VideoCallBooking } from "./VideoCallBooking";

interface MaidCardProps {
  maid: Maid;
  onViewDetail: (maid: Maid) => void;
}

export const MaidCard: React.FC<MaidCardProps> = ({ maid, onViewDetail }) => {
  const photoUrl = getPhotoUrl(maid.photo_url);
  const [showVideoBooking, setShowVideoBooking] = useState(false);

  return (
    <>
      <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
        <figure className="relative h-72 bg-base-300 overflow-hidden flex items-start justify-center">
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
        </figure>
        <div className="card-body p-4 gap-1">
          <h3 className="card-title text-base mb-1">{maid.name}</h3>
          <table className="text-xs w-full">
            <tbody>
              <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Nationality</td><td className="py-0.5">{maid.nationality}</td></tr>
              <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Age</td><td className="py-0.5">{maid.age ? `${maid.age} years` : "N/A"}</td></tr>
              <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Role</td><td className="py-0.5"><span className={`badge ${getCategoryColor(maid.category)} badge-xs font-bold`}>{getCategoryIcon(maid.category)} {maid.category}</span></td></tr>
              <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Experience</td><td className="py-0.5">{maid.experience_years} years</td></tr>
              <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Location</td><td className="py-0.5">{maid.status === "booked" ? <span className="badge badge-error badge-xs font-bold">🔒 Booked</span> : getLocationLabel(maid.location_type)}</td></tr>
              <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Salary</td><td className="py-0.5 font-semibold">{formatSalary(maid.salary)}</td></tr>
              <tr><td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Rate</td><td className="py-0.5 font-semibold text-primary">{formatRate(maid.monthly_salary)}</td></tr>
            </tbody>
          </table>
          <div className="card-actions mt-3 flex flex-col gap-2">
            <div className="flex gap-2 w-full">
              <button className="btn btn-outline btn-sm flex-1" onClick={() => onViewDetail(maid)}>
                <Eye size={14} /> View Profile
              </button>
              {maid.status === "booked" ? (
                <span className="btn btn-error btn-sm flex-1 no-animation cursor-default opacity-80">🔒 Booked</span>
              ) : (
                <a href={getWhatsAppLink(maid)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="btn btn-success btn-sm flex-1">
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
            </div>
            {maid.status !== "booked" && (
              <button
                className="btn btn-info btn-sm btn-block"
                onClick={() => setShowVideoBooking(true)}
              >
                <Video size={14} /> 📹 Book Video Call
              </button>
            )}
          </div>
        </div>
      </div>

      {showVideoBooking && (
        <VideoCallBooking maid={maid} onClose={() => setShowVideoBooking(false)} />
      )}
    </>
  );
};
