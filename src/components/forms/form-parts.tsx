"use client";

import Link from "@/components/ui/link";
import type { ReactNode } from "react";
import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WithPending } from "@/components/ui/pending";
import { PENDING, site } from "@/lib/site";
import { cn } from "@/lib/utils/format";

export const inputClass =
  "w-full border-b border-line bg-transparent py-3 text-base text-fg outline-none transition-colors " +
  "placeholder:text-subtle focus:border-accent aria-[invalid=true]:border-[var(--danger)]";

export const selectClass = cn(inputClass, "appearance-none bg-bg pr-8 [&>option]:bg-bg-elevated");

export const chipClass =
  "inline-block border border-line px-4 py-2 text-xs text-muted transition-colors " +
  "peer-checked:border-accent peer-checked:bg-accent peer-checked:text-inverse " +
  "peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--focus-ring)] hover:text-fg";

export const errorId = (id: string) => `${id}-error`;

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={errorId(id)} role="alert" className="text-xs text-[var(--danger)]">
      {message}
    </p>
  );
}

/** Etiqueta + control + error. El control debe llevar `id` y `aria-describedby={errorId(id)}`. */
export function Field({
  id,
  label,
  error,
  optional,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="text-xs tracking-[0.18em] text-muted uppercase">
        {label}
        {optional && (
          <span className="ml-2 tracking-normal text-subtle normal-case">(opcional)</span>
        )}
      </label>
      {children}
      <FieldError id={id} message={error} />
    </div>
  );
}

/** Props ARIA de un control según su error. */
export const ariaFor = (id: string, error?: unknown) => ({
  id,
  "aria-invalid": !!error,
  "aria-describedby": error ? errorId(id) : undefined,
});

type PersonValues = FieldValues & {
  name: string;
  lastName?: string;
  email: string;
  phone: string;
  privacy: true;
  marketing: boolean;
  website?: string;
};

/** Nombre, apellidos, email y teléfono. */
export function PersonFields<T extends PersonValues>({
  id,
  register,
  errors,
}: {
  id: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}) {
  const reg = (name: keyof PersonValues) => register(name as Path<T>);
  const err = (name: keyof PersonValues) => errors[name]?.message as string | undefined;
  return (
    <div className="grid gap-7 sm:grid-cols-2">
      <Field id={`${id}-name`} label="Nombre" error={err("name")}>
        <input
          autoComplete="given-name"
          className={inputClass}
          {...ariaFor(`${id}-name`, err("name"))}
          {...reg("name")}
        />
      </Field>
      <Field id={`${id}-lastName`} label="Apellidos" optional>
        <input
          id={`${id}-lastName`}
          autoComplete="family-name"
          className={inputClass}
          {...reg("lastName")}
        />
      </Field>
      <Field id={`${id}-email`} label="Email" error={err("email")}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          className={inputClass}
          {...ariaFor(`${id}-email`, err("email"))}
          {...reg("email")}
        />
      </Field>
      <Field id={`${id}-phone`} label="Teléfono" error={err("phone")}>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={inputClass}
          {...ariaFor(`${id}-phone`, err("phone"))}
          {...reg("phone")}
        />
      </Field>
    </div>
  );
}

/**
 * Honeypot + consentimientos RGPD (sin marcar y separados) + capa de información básica.
 */
export function ConsentFields<T extends PersonValues>({
  id,
  register,
  errors,
  purpose = "Atender tu solicitud",
}: {
  id: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  purpose?: string;
}) {
  const privacyError = errors.privacy?.message as string | undefined;
  return (
    <>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>No rellenes este campo</label>
        <input
          id={`${id}-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website" as Path<T>)}
        />
      </div>
      <div className="flex flex-col gap-4 text-sm">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            aria-invalid={!!privacyError}
            aria-describedby={privacyError ? errorId(`${id}-privacy`) : undefined}
            className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
            {...register("privacy" as Path<T>)}
          />
          <span className="text-muted">
            He leído y acepto la{" "}
            <Link href="/politica-privacidad" className="text-fg underline underline-offset-4">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        <FieldError id={`${id}-privacy`} message={privacyError} />
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
            {...register("marketing" as Path<T>)}
          />
          <span className="text-muted">
            Quiero recibir novedades del stock y ofertas de Veloce Cars por email o WhatsApp
            (opcional).
          </span>
        </label>
      </div>
      <DataProtectionInfo purpose={purpose} />
    </>
  );
}

export function DataProtectionInfo({ purpose }: { purpose: string }) {
  return (
    <details className="text-xs leading-relaxed text-subtle">
      <summary className="cursor-pointer text-muted hover:text-fg">
        Información básica sobre protección de datos
      </summary>
      <dl className="mt-3 grid gap-1 sm:grid-cols-[9rem_1fr]">
        <dt className="text-muted">Responsable</dt>
        <dd>
          {site.company.legalName} ({site.company.taxId})
        </dd>
        <dt className="text-muted">Finalidad</dt>
        <dd>{purpose} y, solo si lo marcas, enviarte comunicaciones comerciales.</dd>
        <dt className="text-muted">Legitimación</dt>
        <dd>Tu consentimiento.</dd>
        <dt className="text-muted">Destinatarios</dt>
        <dd>
          No se ceden datos a terceros salvo obligación legal. Proveedores de correo y alojamiento
          como encargados del tratamiento.{" "}
          <WithPending text={PENDING("lista definitiva de encargados del tratamiento")} />
        </dd>
        <dt className="text-muted">Derechos</dt>
        <dd>
          Acceso, rectificación, supresión, oposición, limitación y portabilidad en{" "}
          <a href={`mailto:${site.contact.privacyEmail}`} className="underline underline-offset-4">
            {site.contact.privacyEmail}
          </a>
          . Más información en la{" "}
          <Link href="/politica-privacidad" className="underline underline-offset-4">
            política de privacidad
          </Link>
          .
        </dd>
      </dl>
    </details>
  );
}

export function SubmitButton({
  pending,
  label,
  className,
}: {
  pending: boolean;
  label: string;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      variant="solid"
      disabled={pending}
      className={cn("self-start", className)}
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? "Enviando…" : label}
    </Button>
  );
}

export function ServerError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-[var(--danger)]/50 p-4 text-sm">
      {message}
    </p>
  );
}

export function FormSuccess({
  title,
  children,
  onReset,
  className,
}: {
  title: string;
  children: ReactNode;
  onReset?: () => void;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn("flex flex-col items-start gap-4 border border-line p-8", className)}
    >
      <span className="grid size-10 place-items-center rounded-full bg-accent text-inverse">
        <Check className="size-5" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="font-display text-2xl">{title}</p>
      <div className="text-muted">{children}</div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-muted underline underline-offset-4 hover:text-fg"
        >
          Enviar otra solicitud
        </button>
      )}
    </div>
  );
}

/** POST JSON o FormData y devuelve el error legible si lo hay. */
export async function postForm(url: string, body: unknown): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      method: "POST",
      ...(body instanceof FormData
        ? { body }
        : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok)
      return json.error ?? "No hemos podido enviar tu solicitud. Inténtalo de nuevo.";
  } catch {
    return "Sin conexión. Revisa tu red e inténtalo de nuevo.";
  }
}
