import React, { useState, useEffect } from 'react';
import { MessageCircle, MapPin, Briefcase, Eye, Globe, Play } from 'lucide-react';
import { Maid } from '../types';
import { getWhatsAppLink, formatSalary, getLocationLabel, getStatusBadgeClass, getCategoryColor, getCategoryIcon } from '../utils/helpers';

interface MaidCardProps {
  maid: Maid;
  onViewDetail: (maid: Maid) => void;
}

export const MaidCard: React.FC<MaidCardProps> = ({ maid, onViewDetail }) => {
  const [photoData, setPhotoData] = useState<string | null>(null);

  useEffect(() => {
    if (maid.photo_filename) {
      window.tasklet
        .readBinaryFileFromDisk(`/agent/home/apps/airoking/uploads/${maid.photo_filename}`)
        .then((base64) => {
          const ext = maid.photo_filename!.split('.').pop()?.toLowerCase() || 'jpeg';
          const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          setPhotoData(`data:${mime};base64,${base64}`);
        })
        .catch(() => setPhotoData(null));
    }
  }, [maid.photo_filename]);

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
      {/* Photo */}
      <figure className="relative h-56 bg-base-300 overflow-hidden">
        {photoData ? (
          <img src={photoData} alt={maid.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-base-content/30">
            <Globe size={48} />
            <span className="text-sm mt-2">No Photo</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`badge ${getStatusBadgeClass(maid.status)} badge-sm`}>
            {maid.status}
          </span>
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="badge badge-primary badge-sm">
            ID: {maid.id}
          </span>
          <span className={`badge ${getCategoryColor(maid.category)} badge-sm font-bold`}>
            {getCategoryIcon(maid.category)} {maid.category}
          </span>
        </div>
      </figure>

      <div className="card-body p-4 gap-1">
        {/* Name */}
        <h3 className="card-title text-base mb-1">{maid.name}</h3>

        {/* Structured info rows */}
        <table className="text-xs w-full">
          <tbody>
            <tr>
              <td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Nationality</td>
              <td className="py-0.5">{maid.nationality}</td>
            </tr>
            <tr>
              <td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Age</td>
              <td className="py-0.5">{maid.age ? `${maid.age} years` : 'N/A'}</td>
            </tr>
            <tr>
              <td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Role</td>
              <td className="py-0.5">
                <span className={`badge ${getCategoryColor(maid.category)} badge-xs font-bold`}>
                  {getCategoryIcon(maid.category)} {maid.category}
                </span>
              </td>
            </tr>
            <tr>
              <td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Experience</td>
              <td className="py-0.5">{maid.experience_years} years</td>
            </tr>
            <tr>
              <td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Location</td>
              <td className="py-0.5">
                {maid.status === 'booked' ? (
                  <span className="badge badge-error badge-xs font-bold">🔒 Booked</span>
                ) : (
                  getLocationLabel(maid.location_type)
                )}
              </td>
            </tr>
            <tr>
              <td className="text-base-content/50 pr-2 py-0.5 whitespace-nowrap font-medium">Rate</td>
              <td className="py-0.5 font-semibold text-primary">{formatSalary(maid.monthly_salary)}</td>
            </tr>
          </tbody>
        </table>

        {/* Actions */}
        <div className="card-actions mt-3 flex gap-1 flex-col">
          <div className="flex gap-2 w-full">
            <button
              className="btn btn-outline btn-sm flex-1"
              onClick={() => onViewDetail(maid)}
            >
              <Eye size={14} /> View Profile
            </button>
            {maid.status === 'booked' ? (
              <span className="btn btn-error btn-sm flex-1 no-animation cursor-default opacity-80">
                🔒 Booked
              </span>
            ) : (
              <a
                href={getWhatsAppLink(maid)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm flex-1"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
          </div>
          {maid.video_url && (
            <button
              className="btn btn-info btn-sm w-full"
              onClick={() => onViewDetail(maid)}
            >
              <Play size={14} /> Watch Video
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
