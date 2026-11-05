import { z } from "zod";

export const CONDITIONS = { novo: "Novo", como_novo: "Como novo", bom: "Bom estado", usado: "Usado" } as const;
export const MAX_PRODUCT_PHOTOS = 4;
export function sanitizeProductText(value: string, multiline = false) {
  const normalized = value.normalize("NFC").replace(/\r\n?/g, "\n");
  return normalized.replace(multiline ? /[^\p{L}\p{N} .(),/\-!?\n]/gu : /[^\p{L}\p{N} .(),/\-]/gu, "");
}
const plainText = (min: number, max: number, multiline = false) => z.string().max(max).refine(v => v === sanitizeProductText(v, multiline), "Use somente texto simples, sem símbolos especiais ou código.").transform(v => v.trim()).pipe(z.string().min(min, "Preencha este campo.").max(max));
export function parsePrice(value: string) {
  if (!/^(?:\d{1,7}|\d{1,3}(?:\.\d{3}){1,2})(?:,\d{1,2})?$/.test(value)) throw new Error("Preço inválido. Ex.: 150,00");
  const [whole, decimal = ""] = value.replaceAll(".", "").split(",");
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  if (cents < 1 || cents > 999999999) throw new Error("Preço fora do limite permitido.");
  return cents;
}
export const productFieldsSchema = z.object({
  name: plainText(2, 100), description: plainText(0, 2000, true), pickup_location: plainText(3, 160),
  price: z.string().max(16).transform((v, ctx) => { try { return parsePrice(v); } catch { ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Preço inválido. Ex.: 150,00" }); return z.NEVER; } }),
  condition: z.enum(["novo", "como_novo", "bom", "usado"]),
  whatsapp: z.string().max(20).regex(/^[\d ()+\-]+$/, "WhatsApp inválido").transform(v => { const digits = v.replace(/\D/g, ""); return digits.length <= 11 ? `55${digits}` : digits; }).pipe(z.string().regex(/^55[1-9]\d{9,10}$/, "Informe DDD e número do WhatsApp.")),
}).strict();
export const productInputSchema = productFieldsSchema.extend({ id: z.string().uuid(), photos: z.array(z.string().max(160)).min(1, "Adicione pelo menos uma foto.").max(MAX_PRODUCT_PHOTOS, "Máximo de quatro fotos.").refine(p => new Set(p).size === p.length, "Fotos repetidas.") });
export type ProductDraft = z.input<typeof productFieldsSchema>;
export const emptyProductDraft: ProductDraft = { name: "", description: "", price: "", pickup_location: "", condition: "bom", whatsapp: "" };
export function formatPrice(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
export function whatsappLink(phone: string, name: string) {
  const valid = z.string().regex(/^55[1-9]\d{9,10}$/).parse(phone);
  return `https://wa.me/${valid}?text=${encodeURIComponent(`Olá! Tenho interesse em ${sanitizeProductText(name).slice(0, 100)}.`)}`;
}
export function mayEditProduct(owner: string, viewer: string | undefined, deleted: string | null) { return owner === viewer && deleted === null; }
export function mayHardDeleteProduct(admin: boolean, deleted: string | null) { return admin && deleted !== null; }