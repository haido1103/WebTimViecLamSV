import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function money(amount: number) { return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'; }
export function salaryLabel(min: number | null, max: number | null, type: string) {
  if (min == null && max == null) return 'Thỏa thuận';
  const suffix = type === 'hour' ? '/giờ' : type === 'shift' ? '/ca' : '/tháng';
  if (min == null) return `Đến ${money(max!)}${suffix}`;
  if (max == null) return `Từ ${money(min)}${suffix}`;
  return `${money(min)} – ${money(max)}${suffix}`;
}
