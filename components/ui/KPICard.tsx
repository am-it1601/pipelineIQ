'use client';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: number; // percent change (positive or negative)
  icon?: React.ReactNode;
  accentColor?: string;
  highlight?: boolean;
}

export default function KPICard({
  title,
  value,
  subtitle,
  delta,
  icon,
  accentColor = '#6366f1',
  highlight = false,
}: KPICardProps) {
  const deltaPositive = delta !== undefined && delta >= 0;
  const deltaColor = delta === undefined ? undefined : deltaPositive ? '#10b981' : '#ef4444';

  return (
    <div
      className="animate-fade-in"
      style={{
        background: highlight
          ? `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)`
          : 'var(--surface)',
        border: `1px solid ${highlight ? `${accentColor}44` : 'var(--border)'}`,
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${accentColor}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Accent glow strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{title}</div>
        {icon && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${accentColor}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {delta !== undefined && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: deltaColor,
              background: `${deltaColor}22`,
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {deltaPositive ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
        {subtitle && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subtitle}</span>
        )}
      </div>
    </div>
  );
}
