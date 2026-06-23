import React from 'react'
import { LucideIcon } from 'lucide-react'

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ').trim()
}

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  variant?: 'primary' | 'secondary' | 'danger'
}

export function AdminButton({ 
  children, 
  icon: Icon, 
  variant = 'primary', 
  className, 
  ...props 
}: AdminButtonProps) {
  
  const baseStyles = "flex items-center justify-center gap-2 px-6 py-3 font-sans text-xs uppercase tracking-widest font-bold transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-feps-navy text-white border border-feps-navy hover:bg-feps-ink hover:border-feps-ink",
    secondary: "bg-feps-paper text-feps-ink border border-feps-border hover:bg-feps-ink/5",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white"
  }

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)} 
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}
