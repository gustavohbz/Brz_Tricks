import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// "text-display" é um estilo de fonte próprio (não uma cor); sem isso o
// merge apagava a cor do texto dos botões que usam essa classe.
const twMerge = extendTailwindMerge<"display-type">({
  extend: { classGroups: { "display-type": ["text-display"] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
