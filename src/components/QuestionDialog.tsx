import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  readRequest,
  requestOptions,
  type RequestDialogProps,
  type RequestErrors,
} from "../requests";

const fields = ["choice", "contact", "message"] as const;

export default function QuestionDialog({
  workshop,
  onClose,
  onSubmit,
}: RequestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [errors, setErrors] = useState<RequestErrors>({});

  useEffect(() => {
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const firstError = fields.find((name) => errors[name]);
    if (firstError) document.getElementById(firstError)?.focus();
  }, [errors]);

  const close = () => dialogRef.current?.close();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = readRequest(event.currentTarget, "question", workshop.id);
    setErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;
    onSubmit(result.values);
    close();
  };

  const errorProps = (name: (typeof fields)[number]) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    className: errors[name] ? "invalid" : undefined,
  });

  return (
    <dialog ref={dialogRef} aria-labelledby="question-title" onClose={onClose}>
      <div className="dialog-heading">
        <h2 id="question-title" ref={titleRef} tabIndex={-1}>
          Poser une question sur {workshop.title}
        </h2>
        <button
          type="button"
          className="close-button"
          aria-label="Fermer"
          onClick={close}
        >
          X
        </button>
      </div>

      <form noValidate onSubmit={submit}>
        <div className="field">
          <label htmlFor="choice">Sujet (obligatoire)</label>
          <select
            id="choice"
            name="choice"
            defaultValue=""
            {...errorProps("choice")}
          >
            <option value="">Choisissez un sujet</option>
            {requestOptions.question.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.choice && (
            <p className="field-error" id="choice-error">
              {errors.choice}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="contact">Adresse électronique (obligatoire)</label>
          <input
            id="contact"
            name="contact"
            type="email"
            autoComplete="email"
            {...errorProps("contact")}
          />
          {errors.contact && (
            <p className="field-error" id="contact-error">
              {errors.contact}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="message">Votre question (obligatoire)</label>
          <textarea id="message" name="message" {...errorProps("message")} />
          {errors.message && (
            <p className="field-error" id="message-error">
              {errors.message}
            </p>
          )}
        </div>

        <div className="dialog-actions">
          <button type="submit" className="primary-button">
            Envoyer
          </button>
          <button type="button" className="secondary-button" onClick={close}>
            Annuler
          </button>
        </div>
      </form>
    </dialog>
  );
}
