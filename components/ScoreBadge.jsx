'use client'

export default function ScoreBadge({ score }) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)))

  const getColor = () => {
    if (clampedScore >= 71) return { ring: '#22c55e', glow: 'rgba(34, 197, 94, 0.25)', text: '#86efac', label: 'Strong Match' }
    if (clampedScore >= 40) return { ring: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', text: '#fcd34d', label: 'Partial Match' }
    return { ring: '#ef4444', glow: 'rgba(239, 68, 68, 0.25)', text: '#fca5a5', label: 'Weak Match' }
  }

  const { ring, glow, text, label } = getColor()

  // SVG circle parameters
  const size = 160
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedScore / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Match score: ${clampedScore} out of 100 — ${label}`}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40"
          style={{ background: glow }}
        />

        {/* SVG ring */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 -rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ring}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 8px ${ring})`,
            }}
          />
        </svg>

        {/* Inner content */}
        <div className="relative flex flex-col items-center">
          <span
            className="text-4xl font-bold tabular-nums leading-none"
            style={{ color: text }}
          >
            {clampedScore}
          </span>
          <span className="text-xs text-slate-400 mt-1 font-medium">/ 100</span>
        </div>
      </div>

      {/* Label badge */}
      <div
        className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
        style={{
          background: `${glow}`,
          border: `1px solid ${ring}40`,
          color: text,
        }}
      >
        {label}
      </div>

      <p className="text-xs text-slate-500 text-center max-w-[160px]">
        How well your resume matches this JD
      </p>
    </div>
  )
}
