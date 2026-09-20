"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import { ContactMessageField } from "@/components/contact-message-field";
import { ContactTerminal } from "@/components/contact-terminal";
import { sendContact } from "@/lib/contact-action";
import {
  INITIAL_STATE,
  INITIAL_VALUES,
  TOPICS,
  validateContact,
  type ContactField,
  type ContactState,
  type ContactTopic,
} from "@/lib/contact";

const FIELDS: readonly ContactField[] = ["nombre", "correo", "tema", "mensaje"];

// Client-side edits on top of the last server result: a message, or `null` when the
// visitor already fixed it. They are only valid for the state they were made against.
type Edits = Partial<Record<ContactField, string | null>>;
type EditState = { base: ContactState; edits: Edits };

function isField(name: string): name is ContactField {
  return (FIELDS as readonly string[]).includes(name);
}

// The field a bubbled form event came from, or null for anything else (links, the button).
function controlOf(event: SyntheticEvent): { field: ContactField; value: string } | null {
  const { target } = event;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return null;
  return isField(target.name) ? { field: target.name, value: target.value } : null;
}

// validateContact checks the whole form; the rest of the values are valid placeholders.
function fieldError(field: ContactField, value: string): string | undefined {
  return validateContact({ ...INITIAL_VALUES, [field]: value })[field];
}

function focusField(field: ContactField) {
  const target = document.getElementById(`contacto-${field}`);
  const control = target?.matches("input, textarea") ? target : target?.querySelector("input");
  control?.focus();
}

function errorId(field: ContactField) {
  return `contacto-${field}-error`;
}

function TextField({
  field,
  label,
  type,
  autoComplete,
  placeholder,
  defaultValue,
  error,
  autoFocus,
}: {
  field: "nombre" | "correo";
  label: string;
  type: "text" | "email";
  autoComplete: string;
  placeholder: string;
  defaultValue: string;
  error?: string;
  autoFocus?: boolean;
}) {
  const id = `contacto-${field}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={field}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId(field) : undefined}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
      />
      {error ? (
        <p id={errorId(field)} className="text-[12px] leading-[1.5] text-magenta">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ContactFormInner({
  publicEmail,
  focusFirst,
  onReset,
}: {
  publicEmail?: string;
  focusFirst: boolean;
  onReset: () => void;
}) {
  const [state, formAction, pending] = useActionState(sendContact, INITIAL_STATE);
  const [editState, setEditState] = useState<EditState>({ base: state, edits: {} });
  const summaryRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // A new invalid result restarts the shake by remounting the form (values survive:
  // every field takes its defaultValue from state.values). Adjusting state while
  // rendering, instead of in an effect, avoids a second pass.
  const [seen, setSeen] = useState(state);
  const [shakes, setShakes] = useState(0);
  if (seen !== state) {
    setSeen(state);
    if (state.status === "invalid") setShakes(shakes + 1);
  }

  useEffect(() => {
    if (state.status === "invalid") summaryRef.current?.focus();
    else if (state.status === "failed" || state.status === "sent") terminalRef.current?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="w-full">
          <ContactTerminal
            ref={terminalRef}
            mode="success"
            tema={state.tema}
            nombre={state.nombre}
            correo={state.correo}
            mailRef={state.ref}
          />
        </div>
        <button type="button" className="btn" onClick={onReset}>
          ENVIAR OTRO MENSAJE
        </button>
      </div>
    );
  }

  const values = state.values;
  const edits = editState.base === state ? editState.edits : {};
  const shown = (field: ContactField): string | undefined =>
    field in edits ? (edits[field] ?? undefined) : state.errors[field];

  const setEdit = (field: ContactField, message: string | null) =>
    setEditState((prev) => ({
      base: state,
      edits: { ...(prev.base === state ? prev.edits : {}), [field]: message },
    }));

  // Validate on leaving a field (events bubble, so one handler covers every control).
  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const control = controlOf(event);
    if (control) setEdit(control.field, fieldError(control.field, control.value) ?? null);
  };

  // Retire an error while typing only once the value turns valid, never before.
  const onInput = (event: FormEvent<HTMLFormElement>) => {
    const control = controlOf(event);
    if (control && shown(control.field) && !fieldError(control.field, control.value)) {
      setEdit(control.field, null);
    }
  };

  const onSummaryLink = (event: MouseEvent<HTMLAnchorElement>, field: ContactField) => {
    event.preventDefault();
    focusField(field);
  };

  // The summary is a snapshot of the last submit: it must not change under a screen
  // reader while the visitor fixes fields (role="alert" would re-read it every time).
  const summary = state.status === "invalid" ? FIELDS.filter((f) => state.errors[f]) : [];

  return (
    <div className="flex flex-col gap-4">
      {state.status === "failed" ? (
        <ContactTerminal
          ref={terminalRef}
          mode="failure"
          tema={values.tema as ContactTopic}
          reason={state.reason}
          publicEmail={publicEmail}
        />
      ) : null}

      <div key={shakes} className={shakes > 0 ? "motion-safe:animate-[shake_0.4s]" : undefined}>
        <form
          action={formAction}
          noValidate
          aria-busy={pending}
          onBlur={onBlur}
          onInput={onInput}
          className="relative border border-line bg-bg-2 p-5 before:pointer-events-none before:absolute before:inset-1 before:border before:border-dashed before:border-cyan/15 min-[721px]:p-7"
        >
          {summary.length > 0 ? (
            <div
              ref={summaryRef}
              role="alert"
              tabIndex={-1}
              className="relative mb-5 border border-magenta bg-magenta/10 p-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-magenta"
            >
              <h3 className="mb-2 font-pixel text-[11px] font-normal leading-[1.4] tracking-[0.12em] text-magenta">
                Revisa estos campos
              </h3>
              <ul className="text-[13px] leading-[1.5]">
                {summary.map((field) => (
                  <li key={field}>
                    <a
                      href={`#contacto-${field}`}
                      onClick={(event) => onSummaryLink(event, field)}
                      className="flex min-h-11 items-center text-ink underline decoration-magenta underline-offset-4"
                    >
                      {state.errors[field]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <TextField
            field="nombre"
            label="Nombre"
            type="text"
            autoComplete="name"
            placeholder="PX_KAI"
            defaultValue={values.nombre}
            error={shown("nombre")}
            autoFocus={focusFirst}
          />
          <TextField
            field="correo"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="jugador@vault.gg"
            defaultValue={values.correo}
            error={shown("correo")}
          />

          <fieldset id="contacto-tema" className="mb-3 min-w-0 border-0 p-0">
            <legend className="mb-1.5 p-0 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Tema
            </legend>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <label
                  key={topic.id}
                  className="chip relative inline-flex items-center has-checked:border-magenta has-checked:text-magenta has-checked:shadow-[0_0_10px_rgba(255,0,110,0.35)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-cyan"
                >
                  <input
                    type="radio"
                    name="tema"
                    value={topic.id}
                    defaultChecked={topic.id === values.tema}
                    className="sr-only"
                  />
                  {topic.label}
                </label>
              ))}
            </div>
            {shown("tema") ? (
              <p id={errorId("tema")} className="mt-1.5 text-[12px] leading-[1.5] text-magenta">
                {shown("tema")}
              </p>
            ) : null}
          </fieldset>

          <ContactMessageField defaultValue={values.mensaje} error={shown("mensaje")} />

          {/* Honeypot: off-screen decoy for bots. Filled in, the action answers "sent"
              and calls nothing. Hidden from assistive tech and from the tab order. */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
          >
            <label htmlFor="contacto-sitio-web">Sitio web</label>
            <input
              id="contacto-sitio-web"
              name="sitio_web"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="btn lg mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-ink disabled:hover:shadow-none disabled:active:transform-none"
          >
            {pending ? "ENVIANDO…" : "ENVIAR MENSAJE"}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Contact form. The inner component owns `useActionState`; changing `key` remounts it,
 * which is the only way to get an empty form (and initial state) back after a success.
 */
export function ContactForm({ publicEmail }: { publicEmail?: string }) {
  const [formKey, setFormKey] = useState(0);
  return (
    <ContactFormInner
      key={formKey}
      publicEmail={publicEmail}
      focusFirst={formKey > 0}
      onReset={() => setFormKey((key) => key + 1)}
    />
  );
}
