"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils/format";
import { PREFERRED_CONTACT, contactSchema, type ContactInput } from "@/lib/validation/contact";
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
} from "./form-parts";

/**
 * Formulario de solicitud de información (general, sobre un vehículo o de preaprobación de
 * financiación). Valida con el mismo esquema Zod que el servidor (/api/contact).
 */
export function ContactForm({
  vehicle,
  topic = vehicle ? "vehiculo" : "general",
  defaultMessage,
  submitLabel = "Enviar solicitud",
  className,
}: {
  vehicle?: { id: string; name: string };
  topic?: ContactInput["topic"];
  defaultMessage?: string;
  submitLabel?: string;
  className?: string;
}) {
  const id = useId();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      topic,
      vehicleId: vehicle?.id,
      vehicleName: vehicle?.name,
      preferredContact: "telefono",
      message:
        defaultMessage ??
        (vehicle ? `Hola, me interesa el ${vehicle.name}. ¿Sigue disponible?` : ""),
      marketing: false,
      website: "",
    },
  });

  const onSubmit = async (data: ContactInput) => {
    const error = await postForm("/api/contact", data);
    setServerError(error);
    if (!error) {
      setSent(true);
      reset();
    }
  };

  if (sent) {
    return (
      <FormSuccess title="Mensaje enviado" onReset={() => setSent(false)} className={className}>
        Gracias. Te contestaremos lo antes posible. Si lo prefieres, llámanos al{" "}
        <a href={`tel:${site.contact.phone.e164}`} className="text-fg underline underline-offset-4">
          {site.contact.phone.display}
        </a>
        .
      </FormSuccess>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn("relative flex flex-col gap-7", className)}
      data-testid="contact-form"
    >
      <input type="hidden" {...register("topic")} />
      <input type="hidden" {...register("vehicleId")} />
      <input type="hidden" {...register("vehicleName")} />

      <PersonFields id={id} register={register} errors={errors} />

      <Field id={`${id}-message`} label="Mensaje" error={errors.message?.message}>
        <textarea
          rows={4}
          className={cn(inputClass, "resize-y")}
          {...ariaFor(`${id}-message`, errors.message)}
          {...register("message")}
        />
      </Field>

      <fieldset>
        <legend className="mb-3 text-xs tracking-[0.18em] text-muted uppercase">
          ¿Cómo prefieres que te contactemos?
        </legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PREFERRED_CONTACT).map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                value={value}
                className="peer sr-only"
                {...register("preferredContact")}
              />
              <span className={chipClass}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <ConsentFields id={id} register={register} errors={errors} />
      <ServerError message={serverError} />
      <SubmitButton pending={isSubmitting} label={submitLabel} />
    </form>
  );
}
