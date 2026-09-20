import type { PixelIconKind } from "@/components/pixel-icon";
import type { Game } from "@/lib/games";

export type Pillar = {
  title: string;
  body: string;
  color: Game["color"];
  icon: PixelIconKind;
};

export type StatusItem = { text: string; done: boolean };

// Static content: the About page is prerendered (no Date.now()/Math.random()).
// One pillar per neon colour, in the kicker rotation order.
export const PILLARS: Pillar[] = [
  {
    title: "HECHO POR JUGADORES",
    body: "Nació de jugar los mismos clásicos una y otra vez. Las decisiones se toman pensando en quien tiene el mando en la mano.",
    color: "magenta",
    icon: "corazon",
  },
  {
    title: "SIN INSTALAR NADA",
    body: "Los juegos se construyen para correr en cualquier navegador. Un enlace y a jugar.",
    color: "cyan",
    icon: "navegador",
  },
  {
    title: "LA MARCA MANDA",
    body: "Un puntaje es un puntaje. El Salón de la Fama existe para competir contra otros y contra tu mejor marca.",
    color: "yellow",
    icon: "trofeo",
  },
  {
    title: "CRECE A LA VISTA",
    body: "El proyecto avanza por etapas y dice en cuál está. Lo que aún no funciona se rotula como demostración.",
    color: "green",
    icon: "planta",
  },
];

// Only two states are real: nothing in the repo backs an "in progress" one.
export const STATUS_ITEMS: StatusItem[] = [
  { text: "Catálogo con búsqueda y categorías", done: true },
  { text: "Ficha de cada juego con su tabla de posiciones", done: true },
  { text: "Salón de la Fama con podio por juego", done: true },
  { text: "Portada y esta página", done: true },
  { text: "Primer juego jugable", done: false },
  { text: "Cuentas y sesión reales", done: false },
  { text: "Ranking con marcas reales", done: false },
];
