'use client'

import { useState, useRef, useEffect } from 'react'
import { FileText, Briefcase, AlertCircle } from 'lucide-react'

const MIN_LENGTH = 100
const MAX_LENGTH = 6000

const charCount = (text) => text.length
const isValid = (text) => text.trim().length >= MIN_LENGTH && text.length <= MAX_LENGTH

export default function InputForm({ onSubmit, isLoading }) {
  const [jdText, setJdText] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [touched, setTouched] = useState({ jd: false, resume: false })

  const jdValid = isValid(jdText)
  const resumeValid = isValid(resumeText)
  const canSubmit = jdValid && resumeValid && !isLoading

  const getFieldError = (text, fieldTouched) => {
    if (!fieldTouched) return null
    if (text.trim().length === 0) return 'This field is required.'
    if (text.trim().length < MIN_LENGTH) return `Too short — paste the full text (min ${MIN_LENGTH} characters).`
    if (text.length > MAX_LENGTH) return `Too long — keep it under ${MAX_LENGTH.toLocaleString()} characters.`
    return null
  }

  const jdError = getFieldError(jdText, touched.jd)
  const resumeError = getFieldError(resumeText, touched.resume)

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ jd: true, resume: true })
    if (!canSubmit) return
    onSubmit({ jdText, resumeText })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Job Description */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="jd-textarea"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300"
          >
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Job Description
          </label>
          <div className={`relative rounded-xl overflow-hidden transition-all duration-200 ${jdError ? 'ring-1 ring-red-500/50' : ''}`}>
            <textarea
              id="jd-textarea"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, jd: true }))}
              placeholder="Paste the full job description here…&#10;&#10;Include requirements, responsibilities, and any technical stack mentions."
              rows={14}
              maxLength={MAX_LENGTH + 100}
              disabled={isLoading}
              className="textarea-field scrollbar-thin"
              style={{ background: 'rgba(15, 15, 26, 0.6)' }}
              aria-describedby="jd-error jd-hint"
              aria-invalid={!!jdError}
            />
          </div>
          <div className="flex items-start justify-between gap-2">
            <div id="jd-error" className="min-h-[20px]">
              {jdError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {jdError}
                </p>
              )}
            </div>
            <span
              id="jd-hint"
              className={`text-xs flex-shrink-0 tabular-nums ${
                jdText.length > MAX_LENGTH
                  ? 'text-red-400'
                  : jdText.length >= MIN_LENGTH
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              {charCount(jdText).toLocaleString()} / {MAX_LENGTH.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Resume */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="resume-textarea"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            Your Resume
          </label>
          <div className={`relative rounded-xl overflow-hidden transition-all duration-200 ${resumeError ? 'ring-1 ring-red-500/50' : ''}`}>
            <textarea
              id="resume-textarea"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, resume: true }))}
              placeholder="Paste your resume here as plain text…&#10;&#10;Include work experience, skills, projects, and education."
              rows={14}
              maxLength={MAX_LENGTH + 100}
              disabled={isLoading}
              className="textarea-field scrollbar-thin"
              style={{ background: 'rgba(15, 15, 26, 0.6)' }}
              aria-describedby="resume-error resume-hint"
              aria-invalid={!!resumeError}
            />
          </div>
          <div className="flex items-start justify-between gap-2">
            <div id="resume-error" className="min-h-[20px]">
              {resumeError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {resumeError}
                </p>
              )}
            </div>
            <span
              id="resume-hint"
              className={`text-xs flex-shrink-0 tabular-nums ${
                resumeText.length > MAX_LENGTH
                  ? 'text-red-400'
                  : resumeText.length >= MIN_LENGTH
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              {charCount(resumeText).toLocaleString()} / {MAX_LENGTH.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          id="analyze-btn"
          type="submit"
          disabled={!canSubmit}
          className="btn-primary flex items-center gap-3 text-base min-w-[200px] justify-center"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Analyze Gap
            </>
          )}
        </button>
      </div>
    </form>
  )
}
