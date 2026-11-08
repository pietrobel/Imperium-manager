import React from 'react';
import { audio } from '../services/audioService';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'gold' | 'crimson';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  active = false,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      audio.playClick();
      onClick?.(e);
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs',
    lg: 'px-5 py-2 text-sm font-semibold'
  }[size];

  const variantClasses = {
    primary: 'bg-[#1e293b] hover:bg-[#2b394f] text-[#f1f5f9] border-t-[#3b4b66] border-l-[#3b4b66] border-r-[#0f172a] border-b-[#0f172a]',
    secondary: 'bg-[#151a24] hover:bg-[#1e2533] text-[#cbd5e1] border-t-[#2d3748] border-l-[#2d3748] border-r-[#090d14] border-b-[#090d14]',
    danger: 'bg-[#7f1d1d] hover:bg-[#991b1b] text-white border-t-[#b91c1c] border-l-[#b91c1c] border-r-[#450a0a] border-b-[#450a0a]',
    gold: 'bg-[#856404] hover:bg-[#9e7607] text-[#fffbeb] border-t-[#d4af37] border-l-[#d4af37] border-r-[#533f02] border-b-[#533f02]',
    crimson: 'bg-[#8b1e28] hover:bg-[#a52430] text-white border-t-[#c53030] border-l-[#c53030] border-r-[#4a0d13] border-b-[#4a0d13]'
  }[variant];

  const activeClasses = active ? 'border-t-[#090d14] border-l-[#090d14] border-r-[#3b4b66] border-b-[#3b4b66] bg-[#0c0f16] text-[#d4af37]' : '';

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`border inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all active:translate-y-px select-none whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${activeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
