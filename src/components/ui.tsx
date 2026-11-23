import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import { cn } from '../lib/utils';
export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const v = {
    primary: 'bg-[#1d3f91] text-white hover:bg-[#16347a]',
    secondary:
      'border border-[#dde3ed] bg-white text-[#182033] hover:bg-[#f2f4f8]',
    danger: 'bg-[#b42318] text-white',
  };
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:opacity-50',
        v[variant],
        className,
      )}
      {...props}
    />
  );
}
export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-[#dde3ed] bg-white px-3 text-sm outline-none focus:border-[#1d3f91] focus:ring-2 focus:ring-[#1d3f91]/10',
        className,
      )}
      {...props}
    />
  );
}
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn('rounded-xl border border-[#dde3ed] bg-white', className)}
    >
      {children}
    </section>
  );
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  const c = {
    neutral: 'bg-[#eef1f6] text-[#5d6678]',
    success: 'bg-[#dcfce7] text-[#166534]',
    warning: 'bg-[#fef3c7] text-[#92400e]',
    danger: 'bg-[#fee2e2] text-[#991b1b]',
  }[tone];
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        c,
      )}
    >
      {children}
    </span>
  );
}
