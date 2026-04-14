'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card
      className={`hover:!shadow !shadow-sm animate-fade-in relative overflow-hidden transition-all duration-150 ease-in-out hover:-translate-y-[2px] ${highlight ? 'shadow-md border-opacity-50' : ''}`}
      style={{
        background: highlight
          ? `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)`
          : 'var(--surface)',
        borderColor: highlight ? `${accentColor}44` : 'var(--border)',
      }}
      // onMouseEnter={(e) => {
      //   (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${accentColor}22`;
      // }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Accent glow strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />

      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground" style={{ color: 'var(--text-muted)' }}>
          {title}
        </CardTitle>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${accentColor}22`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-bold leading-none mb-1.5" style={{ color: 'var(--text)' }}>
          {value}
        </div>

        <div className="flex items-center gap-2">
          {delta !== undefined && (
            <span
              className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
              style={{ color: deltaColor, background: `${deltaColor}22` }}
            >
              {deltaPositive ? '+' : ''}{delta.toFixed(1)}%
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] text-muted-foreground" style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
