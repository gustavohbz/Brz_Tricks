// Replace this campaign with the advertiser's real destination when supplied.
export const advertisingBanner = {
  href: "/planos",
  label: "Destaque · Skate do Zero",
  title: "Seu próximo passo começa no skate.",
  action: "Conhecer os planos",
};

export const notifications = [
  { id: "training", title: "Seu treino, do seu jeito", description: "Monte seu cronograma de manobras na área de treinos.", href: "/treinos" as const },
  { id: "profile", title: "Sua identidade no Skate do Zero", description: "Seu nome, avatar e setup estão na página de perfil.", href: "/perfil" as const },
];

export function parseReadNotifications(value: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function markNotificationsRead(current: string[], ids: string[]): string[] {
  return Array.from(new Set([...current, ...ids]));
}