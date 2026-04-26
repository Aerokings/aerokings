import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Use FormSubmit.co with JSON mode
    const res = await fetch("https://formsubmit.co/ajax/kadhama.me@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        _subject: `📹 New Video Call Booking - ${data.booking_ref}`,
        _template: "table",
        "Booking Reference": data.booking_ref,
        "Maid Name": data.maid_name,
        "Customer Name": data.customer_name,
        "Customer Phone": data.customer_phone,
        "Customer Email": data.customer_email,
        "Date": data.booking_date,
        "Time": data.booking_time,
        "Meeting Link": data.meeting_link,
      }),
    });

    const result = await res.json();
    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
