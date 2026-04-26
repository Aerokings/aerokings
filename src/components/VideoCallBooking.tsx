"use client";
import React, { useState } from "react";
import { X, Video, Calendar, Clock, User, Phone, Mail, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { Maid } from "@/types";
import { supabase } from "@/lib/supabase";

interface VideoCallBookingProps {
  maid: Maid;
  onClose: () => void;
}

export const VideoCallBooking: React.FC<VideoCallBookingProps> = ({ maid, onClose }) => {
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingData, setBookingData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    booking_date: "",
    booking_time: "",
  });
  const [result, setResult] = useState<{
    booking_ref: string;
    meeting_link: string;
    booking_date: string;
    booking_time: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const generateRef = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "VC-";
    for (let i = 0; i < 8; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
    return ref;
  };

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const bookingRef = generateRef();
      const meetingLink = `https://meet.jit.si/kadhama-meet-${maid.id}-${bookingRef}`;

      // Save to Supabase
      const { error: dbError } = await supabase.from("video_bookings").insert({
        booking_ref: bookingRef,
        maid_id: maid.id,
        maid_name: maid.name,
        customer_name: bookingData.customer_name,
        customer_phone: bookingData.customer_phone,
        customer_email: bookingData.customer_email,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        meeting_link: meetingLink,
        status: "scheduled",
      });

      if (dbError) throw dbError;

      // Send email notification to admin via API route
      // Email notification is handled automatically by the backend system

      setResult({
        booking_ref: bookingRef,
        meeting_link: meetingLink,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
      });
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    if (result) {
      navigator.clipboard.writeText(result.meeting_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-AE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-base-100 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Video size={20} />
            <h3 className="font-bold text-lg">
              {step === "form" ? "Book Video Call" : "Booking Confirmed!"}
            </h3>
          </div>
          <button className="btn btn-circle btn-sm btn-ghost text-white" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {step === "form" ? (
          <form onSubmit={handleSubmit} className="p-5">
            <p className="text-sm text-base-content/70 mb-4">
              Schedule a video call with <strong>{maid.name}</strong> to meet her before hiring.
            </p>

            {error && (
              <div className="alert alert-error mb-4 py-2 text-sm">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm flex items-center gap-1"><User size={14} /> Your Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  placeholder="Enter your full name"
                  required
                  value={bookingData.customer_name}
                  onChange={(e) => setBookingData({ ...bookingData, customer_name: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm flex items-center gap-1"><Phone size={14} /> Phone Number *</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered input-sm w-full"
                  placeholder="+971 5X XXX XXXX"
                  required
                  value={bookingData.customer_phone}
                  onChange={(e) => setBookingData({ ...bookingData, customer_phone: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm flex items-center gap-1"><Mail size={14} /> Email *</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered input-sm w-full"
                  placeholder="your@email.com"
                  required
                  value={bookingData.customer_email}
                  onChange={(e) => setBookingData({ ...bookingData, customer_email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm flex items-center gap-1"><Calendar size={14} /> Date *</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full"
                    min={getMinDate()}
                    required
                    value={bookingData.booking_date}
                    onChange={(e) => setBookingData({ ...bookingData, booking_date: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm flex items-center gap-1"><Clock size={14} /> Time *</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered input-sm w-full"
                    required
                    value={bookingData.booking_time}
                    onChange={(e) => setBookingData({ ...bookingData, booking_time: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block mt-5"
              disabled={submitting}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <Video size={16} /> Confirm Video Call Booking
                </>
              )}
            </button>

            <p className="text-xs text-base-content/40 mt-3 text-center">
              A free Jitsi Meet link will be generated for the call. No app download needed.
            </p>
          </form>
        ) : result ? (
          <div className="p-5 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h4 className="text-lg font-bold text-success mb-1">Video Call Booked!</h4>
            <p className="text-sm text-base-content/60 mb-4">
              Your video call with <strong>{maid.name}</strong> has been scheduled.
            </p>

            <div className="bg-base-200 rounded-xl p-4 text-left space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="badge badge-primary badge-sm">REF</span>
                <span className="font-bold">{result.booking_ref}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-primary" />
                <span>{formatDate(result.booking_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-primary" />
                <span>{formatTime(result.booking_time)}</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 mb-4">
              <p className="text-xs text-base-content/50 mb-2">Your Meeting Link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={result.meeting_link}
                  className="input input-bordered input-sm flex-1 text-xs font-mono"
                />
                <button className="btn btn-sm btn-ghost" onClick={copyLink}>
                  {copied ? <CheckCircle size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={result.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex-1"
              >
                <ExternalLink size={14} /> Open Meeting
              </a>
              <button className="btn btn-ghost flex-1" onClick={onClose}>
                Close
              </button>
            </div>

            <p className="text-xs text-base-content/40 mt-3">
              📧 A confirmation has been sent to our team. We&apos;ll contact you before the call.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
