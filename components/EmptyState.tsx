import React from 'react'

export function EmptyState({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 1.5rem',
      color: 'var(--feps-muted)',
      background: 'var(--feps-surface-alt)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--feps-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem'
    }}>
      <div style={{ 
        fontSize: '2.5rem', 
        marginBottom: '0.5rem',
        opacity: 0.8,
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: 'var(--feps-ink)',
        margin: 0
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.9rem',
        maxWidth: '400px',
        margin: '0 auto',
        lineHeight: 1.5
      }}>
        {description}
      </p>
      {children && (
        <div style={{ marginTop: '1rem' }}>
          {children}
        </div>
      )}
    </div>
  )
}
