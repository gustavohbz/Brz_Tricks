// Skatistas: perfis públicos com pista que frequenta e Instagram.
import { supabase } from "@/integrations/supabase/client";

export type Skater = { id: string; user_id: string; name: string; bio: string; home_park: string; instagram: string };

export const cleanText = (v: string, max: number) => v.replace(/[<>]/g, "").slice(0, max);
export const cleanInstagram = (v: string) => v.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/.*$/, "").replace(/[^A-Za-z0-9._]/g, "").slice(0, 30);
export const instagramUrl = (handle: string) => `https://instagram.com/${encodeURIComponent(handle)}`;

export async function listSkaters(): Promise<Skater[]> {
  const { data, error } = await supabase.from("skaters").select("id,user_id,name,bio,home_park,instagram").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export async function getSkater(id: string): Promise<Skater | null> {
  const { data, error } = await supabase.from("skaters").select("id,user_id,name,bio,home_park,instagram").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
export async function saveSkater(userId: string, v: { name: string; bio: string; home_park: string; instagram: string }) {
  const { error } = await supabase.from("skaters").upsert({ user_id: userId, name: v.name.trim(), bio: v.bio.trim(), home_park: v.home_park.trim(), instagram: cleanInstagram(v.instagram) }, { onConflict: "user_id" });
  if (error) throw error;
}
