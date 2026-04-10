"use client";
import React, { useState } from "react";
import { X, Video, Calendar, Clock, User, Phone, CheckCircle } from "lucide-react";
import { Maid } from "@/types";
import { supabase } from "@/lib/supabase";

interface VideoCallBookingProps {
  maid: Maid;
  onClose: () => void;
}

export const VideoCallBooking: React.FC<VideoCallBookingProps> = ({ maid, onClose }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  const [refNumber, setRefNumber] = useState("");

  const generateJitsiLink = (maidId: number, bookingId: string) => {
    const room = `kadhama-meet-${maidId}-${bookingId}`;
    return `https://meet.jit.si/${room}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date || !time) return;

    setSubmitting(true);
    try {
      const bookingId = `VC-${Date.now().toString(36).toUpperCase()}`;
      const jitsiLink = generateJitsiLink(maid.id, bookingId);

      const { error } = await supabase.from("video_bookings").insert({
        booking_ref: bookingId,
        maid_id: maid.id,
        maid_name: maid.name,
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        booking_date: date,
        booking_time: time,
        meeting_link: jitsiLink,
        status: "scheduled",
      });

      if (error) throw error;

      setMeetLink(jitsiLink);
      setRefNumber(bookingId);
      setBooked(true);
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book video call. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Time slots from 9 AM to 8 PM
  const timeSlots = [];
  for (let h = 9; h <= 20; h++) {
    const hour = h > 12 ? h - 12 : h;
    const ampm = h >= 12 ? "PM" : "AM";
    timeSlots.push({ value: `${String(h).padStart(2, "0")}:00`, label: `${hour}:00 ${ampm}` });
    timeSlots.push({ value: `${String(h).padStart(2, "0")}:30`, label: `${hour}:30 ${ampm}` });
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-content p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video size={20} />
            <h3 className="font-bold text-lg">Book Video Call</h3>
          </div>
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {booked ? (
          /* Success State */
          <div className="p-6 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-success mb-2">Video Call Booked!</h3>
            <p className="text-sm text-base-content/70 mb-4">
              Your video call about <strong>{maid.name}</strong> has been scheduled.
            </p>
            
            <div className="bg-base-200 rounded-xl p-4 mb-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Reference</span>
                <span className="font-bold">{refNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Date</span>
                <span className="font-medium">{new Date(date + "T00:00:00").toLocaleDateString("en-AE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Time</span>
                <span className="font-medium">{timeSlots.find(t => t.value === time)?.label || time} (UAE)</span>
              </div>
            </div>

            <a
              href={meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-block mb-2"
            >
              <Video size={16} /> Save Meeting Link
            </a>
            <p className="text-xs text-base-content/50 mb-4">
              📌 Bookmark this link! Join at the scheduled time. Our team will be there.
            </p>

            <div className="alert alert-info text-left py-3">
              <div>
                <p className="text-sm font-medium">📧 A confirmation will be sent to your email/phone.</p>
                <p className="text-xs mt-1">Our team will also contact you before the call.</p>
              </div>
            </div>

            <button className="btn btn-ghost btn-sm mt-4" onClick={onClose}>Close</button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="bg-base-200 rounded-lg p-3 flex items-center gap-3">
              <div className="text-2xl">👩</div>
              <div>
                <p className="font-semibold text-sm">{maid.name}</p>
                <p className="text-xs text-base-content/50">{maid.nationality} · {maid.category} · ID: {maid.id}</p>
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm font-medium"><User size={14} className="inline mr-1" />Your Name *</span></label>
              <input
                type="text"
                className="input input-bordered input-sm"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm font-medium"><Phone size={14} className="inline mr-1" />Phone Number *</span></label>
              <input
                type="tel"
                className="input input-bordered input-sm"
                placeholder="+971 5X XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm font-medium">📧 Email (optional)</span></label>
              <input
                type="email"
                className="input input-bordered input-sm"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm font-medium"><Calendar size={14} className="inline mr-1" />Date *</span></label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  min={minDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm font-medium"><Clock size={14} className="inline mr-1" />Time (UAE) *</span></label>
                <select
                  className="select select-bordered select-sm"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="alert py-2">
              <div>
                <p className="text-xs">📹 A free video call link will be generated. No app download needed — works in your browser!</p>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting || !name || !phone || !date || !time}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <><Video size={16} /> Confirm Video Call Booking</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
