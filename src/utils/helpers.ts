import { Maid } from "../types";

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971567554232";

export function getWhatsAppLink(maid: Maid): string {
  const message = encodeURIComponent(
    `Hi, I'm interested in hiring ${maid.name} (${maid.nationality}, ${maid.experience_years} years experience). Reference ID: ${maid.id}. Can you tell me more?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export const CATEGORIES = ["Cook", "Cleaner", "Caregiver", "Nanny"] as const;

export const getCategoryColor = (cat: string) => {
  switch (cat) {
    case "Cook": return "badge-warning";
    case "Cleaner": return "badge-info";
    case "Caregiver": return "badge-secondary";
    case "Nanny": return "badge-accent";
    default: return "badge-ghost";
  }
};

export const getCategoryIcon = (cat: string) => {
  switch (cat) {
    case "Cook": return "🍳";
    case "Cleaner": return "🧹";
    case "Caregiver": return "💝";
    case "Nanny": return "👶";
    default: return "👩";
  }
};

export const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"
];

export const RELIGIONS = [
  "Muslim", "Christian", "Hindu", "Buddhist", "Sikh", "Other"
];

export const NATIONALITIES = [
  "Filipino", "Ethiopian", "Indonesian", "Indian", "Sri Lankan",
  "Bangladeshi", "Nepalese", "Ugandan", "Kenyan", "Ghanaian",
  "Nigerian", "Cameroonian", "Tanzanian", "Myanmar", "Vietnamese", "Other"
];

export function formatSalary(amount: number | null): string {
  if (!amount) return "Contact for price";
  return `AED ${amount.toLocaleString()}`;
}

export function getLocationLabel(type: string, status?: string): string {
  if (status === "booked") return "🔒 Booked";
  return type === "inside" ? "🇦🇪 Inside Country" : "✈️ Outside Country";
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "available": return "badge-success";
    case "booked": return "badge-warning";
    case "inactive": return "badge-error";
    default: return "badge-ghost";
  }
}
