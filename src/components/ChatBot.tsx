"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Bot, User, X, Minimize2 } from "lucide-react";

interface Message { role: "bot" | "user"; text: string; }

interface ChatBotProps {
  maidName: string;
  maidRef: string;
  onClose: () => void;
}

const KB: { keywords: string[]; answer: string }[] = [
  { keywords: ["hello", "hi", "hey", "good morning", "good evening", "salam", "assalam"], answer: "Hello! Welcome to AeroKings Recruitment Services. How can I help you today? You can ask about our services, maid recruitment process, visa requirements, pricing, or anything else!" },
  { keywords: ["service", "what do you", "about", "aerokings", "company"], answer: "AeroKings is a leading housemaid recruitment agency based in Dubai, UAE. We specialize in connecting families with experienced and reliable domestic helpers including Cooks, Nannies, Caregivers, and Cleaners from various nationalities. All our maids are verified and pre-screened." },
  { keywords: ["process", "how to hire", "how to book", "steps", "procedure", "how does it work"], answer: "📋 Our recruitment process:\n1. Browse our available housemaids on the website\n2. Select a maid that matches your requirements\n3. Click \"Book This Housemaid\" to reserve her\n4. Our team will contact you within 24 hours to confirm\n5. Complete documentation & visa processing\n6. Your housemaid arrives at your home!\n\nThe entire process typically takes 2-4 weeks for maids outside the country, and 3-5 days for maids already in UAE." },
  { keywords: ["visa", "sponsorship", "sponsor", "immigration"], answer: "🛂 Visa & Sponsorship:\n- For maids inside UAE: Transfer of visa/sponsorship takes 3-5 working days\n- For maids outside UAE: New visa processing takes 2-4 weeks\n- We handle all visa documentation on your behalf\n- You will need to be the sponsor (employer)\n- Emirates ID and valid passport are required for sponsorship" },
  { keywords: ["price", "cost", "fee", "charge", "payment", "how much", "salary", "rate"], answer: "💰 Pricing Information:\n- Monthly salaries range from AED 1,000 to AED 3,500 depending on nationality, experience, and role\n- One-time agency fee applies (contact us for current rates)\n- Visa processing fees are separate\n- Payment can be made via bank transfer, cash, or card\n\nFor exact pricing, please contact us on WhatsApp: +971 0567554232" },
  { keywords: ["trial", "test", "probation", "try"], answer: "✅ Trial Period:\n- We offer a trial period for all placements\n- During the trial, you can assess the maid's performance\n- If you are not satisfied, we will provide a replacement\n- Trial period terms vary — contact us for specific details" },
  { keywords: ["replace", "replacement", "change", "not satisfied", "problem", "issue", "complaint"], answer: "🔄 Replacement Policy:\n- If you are not satisfied with the housemaid during the guarantee period, we offer a free replacement\n- Contact us immediately if there are any issues\n- We aim to provide a replacement within 5-7 working days\n- Our goal is your complete satisfaction!\n\nWhatsApp us: +971 0567554232" },
  { keywords: ["document", "papers", "requirement", "what do i need", "needed"], answer: "📄 Documents Required:\n\nFor the Employer:\n- Valid passport copy\n- Emirates ID copy\n- Tenancy contract / Ejari\n- Salary certificate or bank statement\n\nFor the Housemaid:\n- Passport copy\n- Medical fitness certificate\n- Educational certificates (if any)\n- Previous experience letters\n\nWe guide you through every step!" },
  { keywords: ["nationality", "country", "where", "from"], answer: "🌍 Available Nationalities:\nWe recruit housemaids from many countries including:\n- 🇵🇭 Philippines\n- 🇮🇳 India\n- 🇱🇰 Sri Lanka\n- 🇪🇹 Ethiopia\n- 🇰🇪 Kenya\n- 🇳🇵 Nepal\n- 🇳🇬 Nigeria\n- 🇺🇬 Uganda\n- And more!\n\nEach nationality has different strengths and salary ranges. Browse our website to find the perfect match!" },
  { keywords: ["cook", "cooking", "chef", "food", "cuisine"], answer: "🍳 Our Cooks can prepare:\n- Arabic cuisine (Kabsa, Mandi, Machboos)\n- Indian food (Biryani, Curry, Tandoori)\n- Filipino dishes\n- Sri Lankan cuisine\n- Continental & Western food\n- Baking & Desserts\n- Chinese & Asian food\n\nYou can filter by \"Cook\" category on our website to find specialized cooks!" },
  { keywords: ["nanny", "baby", "child", "children", "kid", "babysit"], answer: "👶 Nanny Services:\n- Experienced nannies for infants and toddlers\n- School-age childcare support\n- Homework help and educational activities\n- All nannies are background-checked\n- Many speak English and Arabic\n- First-aid trained nannies available on request" },
  { keywords: ["contact", "phone", "whatsapp", "call", "reach", "talk"], answer: "📞 Contact AeroKings:\n- WhatsApp: +971 0567554232\n- Website: www.aerokings.ae\n- Available 7 days a week\n- Response within 1-2 hours during business hours\n- Business hours: 9 AM - 9 PM (Dubai time)\n\nFeel free to reach out anytime!" },
  { keywords: ["contract", "duration", "period", "how long", "year"], answer: "📝 Contract Details:\n- Standard contract is 2 years\n- Renewable upon mutual agreement\n- Contract follows UAE labor law for domestic workers\n- 30-day notice period for termination\n- Annual leave and return ticket included as per law" },
  { keywords: ["thank", "thanks", "appreciate"], answer: "You're welcome! 😊 We're happy to help. If you have any more questions, feel free to ask. You can also reach us directly on WhatsApp: +971 0567554232" },
];

const DEFAULT_RESPONSE = "I'm sorry, I don't have specific information about that. For detailed inquiries, please contact our team on WhatsApp: +971 0567554232. They'll be happy to help! 😊\n\nYou can ask me about:\n• Our services (Cook, Nanny, Caregiver, Cleaner)\n• Recruitment process\n• Visa & documentation\n• Pricing & payment\n• Trial & replacement policy\n• Contract details\n• Contact information";

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  let bestMatch: { answer: string; matchCount: number } | null = null;
  for (const entry of KB) {
    const matchCount = entry.keywords.filter(kw => lower.includes(kw)).length;
    if (matchCount > 0 && (!bestMatch || matchCount > bestMatch.matchCount)) {
      bestMatch = { answer: entry.answer, matchCount };
    }
  }
  return bestMatch?.answer || DEFAULT_RESPONSE;
}

export const ChatBot: React.FC<ChatBotProps> = ({ maidName, maidRef, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: `Thank you for booking ${maidName} (Ref: ${maidRef})! 🎉\n\nI'm AeroKings' virtual assistant. I can help you with:\n• Recruitment process & next steps\n• Visa & documentation requirements\n• Pricing & payment info\n• Replacement policy\n• Any other questions!\n\nHow can I assist you?` }
  ]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: "user", text }, { role: "bot", text: findAnswer(text) }]);
    setInput("");
  };

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[60]">
        <button className="btn btn-circle btn-primary btn-lg shadow-lg" onClick={() => setMinimized(false)}>
          <MessageCircle size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-80 sm:w-96 h-[500px] max-h-[80vh] bg-base-100 rounded-2xl shadow-2xl border border-base-300 flex flex-col overflow-hidden">
      <div className="bg-primary text-primary-content p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <div>
            <div className="font-bold text-sm">AeroKings Assistant</div>
            <div className="text-xs text-primary-content/70">Online • Ask me anything</div>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setMinimized(true)}><Minimize2 size={14} /></button>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}><X size={14} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "bot" && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} className="text-primary" />
              </div>
            )}
            <div className={`rounded-2xl px-3 py-2 max-w-[80%] text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-primary text-primary-content rounded-tr-sm" : "bg-base-200 text-base-content rounded-tl-sm"}`}>
              {msg.text}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-1">
                <User size={14} className="text-secondary" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-base-300 shrink-0">
        <div className="flex gap-2">
          <input type="text" className="input input-bordered input-sm flex-1" placeholder="Type your question..."
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
          <button className="btn btn-primary btn-sm btn-square" onClick={handleSend} disabled={!input.trim()}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
