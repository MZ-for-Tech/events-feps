import React from 'react'

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ').trim()
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="bg-feps-paper border border-feps-ink/20 overflow-x-auto shadow-sm">
      <table className={cn("w-full text-left rtl:text-right text-sm", className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-feps-ink/5 border-b border-feps-ink/20", className)} {...props} />
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-feps-ink/10", className)} {...props} />
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-feps-ink/5 transition-colors", className)} {...props} />
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("p-4 font-bold uppercase tracking-wider text-feps-ink-secondary text-xs", className)} {...props} />
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("p-4 align-middle", className)} {...props} />
}
