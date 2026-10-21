"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WithPending } from "@/components/ui/pending";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils/format";
import {
  APPOINTMENT_REASONS,
  APPOINTMENT_SLOTS,
  MAX_DAYS_AHEAD,
  appointmentSchema,
  isoDate,
  type AppointmentInput,
} from "@/lib/validation/appointment";
import {
  ConsentFields,
  Field,
  FieldError,
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

export type VehicleOption = { id: string; name: string };

/** Reserva de cita previa: motivo (y vehículo), fecha, franja y datos de contacto. */
export function AppointmentForm({
  vehicles,
  defaultVehicleId,
  defaultReason,
}: {
  vehicles: VehicleOption[];
  defaultVehicleId?: string;
  defaultReason?: AppointmentInput["reason"];
}) {
  const id = useId();
  const [sent, setSent] = useState<AppointmentInput | null>(null);
  const [serverError, setServerError] = useState<string>();
  const preselected = vehicles.some((v) => v.id === defaultVehicleId)
    ? defaultVehicleId
    : undefined;
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      reason: defaultReason ?? "ver-vehiculo",
      vehicleId: preselected ?? "",
      marketing: false,
      website: "",
    },
  });
  const reason = watch("reason");

  const onSubmit = async (data: AppointmentInput) => {
    const error = await postForm("/api/appointment", data);
    setServerError(error);
    if (!error) {
      setSent(data);
      reset();
    }
  };

  if (sent) {
    const date = new Date(`${sent.date}T12:00:00`).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return (
      <FormSuccess title="Solicitud de cita recibida" onReset={() => setSent(null)}>
        Has pedido cita para el <strong className="text-fg">{date}</strong> por la{" "}
        {APPOINTMENT_SLOTS[sent.slot].toLowerCase()}. Te confirmaremos la hora exacta por teléfono o
        WhatsApp lo antes posible.
      </FormSuccess>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="relative flex flex-col gap-8"
      data-testid="appointment-form"
    >
      <fieldset>
        <legend className="mb-3 text-xs tracking-[0.18em] text-muted uppercase">
          Motivo de la visita
        </legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(APPOINTMENT_REASONS).map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" value={value} className="peer sr-only" {...register("reason")} />
              <span className={chipClass}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {reason === "ver-vehiculo" && (
        <Field id={`${id}-vehicle`} label="Vehículo" error={errors.vehicleId?.message}>
          <select
            className={selectClass}
            {...ariaFor(`${id}-vehicle`, errors.vehicleId)}
            {...register("vehicleId")}
          >
            <option value="">Elige un vehículo del stock…</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id={`${id}-date`} label="Fecha" error={errors.date?.message}>
          <input
            type="date"
            min={isoDate(1)}
            max={isoDate(MAX_DAYS_AHEAD)}
            className={cn(inputClass, "[color-scheme:dark]")}
            {...ariaFor(`${id}-date`, errors.date)}
            {...register("date")}
          />
        </Field>
        <fieldset>
          <legend className="mb-3 text-xs tracking-[0.18em] text-muted uppercase">Franja</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(APPOINTMENT_SLOTS).map(([value, label]) => (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  value={value}
                  className="peer sr-only"
                  aria-describedby={errors.slot ? `${id}-slot-error` : undefined}
                  {...register("slot")}
                />
                <span className={chipClass}>{label}</span>
              </label>
            ))}
          </div>
          <FieldError id={`${id}-slot`} message={errors.slot?.message} />
        </fieldset>
      </div>
      <p className="-mt-4 text-xs text-subtle">
        {site.schedule.note}: te confirmamos la hora exacta.{" "}
        <WithPending text={site.schedule.hours} />
      </p>

      <PersonFields id={id} register={register} errors={errors} />

      <Field id={`${id}-message`} label="Comentarios" optional>
        <textarea
          id={`${id}-message`}
          rows={3}
          className={cn(inputClass, "resize-y")}
          {...register("message")}
        />
      </Field>

      <ConsentFields id={id} register={register} errors={errors} purpose="Gestionar tu cita" />
      <ServerError message={serverError} />
      <SubmitButton pending={isSubmitting} label="Solicitar cita" />
    </form>
  );
}
