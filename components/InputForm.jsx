'use client'

import { useState, useRef } from 'react'
import { FileText, Briefcase, AlertCircle, Upload, X, Loader2, CheckCircle2 } from 'lucide-react'

const MIN_LENGTH = 100
const MAX_LENGTH = 6000
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']

const charCount = (text) => text.length
const isValid = (text) => text.trim().length >= MIN_LENGTH && text.length <= MAX_LENGTH

// ─── File Upload Zone ─────────────────────────────────────────────────────────
// Encapsulates all upload state for a single field (JD or Resume).
// On success: calls onParsed(text). On failure: calls onError(msg).
// Always leaves the textarea as the source of truth — it never touches text directly.

function FileUploadZone({ fieldId, onParsed, onError, onStartParsing, onClear, isLoading, uploadState }) {
  const inputRef = useRef(null)

  const { status, filename, errorMsg } = uploadState
  // status: 'idle' | 'parsing' | 'done' | 'error'

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    // Reset the input so the same file can be re-selected after a clear
    if (inputRef.current) inputRef.current.value = ''
    if (!file) return

    // ── Client-side validation ──────────────────────────────────────────────

    const ext = ('.' + file.name.split('.').pop()).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      onError(
        file.name,
        `Unsupported file type. Please upload a PDF (.pdf) or Word document (.docx).`
      )
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      onError(
        file.name,
        `File too large — please upload a file under 5 MB, or paste the text directly.`
      )
      return
    }

    // ── Notify parent that parsing is starting ────────────────────────────────
    onStartParsing(file.name)

    // ── Send to server for parsing ──────────────────────────────────────────
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        onError(file.name, data?.error || `Failed to parse file (${res.status}).`)
        return
      }

      // Truncate if over the cap, then notify parent
      let text = data.text || ''
      let truncated = false
      if (text.length > MAX_LENGTH) {
        text = text.slice(0, MAX_LENGTH)
        truncated = true
      }

      onParsed(file.name, text, truncated)
    } catch (fetchErr) {
      console.error('parse-file fetch error:', fetchErr)
      onError(file.name, 'Network error — could not parse the file. Please paste the text manually.')
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Upload button row */}
      <div className="flex items-center gap-2 flex-wrap">
        <label
          htmlFor={`${fieldId}-file-input`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 select-none ${
            isLoading || status === 'parsing'
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:opacity-90 active:scale-95'
          }`}
          style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: '#a5b4fc',
          }}
          aria-disabled={isLoading || status === 'parsing'}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload PDF or DOCX
          <input
            ref={inputRef}
            id={`${fieldId}-file-input`}
            type="file"
            accept=".pdf,.docx"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isLoading || status === 'parsing'}
            aria-label={`Upload file for ${fieldId}`}
          />
        </label>

        {/* Parsing spinner */}
        {status === 'parsing' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Parsing {filename}…
          </span>
        )}

        {/* Done badge + clear */}
        {status === 'done' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="max-w-[160px] truncate" title={filename}>{filename}</span>
            <button
              type="button"
              onClick={onClear}
              className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 transition-colors"
              aria-label={`Remove ${filename}`}
              title="Remove file"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Error badge + clear */}
        {status === 'error' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="max-w-[120px] truncate" title={filename}>{filename}</span>
            <button
              type="button"
              onClick={onClear}
              className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 transition-colors"
              aria-label="Dismiss error"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
      </div>

      {/* Inline parse error message */}
      {status === 'error' && errorMsg && (
        <p className="text-xs text-red-400 leading-snug pl-0.5">
          {errorMsg}
        </p>
      )}
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function InputForm({ onSubmit, isLoading }) {
  const [jdText, setJdText] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [touched, setTouched] = useState({ jd: false, resume: false })

  // Upload state for each field: { status, filename, errorMsg, truncated }
  const [jdUpload, setJdUpload] = useState({ status: 'idle', filename: '', errorMsg: '', truncated: false })
  const [resumeUpload, setResumeUpload] = useState({ status: 'idle', filename: '', errorMsg: '', truncated: false })

  const jdValid = isValid(jdText)
  const resumeValid = isValid(resumeText)
  const isParsing = jdUpload.status === 'parsing' || resumeUpload.status === 'parsing'
  const canSubmit = jdValid && resumeValid && !isLoading && !isParsing

  const getFieldError = (text, fieldTouched) => {
    if (!fieldTouched) return null
    if (text.trim().length === 0) return 'This field is required.'
    if (text.trim().length < MIN_LENGTH) return `Too short — paste the full text (min ${MIN_LENGTH} characters).`
    if (text.length > MAX_LENGTH) return `Too long — keep it under ${MAX_LENGTH.toLocaleString()} characters.`
    return null
  }

  const jdError = getFieldError(jdText, touched.jd)
  const resumeError = getFieldError(resumeText, touched.resume)

  const handleJdClear = () =>
    setJdUpload({ status: 'idle', filename: '', errorMsg: '', truncated: false })

  const handleResumeClear = () =>
    setResumeUpload({ status: 'idle', filename: '', errorMsg: '', truncated: false })

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ jd: true, resume: true })
    if (!canSubmit) return
    onSubmit({ jdText, resumeText })
  }


  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* ── Job Description ── */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="jd-textarea"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300"
          >
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Job Description
          </label>

          {/* File upload zone */}
          <FileUploadZone
            fieldId="jd"
            uploadState={jdUpload}
            isLoading={isLoading}
            onParsed={(filename, text, truncated) => {
              setJdUpload({ status: 'done', filename, errorMsg: '', truncated })
              setJdText(text)
              setTouched((prev) => ({ ...prev, jd: true }))
            }}
            onError={(filename, errorMsg) =>
              setJdUpload({ status: 'error', filename, errorMsg, truncated: false })
            }
            onStartParsing={(filename) =>
              setJdUpload({ status: 'parsing', filename, errorMsg: '', truncated: false })
            }
            onClear={handleJdClear}
          />

          {/* Truncation notice */}
          {jdUpload.truncated && (
            <p className="text-xs text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              JD text truncated to {MAX_LENGTH.toLocaleString()} characters.
            </p>
          )}

          <div className={`relative rounded-xl overflow-hidden transition-all duration-200 ${jdError ? 'ring-1 ring-red-500/50' : ''}`}>
            <textarea
              id="jd-textarea"
              value={jdText}
              onChange={(e) => {
                setJdText(e.target.value)
                // If user edits after a file was parsed, mark as manually edited
                // but keep the done badge (it's still informational)
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, jd: true }))}
              placeholder={
                jdUpload.status === 'parsing'
                  ? 'Parsing file…'
                  : 'Paste the full job description here…\n\nOr upload a PDF or DOCX above — the extracted text will appear here.'
              }
              rows={14}
              maxLength={MAX_LENGTH + 100}
              disabled={isLoading || jdUpload.status === 'parsing'}
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

        {/* ── Resume ── */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="resume-textarea"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            Your Resume
          </label>

          {/* File upload zone */}
          <FileUploadZone
            fieldId="resume"
            uploadState={resumeUpload}
            isLoading={isLoading}
            onParsed={(filename, text, truncated) => {
              setResumeUpload({ status: 'done', filename, errorMsg: '', truncated })
              setResumeText(text)
              setTouched((prev) => ({ ...prev, resume: true }))
            }}
            onError={(filename, errorMsg) =>
              setResumeUpload({ status: 'error', filename, errorMsg, truncated: false })
            }
            onStartParsing={(filename) =>
              setResumeUpload({ status: 'parsing', filename, errorMsg: '', truncated: false })
            }
            onClear={handleResumeClear}
          />

          {/* Truncation notice */}
          {resumeUpload.truncated && (
            <p className="text-xs text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              Resume text truncated to {MAX_LENGTH.toLocaleString()} characters.
            </p>
          )}

          <div className={`relative rounded-xl overflow-hidden transition-all duration-200 ${resumeError ? 'ring-1 ring-red-500/50' : ''}`}>
            <textarea
              id="resume-textarea"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, resume: true }))}
              placeholder={
                resumeUpload.status === 'parsing'
                  ? 'Parsing file…'
                  : 'Paste your resume here as plain text…\n\nOr upload a PDF or DOCX above — the extracted text will appear here.'
              }
              rows={14}
              maxLength={MAX_LENGTH + 100}
              disabled={isLoading || resumeUpload.status === 'parsing'}
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

      {/* ── Submit Button ── */}
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
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing…
            </>
          ) : isParsing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Parsing file…
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
