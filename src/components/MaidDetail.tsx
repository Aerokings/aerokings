import React, { useState } from 'react';
import {
  X, MessageCircle, MapPin, Briefcase, Globe, Heart,
  BookOpen, DollarSign, Calendar, FileText, Ruler, Weight, UtensilsCrossed, Languages, CheckCircle, PartyPopper, Play
} from 'lucide-react';
import { Maid } from '../types';
import { getWhatsAppLink, formatSalary, getLocationLabel, getStatusBadgeClass, getCategoryColor, getCategoryIcon } from '../utils/helpers';
import { ChatBot } from './ChatBot';
import { getPhotoUrl, supabase } from '../lib/supabase';

interface MaidDetailProps {
  maid: Maid;
  onClose: () => void;
  onRefresh?: () => void;
}

export const MaidDetail: React.FC<MaidDetailProps> = ({ maid, onClose, onRefresh }) => {
  const photoUrl = maid.photo_url ? getPhotoUrl(maid.photo_url) : null;
  const [booking, setBooking] = useState(false);
  const [justBooked, setJustBooked] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const isBooked = maid.status === 'booked' || justBooked;
  const maidRef = `AK-${String(maid.id).padStart(4, '0')}`;

  const handleBook = async () => {
    setBooking(true);
    try {
      const { error } = await supabase
        .from('maids')
        .update({ status: 'booked' })
        .eq('id', maid.id);
      if (error) throw error;
      setJustBooked(true);
      onRefresh?.();
      setShowChat(true);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const expBreakdown = maid.experience_breakdown
    ? maid.experience_breakdown.split(',').map(item => {
        const parts = item.trim().split(':');
        return { country: parts[0]?.trim(), years: parts[1]?.trim() };
      })
    : [];

  const cookingList = maid.cooking_skills
    ? maid.cooking_skills.split(',').map(s => s.trim()).filter(Boolean)
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
              <img src={photoUrl} alt={maid.name} className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-base-content/30">
                <Globe size={64} />
                <span className="mt-2">No Photo</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{maid.name}</h2>
              {maid.passport_number && (
                <p className="text-sm text-base-content/70">Passport: {maid.passport_number}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {maid.nationality && (
                <div>
                  <span className="badge badge-sm">🌍 {maid.nationality}</span>
                </div>
              )}
              {maid.age && (
                <div>
                  <span className="badge badge-sm">📅 {maid.age} years</span>
                </div>
              )}
              {maid.experience_years !== undefined && (
                <div>
                  <span className="badge badge-sm">⭐ {maid.experience_years} yrs exp</span>
                </div>
              )}
              {maid.category && (
                <div>
                  <span className={`badge ${getCategoryColor(maid.category)} badge-sm`}>
                    {getCategoryIcon(maid.category)} {maid.category}
                  </span>
                </div>
              )}
            </div>

            {maid.bio && (
              <div>
                <h3 className="font-semibold text-sm mb-2">About</h3>
                <p className="text-sm text-base-content/80">{maid.bio}</p>
              </div>
            )}

            {maid.skills && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Skills</h3>
                <p className="text-sm text-base-content/80">{maid.skills}</p>
              </div>
            )}

            {maid.video_url && (
              <button
                onClick={() => setShowVideo(true)}
                className="btn btn-info btn-sm w-full"
              >
                <Play size={14} /> Watch Video
              </button>
            )}

            {showVideo && maid.video_url && (
              <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                <div className="relative w-full max-w-2xl aspect-video">
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute -top-10 right-0 btn btn-circle btn-sm"
                  >
                    <X size={18} />
                  </button>
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={maid.video_url}
                    allow="autoplay"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Rate (Tadbeer Fee):</span>
                <span className="font-bold text-primary">{formatSalary(maid.monthly_salary)}</span>
              </div>
              {maid.salary && (
                <div className="flex justify-between">
                  <span>Monthly Salary:</span>
                  <span className="font-bold text-secondary">{formatSalary(maid.salary)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Location:</span>
                <span>{isBooked ? '🔒 Booked' : getLocationLabel(maid.location_type)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={onClose} className="btn btn-outline btn-sm flex-1">
                <X size={14} /> Close
              </button>
              {!isBooked && (
                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="btn btn-primary btn-sm flex-1"
                >
                  {booking ? <span className="loading loading-spinner loading-xs" /> : <Heart size={14} />}
                  {booking ? 'Booking...' : 'Book Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showChat && <ChatBot maidName={maid.name} maidRef={maidRef} onClose={() => setShowChat(false)} />}
    </>
  );
};
