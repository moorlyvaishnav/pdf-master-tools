"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Eye, EyeOff, Lock, ShieldCheck, TriangleAlert } from "lucide-react";
import { Dropzone } from "../dropzone";
import { ErrorAlert, ProgressBar, ResultPanel } from "../status";
import { FileHeader, LoadingFile, ToolFrame } from "../tool-frame";
import { useJob, usePdfFile } from "../hooks";
import { btnPrimary, inputClass } from "../ui";
import { baseName } from "@/lib/pdf/files";
import { MIN_PASSWORD_LENGTH, passwordStrength, protectPdf } from "@/lib/pdf/encrypt";
import { downloadFile, pdfBlob } from "@/lib/pdf/download";

const STRENGTH_COLORS = ["bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];

export function ProtectPdfTool() {
  const source = usePdfFile();
  const pdf = source.pdf;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const job = useJob();
  const busy = job.status === "processing";

  const strength = passwordStrength(password);
  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  const ready = password.length >= MIN_PASSWORD_LENGTH && confirm === password;

  function reset() {
    source.clear();
    setPassword("");
    setConfirm("");
    setShow(false);
    job.reset();
  }

  function protect() {
    if (!pdf || !ready) return;
    const pw = password;
    void job.run(async (onProgress) => {
      const bytes = await protectPdf({ name: pdf.file.name, bytes: pdf.bytes }, { password: pw }, onProgress);
      return {
        file: { name: `${baseName(pdf.file.name)}-protected.pdf`, blob: pdfBlob(bytes) },
        summary: "Encrypted with AES-256. The password is now needed to open this file.",
      };
    });
  }

  return (
    <ToolFrame>
      {!pdf ? (
        source.loading ? <LoadingFile /> : <Dropzone accept=".pdf,application/pdf" acceptLabel="PDF" multiple={false} onFiles={source.select} />
      ) : (
        <>
          <FileHeader name={pdf.file.name} size={pdf.file.size} pageCount={pdf.pageCount} onRemove={reset} disabled={busy} />

          {!job.result && (
            <form
              className="space-y-4"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                protect();
              }}
            >
              <fieldset className="grid gap-3 sm:grid-cols-2" disabled={busy}>
                <legend className="sr-only">Password</legend>
                <label className="text-sm font-semibold text-ink">
                  Password
                  <input
                    className={`${inputClass} mt-1.5`}
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      job.invalidate();
                      setPassword(e.target.value);
                    }}
                    data-testid="pw"
                  />
                </label>
                <label className="text-sm font-semibold text-ink">
                  Confirm password
                  <input
                    className={`${inputClass} mt-1.5`}
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      job.invalidate();
                      setConfirm(e.target.value);
                    }}
                    aria-invalid={mismatch}
                    data-testid="pw-confirm"
                  />
                </label>
              </fieldset>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2" aria-live="polite">
                  <span className="flex gap-1" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={`h-1.5 w-8 rounded-full ${password && i < Math.max(1, strength.score) ? STRENGTH_COLORS[strength.score] : "bg-slate-200"}`} />
                    ))}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{password ? `Strength: ${strength.label}` : `At least ${MIN_PASSWORD_LENGTH} characters`}</span>
                </div>
                <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-ink" onClick={() => setShow((s) => !s)}>
                  {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  {show ? "Hide password" : "Show password"}
                </button>
              </div>
              {tooShort && <ErrorAlert message={`Use at least ${MIN_PASSWORD_LENGTH} characters. Longer passwords are much safer.`} />}
              {mismatch && <ErrorAlert message="The two passwords don't match." />}

              <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-200">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>
                    <strong className="text-ink">AES-256 encryption</strong> (the PDF 2.0 standard, as used by Adobe Acrobat). The whole
                    document - pages, images and document details - is encrypted in your browser and can only be opened with the
                    password. Opening it needs Adobe Reader X or newer, or another up-to-date PDF app.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>
                    <strong className="text-ink">There is no way to recover a forgotten password</strong> - not even for us. The
                    protection is only as strong as your password: short or common passwords can be guessed. Anyone who knows the
                    password can open, print and copy the file.
                  </span>
                </p>
              </div>
              <button type="submit" className={`${btnPrimary} w-full sm:w-auto`} disabled={busy || !ready} data-testid="process">
                <Lock className="h-5 w-5" aria-hidden="true" />
                {busy ? "Encrypting…" : "Protect PDF"}
              </button>
            </form>
          )}
        </>
      )}

      {source.error && <ErrorAlert message={source.error} onDismiss={() => source.setError(null)} />}
      {job.error && <ErrorAlert message={job.error} onDismiss={() => job.setError(null)} />}
      {busy && <ProgressBar value={job.progress} label={job.label} />}

      {job.result && (
        <ResultPanel
          fileName={job.result.name}
          size={job.result.blob.size}
          summary={job.result.summary}
          onDownload={() => job.result && downloadFile(job.result)}
          onReset={reset}
        />
      )}
    </ToolFrame>
  );
}
