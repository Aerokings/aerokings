import React, { useState, useEffect } from 'react';
import {
  X, MessageCircle, MapPin, Briefcase, Globe, Heart,
  BookOpen, DollarSign, Calendar, FileText, Ruler, Weight, UtensilsCrossed, Languages, CheckCircle, PartyPopper, Play
} from 'lucide-react';
import { Maid } from '../types';
import { getWhatsAppLink, formatSalary, getLocationLabel, getStatusBadgeClass, getCategoryColor, getCategoryIcon, escapeSQL } from '../utils/helpers';
import { ChatBot } from './ChatBot';

interface MaidDetailProps {
  maid: Maid;
  onClose: () => void;
  onRefresh?: () => void;
}

export const MaidDetail: React.FC<MaidDetailProps> = ({ maid, onClose, onRefresh }) => {
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [justBooked, setJustBooked] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const isBooked = maid.status === 'booked' || justBooked;
  const maidRef = `AK-${String(maid.id).padStart(4, '0')}`;

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

  const handleBook = async () => {
    setBooking(true);
    try {
      // Update maid status to booked
      await window.tasklet.sqlExec(
        `UPDATE maids SET status='booked', updated_at=datetime('now') WHERE id=${maid.id}`
      );
      setJustBooked(true);
      onRefresh?.();

      // Send notification email to admin
      try {
        await window.tasklet.runTool('send_message', {
          to: ['owner'],
          subject: `🔔 New Booking: ${maid.name} (${maidRef})`,
          body: `## New Housemaid Booking Alert!\n\n**Reference:** ${maidRef}\n**Housemaid:** ${maid.name}\n**Nationality:** ${maid.nationality}\n**Category:** ${maid.category}\n**Age:** ${maid.age || 'N/A'}\n**Rate:** ${formatSalary(maid.monthly_salary)}/month\n**Experience:** ${maid.experience_years} years\n\n---\n\nA customer has booked this housemaid through the AiroKing website. Please follow up with the customer as soon as possible.\n\n*— AiroKing Recruitment System*`
        });
      } catch (emailErr) {
        console.error('Failed to send admin notification:', emailErr);
      }

      // Show chatbot after booking
      setShowChat(true);
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setBooking(false);
    }
  };

  // Parse experience breakdown
  const expBreakdown = maid.experience_breakdown
    ? maid.experience_breakdown.split(',').map(item => {
        const parts = item.trim().split(':');
        return { country: parts[0]?.trim(), years: parts[1]?.trim() };
      })
    : [];

  // Parse cooking skills
  const cookingList = maid.cooking_skills
    ? maid.cooking_skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-base-100 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
          {/* Booking Success Banner */}
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

          {/* Header photo */}
          <div className="relative h-64 bg-base-300">
            {photoData ? (
              <img src={photoData} alt={maid.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-base-content/30">
                <Globe size={64} />
                <span className="mt-2">No Photo</span>
              </div>
            )}
            <button
              className="btn btn-circle btn-sm btn-ghost absolute top-3 right-3 bg-base-100/80"
              onClick={onClose}
            >
              <X size={16} />
            </button>
            {/* Booked overlay */}
            {isBooked && (
              <div className="absolute inset-0 bg-error/20 flex items-center justify-center">
                <span className="badge badge-error badge-lg text-white font-bold text-lg px-6 py-4 shadow-lg">
                  🔒 BOOKED
                </span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-base-100 to-transparent h-16" />
          </div>

          <div className="p-5 -mt-6 relative">
            {/* Name & status */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-bold">{maid.name}</h2>
              <span className={`badge ${getCategoryColor(maid.category)} badge-sm font-bold`}>
                {getCategoryIcon(maid.category)} {maid.category}
              </span>
              <span className={`badge ${isBooked ? 'badge-error' : getStatusBadgeClass(maid.status)} badge-sm`}>
                {isBooked ? '🔒 Booked' : maid.status}
              </span>
            </div>
            <p className="text-sm text-base-content/60 mb-4">Reference ID: {maidRef}</p>

            {/* Personal Info */}
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
              <BookOpen size={14} /> Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <InfoItem icon={<MapPin size={14} />} label="Nationality" value={maid.nationality} />
              <InfoItem icon={<Calendar size={14} />} label="Age" value={maid.age ? `${maid.age} years` : 'N/A'} />
              <InfoItem icon={<Ruler size={14} />} label="Height" value={maid.height || 'N/A'} />
              <InfoItem icon={<Weight size={14} />} label="Weight" value={maid.weight || 'N/A'} />
              <InfoItem icon={<Heart size={14} />} label="Religion" value={maid.religion || 'N/A'} />
              <InfoItem icon={<Heart size={14} />} label="Marital Status" value={maid.marital_status || 'N/A'} />
            </div>

            {/* Languages */}
            {maid.languages && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
                  <Languages size={14} /> Languages Known
                </h4>
                <div className="flex flex-wrap gap-1">
                  {maid.languages.split(',').map((lang, i) => (
                    <span key={i} className="badge badge-outline badge-sm">{lang.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Info */}
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
              <Briefcase size={14} /> Work Details
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <InfoItem icon={<Briefcase size={14} />} label="Total Experience" value={`${maid.experience_years} years`} />
              <InfoItem
                icon={<Globe size={14} />}
                label="Location"
                value={isBooked ? '🔒 Booked' : getLocationLabel(maid.location_type)}
                highlight={isBooked ? 'error' : undefined}
              />
              <InfoItem icon={<DollarSign size={14} />} label="Rate" value={formatSalary(maid.monthly_salary)} />
            </div>

            {/* Available Emirates */}
            {maid.available_emirates && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
                  <MapPin size={14} /> Available in Emirates
                </h4>
                <div className="flex flex-wrap gap-1">
                  {maid.available_emirates.split(',').map((em, i) => (
                    <span key={i} className="badge badge-primary badge-sm">{em.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Breakdown */}
            {expBreakdown.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
                  <Globe size={14} /> Experience Breakdown
                </h4>
                <div className="bg-base-200 rounded-lg overflow-hidden">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th className="text-xs">Country</th>
                        <th className="text-xs">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expBreakdown.map((exp, i) => (
                        <tr key={i}>
                          <td className="text-sm">{exp.country}</td>
                          <td className="text-sm font-medium">{exp.years}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cooking Skills (only for Cooks) */}
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

            {/* General Skills */}
            {maid.skills && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
                  <FileText size={14} /> Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {maid.skills.split(',').map((skill, i) => (
                    <span key={i} className="badge badge-outline badge-sm">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {maid.bio && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1">About</h4>
                <p className="text-sm text-base-content/70 whitespace-pre-wrap">{maid.bio}</p>
              </div>
            )}

            {/* CV indicator */}
            {maid.cv_filename && (
              <div className="alert alert-info py-2 mb-4">
                <FileText size={16} />
                <span className="text-sm">CV available — contact us via WhatsApp for details</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              {/* Book / Booked button */}
              {isBooked ? (
                <div className="alert alert-error py-3">
                  <CheckCircle size={18} />
                  <span className="font-semibold">This housemaid has been booked</span>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleBook}
                  disabled={booking}
                >
                  {booking ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <>
                      <CheckCircle size={18} /> Book This Housemaid
                    </>
                  )}
                </button>
              )}

              {/* Watch Video button */}
              {maid.video_url && (
                <button
                  className="btn btn-info btn-block"
                  onClick={() => setShowVideo(true)}
                >
                  <Play size={18} /> Watch Video
                </button>
              )}

              {/* WhatsApp CTA */}
              <a
                href={getWhatsAppLink(maid)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-block"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp About {maid.name}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideo && maid.video_url && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">{maid.name} - Video Profile</h3>
              <button
                className="btn btn-circle btn-sm btn-ghost"
                onClick={() => setShowVideo(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={maid.video_url}
                title={`${maid.name} Video Profile`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chatbot - shows after booking */}
      {showChat && (
        <ChatBot
          maidName={maid.name}
          maidRef={maidRef}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};

const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: 'error' | 'success';
}> = ({ icon, label, value, highlight }) => (
  <div className={`rounded-lg p-2 ${highlight === 'error' ? 'bg-error/10 border border-error/30' : 'bg-base-200'}`}>
    <div className="flex items-center gap-1 text-xs text-base-content/50 mb-0.5">
      {icon} {label}
    </div>
    <p className={`text-sm font-medium ${highlight === 'error' ? 'text-error' : ''}`}>{value}</p>
  </div>
);
