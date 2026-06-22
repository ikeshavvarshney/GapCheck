'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react'

function MissingSkillItem({ skill, importance, reason }) {
  const [expanded, setExpanded] = useState(false)

  const config = {
    critical: {
      pillClass: 'skill-pill-red',
      label: 'Critical',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    important: {
      pillClass: 'skill-pill-amber',
      label: 'Important',
      icon: <Info className="w-3 h-3" />,
    },
    'nice-to-have': {
      pillClass: 'skill-pill-blue',
      label: 'Nice-to-have',
      icon: <Info className="w-3 h-3" />,
    },
  }

  const cfg = config[importance] || config['nice-to-have']

  return (
    <div className="group">
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`${cfg.pillClass} cursor-pointer hover:opacity-90 transition-opacity`}
        aria-expanded={expanded}
        aria-label={`${skill} — ${cfg.label}. ${expanded ? 'Collapse' : 'Expand'} reason.`}
      >
        {cfg.icon}
        <span>{skill}</span>
        {expanded ? (
          <ChevronUp className="w-3 h-3 ml-0.5" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-0.5" />
        )}
      </button>
      {expanded && reason && (
        <div
          className="mt-2 ml-1 text-xs text-slate-400 bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/40 animate-fade-in max-w-sm"
          role="tooltip"
        >
          {reason}
        </div>
      )}
    </div>
  )
}

export default function SkillPills({ matchedSkills = [], missingSkills = [] }) {
  const critical = missingSkills.filter((s) => s.importance === 'critical')
  const important = missingSkills.filter((s) => s.importance === 'important')
  const niceToHave = missingSkills.filter((s) => s.importance === 'nice-to-have')

  return (
    <div className="space-y-6">
      {/* Matched Skills */}
      {matchedSkills.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Matched Skills ({matchedSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill, i) => (
              <span key={i} className="skill-pill-green">
                <CheckCircle2 className="w-3 h-3" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills by importance */}
      {missingSkills.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Skills to Develop ({missingSkills.length})
          </h3>
          <p className="text-xs text-slate-500 mb-3">Click a skill to see why it matters for this role.</p>

          {critical.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-red-400/70 font-medium mb-2">🔴 Critical</p>
              <div className="flex flex-wrap gap-2">
                {critical.map((item, i) => (
                  <MissingSkillItem key={i} {...item} />
                ))}
              </div>
            </div>
          )}

          {important.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-amber-400/70 font-medium mb-2">🟡 Important</p>
              <div className="flex flex-wrap gap-2">
                {important.map((item, i) => (
                  <MissingSkillItem key={i} {...item} />
                ))}
              </div>
            </div>
          )}

          {niceToHave.length > 0 && (
            <div>
              <p className="text-xs text-indigo-400/70 font-medium mb-2">🔵 Nice-to-have</p>
              <div className="flex flex-wrap gap-2">
                {niceToHave.map((item, i) => (
                  <MissingSkillItem key={i} {...item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {matchedSkills.length === 0 && missingSkills.length === 0 && (
        <p className="text-sm text-slate-500 italic">No skill data available.</p>
      )}
    </div>
  )
}
