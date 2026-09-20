import "server-only";
import { Resend } from "resend";
import { TOPICS, type ContactTopic } from "@/lib/contact";

export type NoticeInput = {
  nombre: string;
  correo: string;
  tema: ContactTopic;
  mensaje: string;
};
export type ReceiptInput = NoticeInput;

export type NoticeResult =
  | { ok: true; ref: string }
  | { ok: false; reason: "config" | "delivery" };

const DEFAULT_FROM = "Arcade Vault <onboarding@resend.dev>";

// Read inside the function, never at module scope: a missing key must not
// break the import of this module (or the build).
function readConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM;
  if (!apiKey || !to) return null;
  return { apiKey, to, from };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function subjectOf(tema: ContactTopic): string {
  return TOPICS.find((t) => t.id === tema)?.subject ?? tema;
}

const WRAP = "font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;line-height:1.6;color:#111";
const QUOTE =
  "margin:12px 0;padding:12px 14px;border-left:3px solid #d000ff;background:#f4f4f6;white-space:pre-wrap;word-break:break-word";

export async function sendNotice(input: NoticeInput): Promise<NoticeResult> {
  const config = readConfig();
  if (!config) {
    console.error("[contact] Sin RESEND_API_KEY o CONTACT_TO_EMAIL: no se envía el aviso.");
    return { ok: false, reason: "config" };
  }

  const tema = subjectOf(input.tema);
  const html = `<div style="${WRAP}">
<p><strong>Nuevo mensaje desde Arcade Vault</strong></p>
<p>Tema: ${escapeHtml(tema)}<br>De: ${escapeHtml(input.nombre)} &lt;${escapeHtml(input.correo)}&gt;</p>
<div style="${QUOTE}">${escapeHtml(input.mensaje)}</div>
<p style="color:#666">Responde a este correo para escribirle directamente.</p>
</div>`;
  const text = `Nuevo mensaje desde Arcade Vault\n\nTema: ${tema}\nDe: ${input.nombre} <${input.correo}>\n\n${input.mensaje}\n`;

  try {
    const { data, error } = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: config.to,
      replyTo: input.correo,
      subject: `[Arcade Vault] ${tema} · ${input.nombre}`,
      html,
      text,
    });
    if (error || !data) {
      console.error("[contact] Resend rechazó el aviso:", error?.name, error?.message);
      return { ok: false, reason: "delivery" };
    }
    return { ok: true, ref: data.id.slice(0, 8) };
  } catch (err) {
    console.error("[contact] Falló la llamada a Resend (aviso):", err);
    return { ok: false, reason: "delivery" };
  }
}

// Best-effort: runs inside after(), so it logs and never throws. Until a domain
// is verified, Resend only delivers to the account owner and this can fail.
export async function sendReceipt(input: ReceiptInput): Promise<void> {
  const config = readConfig();
  if (!config) return;

  const tema = subjectOf(input.tema);
  const html = `<div style="${WRAP}">
<p>Hola, ${escapeHtml(input.nombre)}.</p>
<p>Recibimos tu mensaje (${escapeHtml(tema)}) y lo vamos a leer. Esto es un acuse de recibo automático.</p>
<div style="${QUOTE}">${escapeHtml(input.mensaje)}</div>
<p style="color:#666">Usamos tu correo solo para responderte. Arcade Vault.</p>
</div>`;
  const text = `Hola, ${input.nombre}.\n\nRecibimos tu mensaje (${tema}) y lo vamos a leer. Esto es un acuse de recibo automático.\n\n${input.mensaje}\n\nUsamos tu correo solo para responderte. Arcade Vault.\n`;

  try {
    const { error } = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: input.correo,
      subject: "Recibimos tu mensaje · Arcade Vault",
      html,
      text,
    });
    if (error) console.error("[contact] Resend rechazó el acuse:", error.name, error.message);
  } catch (err) {
    console.error("[contact] Falló la llamada a Resend (acuse):", err);
  }
}
