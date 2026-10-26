/** A remembered login affects navigation only, never account authorization. */
export const LOGIN_HISTORY_KEY = "skate-do-zero:has-signed-in";

export function profileControls({
  signedIn,
  rememberedLogin,
  localName,
  localAvatar,
}: {
  signedIn: boolean;
  rememberedLogin: boolean;
  localName?: string;
  localAvatar?: string;
}) {
  // An automatically generated empty local identity is not a saved profile.
  const hasProfile = signedIn || rememberedLogin || Boolean(localName?.trim() || localAvatar?.trim());
  return { showSignIn: !hasProfile, label: hasProfile ? "Perfil" : "Criar meu perfil" };
}