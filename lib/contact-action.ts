"use server";

import { after } from "next/server";
import { TOPICS, validateContact, type ContactState, type ContactValues } from "@/lib/contact";
import { sendNotice, sendReceipt } from "@/lib/mailer";

function read(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function sendContact(prev: ContactState, formData: FormData): Promise<ContactState> {
  const values: ContactValues = {
    nombre: read(formData, "nombre"),
    correo: read(formData, "correo"),
    tema: read(formData, "tema"),
    mensaje: read(formData, "mensaje"),
  };
  const nombre = values.nombre.trim();
  const correo = values.correo.trim();
  const topic = TOPICS.find((t) => t.id === values.tema);

  // 1. Honeypot: a bot fills the decoy. Answer as if it worked, send nothing.
  if (read(formData, "sitio_web") !== "") {
    return { status: "sent", nombre, correo, tema: topic?.id ?? TOPICS[0].id, ref: null };
  }

  // 2. The server is the one that decides; the client only anticipates.
  const errors = validateContact(values);
  if (!topic || Object.keys(errors).length > 0) {
    return { status: "invalid", values, errors };
  }

  // 3. The notice is awaited: if it fails, the visitor has to know.
  const input = { nombre, correo, tema: topic.id, mensaje: values.mensaje.trim() };
  const notice = await sendNotice(input);
  if (!notice.ok) {
    return { status: "failed", values, errors: {}, reason: notice.reason };
  }

  // 4. The receipt is not: it must never sink a message that did reach the team.
  after(() => sendReceipt(input));

  // 5.
  return { status: "sent", nombre, correo, tema: topic.id, ref: notice.ref };
}
