"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FUELS, TRANSMISSIONS } from "@/lib/inventory/types";
import { site } from "@/lib/site";
import { compressImage } from "@/lib/utils/image-compress";
import { cn } from "@/lib/utils/format";
import {
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_TOTAL_BYTES,
  VALUATION_STEPS,
  VEHICLE_CONDITIONS,
  valuationSchema,
  type ValuationData,
  type ValuationInput,
} from "@/lib/validation/valuation";
import {
  ConsentFields,
  Field,
  FormSuccess,
  PersonFields,
  ServerError,
  SubmitButton,
  ariaFor,
  chipClass,
  inputClass,
  postForm,
  selectClass,
} from "./form-parts";

const STORAGE_KEY = "vc-tasacion";
type Photo = { file: File; url: string };

/**
 * Tasación en 3 pasos con barra de progreso. Cada paso valida solo sus campos; el progreso
 * (sin fotos) se guarda en sessionStorage para no perderlo al recargar.
 */
export function ValuationForm({ brands }: { brands: string[] }) {
  const id = useId();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ValuationInput, unknown, ValuationData>({
    resolver: zodResolver(valuationSchema),
    mode: "onTouched",
    defaultValues: { vehicleType: "turismo", marketing: false, website: "" },
  });

  // Restaurar y guardar el progreso.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { values, step: savedStep } = JSON.parse(saved) as {
          values: ValuationInput;
          step: number;
        };
        reset({ ...values, privacy: undefined as unknown as true, website: "" });
        setStep(Math.min(savedStep, VALUATION_STEPS.length - 1));
      }
    } catch {
      /* almacenamiento no disponible */
    }
  }, [reset]);
  useEffect(() => {
    const persist = (values: Partial<ValuationInput>) => {
      try {
        const { privacy: _p, website: _w, ...rest } = values;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ values: rest, step }));
      } catch {
        /* sin almacenamiento */
      }
    };
    persist(getValues()); // también al cambiar de paso
    const sub = watch(persist);
    return () => sub.unsubscribe();
  }, [watch, getValues, step]);
  // Liberar las vistas previas al desmontar.
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const fieldsOf = (i: number) =>
    Object.keys(VALUATION_STEPS[i]!.schema.shape) as (keyof ValuationInput)[];

  const next = async () => {
    if (await trigger(fieldsOf(step), { shouldFocus: true })) {
      setStep((s) => s + 1);
      document
        .getElementById(`${id}-progress`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoError(undefined);
    const room = MAX_PHOTOS - photos.length;
    const picked = [...files].filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (files.length > room) setPhotoError(`Puedes subir hasta ${MAX_PHOTOS} fotos.`);
    const compressed = await Promise.all(picked.map((f) => compressImage(f, 1400, 0.78)));
    let total = photos.reduce((sum, p) => sum + p.file.size, 0);
    const ok = compressed.filter((f) => {
      if (f.size > MAX_PHOTO_BYTES || total + f.size > MAX_PHOTOS_TOTAL_BYTES) return false;
      total += f.size;
      return true;
    });
    if (ok.length < compressed.length)
      setPhotoError(
        "Alguna foto no se ha añadido por tamaño. Puedes enviarnos el resto por WhatsApp.",
      );
    setPhotos((prev) => [...prev, ...ok.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };

  const removePhoto = (i: number) =>
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[i]!.url);
      return prev.filter((_, j) => j !== i);
    });

  const onSubmit = async (data: ValuationData) => {
    const body = new FormData();
    body.set("data", JSON.stringify(data));
    photos.forEach((p) => body.append("photos", p.file, p.file.name));
    const error = await postForm("/api/valuation", body);
    setServerError(error);
    if (!error) {
      setSent(true);
      setPhotos([]);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* nada */
      }
    }
  };

  if (sent) {
    return (
      <FormSuccess title="Solicitud de tasación recibida">
        Te enviaremos la valoración en menos de 24 horas. Si necesitamos algún dato más, te
        llamaremos. ¿Prisa? Escríbenos por WhatsApp al {site.contact.phone.display}.
      </FormSuccess>
    );
  }

  const err = (name: keyof ValuationInput) => errors[name]?.message as string | undefined;
  const progress = ((step + 1) / VALUATION_STEPS.length) * 100;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="relative flex flex-col gap-10"
      data-testid="valuation-form"
    >
      {/* Progreso */}
      <div id={`${id}-progress`} className="scroll-mt-32">
        <ol className="mb-4 grid grid-cols-3 gap-4 text-xs tracking-[0.14em] uppercase">
          {VALUATION_STEPS.map((s, i) => (
            <li
              key={s.title}
              aria-current={i === step ? "step" : undefined}
              className={cn("flex items-center gap-2", i <= step ? "text-fg" : "text-subtle")}
            >
              <span className="tabular">{String(i + 1).padStart(2, "0")}</span>
              <span className="hidden sm:inline">{s.title}</span>
            </li>
          ))}
        </ol>
        <div
          role="progressbar"
          aria-label="Progreso de la tasación"
          aria-valuemin={1}
          aria-valuemax={VALUATION_STEPS.length}
          aria-valuenow={step + 1}
          aria-valuetext={`Paso ${step + 1} de ${VALUATION_STEPS.length}: ${VALUATION_STEPS[step]!.title}`}
          className="h-px w-full bg-line"
        >
          <div
            className="h-px bg-accent transition-[width] duration-700 ease-luxe"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <fieldset
        key={step}
        className="flex flex-col gap-7 motion-safe:animate-[step-in_350ms_var(--ease-luxe)]"
      >
        <legend className="mb-6 font-display text-2xl">{VALUATION_STEPS[step]!.title}</legend>

        {step === 0 && (
          <>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de vehículo">
              {(
                [
                  ["turismo", "Turismo", "Berlina, SUV, coupé, cabrio, monovolumen…"],
                  ["industrial", "Vehículo industrial", "Furgón, furgoneta…"],
                ] as const
              ).map(([value, label, hint]) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    value={value}
                    className="peer sr-only"
                    {...register("vehicleType")}
                  />
                  <span className={cn(chipClass, "flex flex-col gap-1 px-5 py-3 text-left")}>
                    <span className="text-sm">{label}</span>
                    <span className="text-[0.6875rem] opacity-80">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="grid gap-7 sm:grid-cols-2">
              <Field id={`${id}-brand`} label="Marca" error={err("brand")}>
                <input
                  list={`${id}-brands`}
                  autoComplete="off"
                  className={inputClass}
                  {...ariaFor(`${id}-brand`, err("brand"))}
                  {...register("brand")}
                />
                <datalist id={`${id}-brands`}>
                  {brands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </Field>
              <Field id={`${id}-model`} label="Modelo" error={err("model")}>
                <input
                  className={inputClass}
                  {...ariaFor(`${id}-model`, err("model"))}
                  {...register("model")}
                />
              </Field>
              <Field id={`${id}-year`} label="Año de matriculación" error={err("year")}>
                <input
                  type="number"
                  inputMode="numeric"
                  className={inputClass}
                  {...ariaFor(`${id}-year`, err("year"))}
                  {...register("year")}
                />
              </Field>
              <Field id={`${id}-version`} label="Versión" optional>
                <input
                  id={`${id}-version`}
                  placeholder="p. ej. Carrera 4 GTS"
                  className={inputClass}
                  {...register("version")}
                />
              </Field>
              <Field id={`${id}-plate`} label="Matrícula" optional error={err("plate")}>
                <input
                  autoCapitalize="characters"
                  className={cn(inputClass, "uppercase")}
                  {...ariaFor(`${id}-plate`, err("plate"))}
                  {...register("plate")}
                />
              </Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-7 sm:grid-cols-2">
              <Field id={`${id}-km`} label="Kilómetros" error={err("mileageKm")}>
                <input
                  type="number"
                  inputMode="numeric"
                  className={inputClass}
                  {...ariaFor(`${id}-km`, err("mileageKm"))}
                  {...register("mileageKm")}
                />
              </Field>
              <Field id={`${id}-color`} label="Color" optional>
                <input id={`${id}-color`} className={inputClass} {...register("color")} />
              </Field>
              <Field id={`${id}-fuel`} label="Combustible" error={err("fuel")}>
                <select
                  defaultValue=""
                  className={selectClass}
                  {...ariaFor(`${id}-fuel`, err("fuel"))}
                  {...register("fuel")}
                >
                  <option value="" disabled>
                    Elige…
                  </option>
                  {FUELS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </Field>
              <Field id={`${id}-transmission`} label="Cambio" error={err("transmission")}>
                <select
                  defaultValue=""
                  className={selectClass}
                  {...ariaFor(`${id}-transmission`, err("transmission"))}
                  {...register("transmission")}
                >
                  <option value="" disabled>
                    Elige…
                  </option>
                  {TRANSMISSIONS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <fieldset>
              <legend className="mb-3 text-xs tracking-[0.18em] text-muted uppercase">
                Estado general
              </legend>
              <div className="flex flex-wrap gap-2">
                {VEHICLE_CONDITIONS.map((c) => (
                  <label key={c} className="cursor-pointer">
                    <input
                      type="radio"
                      value={c}
                      className="peer sr-only"
                      {...register("condition")}
                    />
                    <span className={chipClass}>{c}</span>
                  </label>
                ))}
              </div>
              {err("condition") && (
                <p role="alert" className="mt-2 text-xs text-[var(--danger)]">
                  {err("condition")}
                </p>
              )}
            </fieldset>
            <Field id={`${id}-notes`} label="Extras, mantenimiento o detalles" optional>
              <textarea
                id={`${id}-notes`}
                rows={3}
                className={cn(inputClass, "resize-y")}
                {...register("notes")}
              />
            </Field>

            <div>
              <p className="mb-3 text-xs tracking-[0.18em] text-muted uppercase">
                Fotos{" "}
                <span className="tracking-normal text-subtle normal-case">
                  (opcional, hasta {MAX_PHOTOS})
                </span>
              </p>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {photos.map((p, i) => (
                  <li
                    key={p.url}
                    className="group relative aspect-[4/3] overflow-hidden bg-bg-elevated"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) */}
                    <img
                      src={p.url}
                      alt={`Foto ${i + 1} de tu coche`}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label={`Quitar foto ${i + 1}`}
                      className="absolute top-1 right-1 grid size-7 place-items-center bg-bg/80 text-fg hover:text-accent"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <li>
                    <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line-strong text-xs text-muted transition-colors focus-within:border-accent hover:border-accent hover:text-fg">
                      <ImagePlus className="size-5" strokeWidth={1.25} aria-hidden />
                      Añadir fotos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          void addPhotos(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </li>
                )}
              </ul>
              {photoError && (
                <p role="alert" className="mt-2 text-xs text-[var(--danger)]">
                  {photoError}
                </p>
              )}
              <p className="mt-2 text-xs text-subtle">
                Exterior por los cuatro lados, interior, cuadro con los kilómetros y detalles a
                destacar.
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <PersonFields id={id} register={register} errors={errors} />
            <ConsentFields
              id={id}
              register={register}
              errors={errors}
              purpose="Tasar tu vehículo y contactarte sobre la tasación"
            />
          </>
        )}
      </fieldset>

      <ServerError message={serverError} />

      <div className="flex flex-wrap items-center gap-4">
        {step > 0 && (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="size-4" aria-hidden /> Volver
          </Button>
        )}
        {step < VALUATION_STEPS.length - 1 ? (
          <Button type="button" variant="solid" onClick={next}>
            Siguiente <ArrowRight className="size-4" aria-hidden />
          </Button>
        ) : (
          <SubmitButton pending={isSubmitting} label="Solicitar tasación" />
        )}
      </div>
    </form>
  );
}
