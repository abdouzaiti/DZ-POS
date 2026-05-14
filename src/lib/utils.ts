import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, lng: string = 'fr') {
  return amount.toLocaleString(lng === 'fr' ? 'fr-FR' : 'ar-DZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' DA';
}
