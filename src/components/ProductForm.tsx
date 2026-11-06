import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CONDITIONS, emptyProductDraft, productInputSchema, sanitizeProductText, type ProductDraft } from "@/lib/products";
import { saveProduct, type Product } from "@/lib/products.functions";
import { prepareProductPhoto, uploadProductPhoto } from "@/lib/product-photos";
import { supabase } from "@/integrations/supabase/client";

type Photo = { path?: string; blob?: Blob; url: string };
export function ProductForm({ product, userId, onClose, onSaved }: { product: Product | null; userId: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [id] = useState(() => product?.id ?? crypto.randomUUID());
  const [draft, setDraft] = useState<ProductDraft>(product ? { name: product.name, description: product.description, price: (product.price_cents / 100).toFixed(2).replace(".", ","), pickup_location: product.pickup_location, condition: product.condition as ProductDraft["condition"], whatsapp: product.whatsapp } : emptyProductDraft);
  const [photos, setPhotos] = useState<Photo[]>(product?.photos.map((path, i) => ({ path, url: product.photoUrls[i] ?? "" })) ?? []);
  const [busy, setBusy] = useState(false); const [processing, setProcessing] = useState(false); const [error, setError] = useState("");
  const save = useServerFn(saveProduct);
  const previewUrls = useRef<string[]>([]);
  useEffect(() => () => { for (const url of previewUrls.current) URL.revokeObjectURL(url); }, []);
  const update = (key: keyof ProductDraft, value: string) => setDraft(d => ({ ...d, [key]: value }));
  async function addPhotos(files: FileList | null) {
    if (!files) return;
    if (photos.length + files.length > 4) { setError("Máximo de quatro fotos."); return; }
    setProcessing(true); setError("");
    try { const added: Photo[] = []; for (const file of Array.from(files)) { const blob = await prepareProductPhoto(file); const url = URL.createObjectURL(blob); previewUrls.current.push(url); added.push({ blob, url }); } setPhotos(p => [...p, ...added]); }
    catch (e) { setError(e instanceof Error ? e.message : "Foto inválida."); } finally { setProcessing(false); }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const valid = productInputSchema.safeParse({ ...draft, id, photos: photos.map((p, i) => p.path ?? `pending-${i}`) });
    if (!valid.success) { setError(valid.error.issues[0]?.message ?? "Confira os campos."); return; }
    setBusy(true); const uploaded: string[] = [];
    try {
      const paths: string[] = [];
      for (const photo of photos) { if (photo.path) paths.push(photo.path); else if (photo.blob) { const path = await uploadProductPhoto(photo.blob, userId, id); uploaded.push(path); paths.push(path); } }
      await save({ data: { product: { ...draft, id, photos: paths }, editing: Boolean(product) } });
      const removed = product?.photos.filter(p => !paths.includes(p)) ?? [];
      if (removed.length) await supabase.storage.from("product-photos").remove(removed);
      toast.success(product ? "Anúncio atualizado." : "Anúncio publicado."); await onSaved(); onClose();
    } catch (e) { if (uploaded.length) await supabase.storage.from("product-photos").remove(uploaded); setError(e instanceof Error ? e.message : "Não foi possível salvar."); } finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy && !processing) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{product ? "Editar anúncio" : "Novo anúncio"}</DialogTitle><DialogDescription>Produto · retirada · contato</DialogDescription></DialogHeader>
    <form onSubmit={submit} className="space-y-4">
      <label className="block space-y-2"><span>Nome do produto *</span><Input required minLength={2} maxLength={100} value={draft.name} onChange={e => update("name", sanitizeProductText(e.target.value))} placeholder="Shape 8,0" /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span>Preço (R$) *</span><Input required inputMode="decimal" maxLength={16} value={draft.price} onChange={e => update("price", e.target.value.replace(/[^\d.,]/g, ""))} placeholder="150,00" /></label>
      <label className="space-y-2"><span>Estado de conservação *</span><select className="h-10 w-full rounded-md border border-input bg-background px-3" value={draft.condition} onChange={e => update("condition", e.target.value)}>{Object.entries(CONDITIONS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label></div>
      <label className="block space-y-2"><span>Localidade de retirada *</span><Input required minLength={3} maxLength={160} value={draft.pickup_location} onChange={e => update("pickup_location", sanitizeProductText(e.target.value))} placeholder="Bairro, cidade e estado" /></label>
      <label className="block space-y-2"><span>Descrição</span><Textarea maxLength={2000} value={draft.description} onChange={e => update("description", sanitizeProductText(e.target.value, true))} /></label>
      <fieldset className="space-y-2"><legend>Fotos * ({photos.length}/4)</legend><div className="grid grid-cols-4 gap-2">{photos.map((p, i) => <div key={p.url} className="relative aspect-square overflow-hidden rounded-md border border-border"><img src={p.url} alt={`Foto ${i + 1}`} className="size-full object-cover"/><Button type="button" size="icon" variant="secondary" className="absolute right-0 top-0 size-8" disabled={busy || processing} aria-label={`Remover foto ${i + 1}`} onClick={() => setPhotos(ps => ps.filter((_, index) => index !== i))}><X className="size-4" /></Button></div>)}</div><Button asChild variant="outline" disabled={busy || processing || photos.length === 4}><label className="cursor-pointer"><ImagePlus className="size-4"/>{processing ? "Processando…" : "Adicionar fotos"}<input aria-label="Fotos do produto" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || processing || photos.length === 4} onChange={e => { void addPhotos(e.target.files); e.target.value = ""; }} /></label></Button></fieldset>
      <label className="block space-y-2"><span>WhatsApp com DDD *</span><Input required type="tel" maxLength={20} value={draft.whatsapp} onChange={e => update("whatsapp", e.target.value.replace(/[^\d ()+\-]/g, ""))} placeholder="11 98765-4321" /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={busy || processing}>Cancelar</Button><Button type="submit" disabled={busy || processing}>{busy ? "Salvando…" : "Publicar anúncio"}</Button></div>
    </form></DialogContent></Dialog>;
}