import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { markNotificationsRead, notifications, parseReadNotifications } from "@/data/site-messages";

const storageKey = "skate-do-zero:notifications:read";

export function NotificationBell() {
  const [read, setRead] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const restore = () => {
      try { setRead(parseReadNotifications(localStorage.getItem(storageKey))); } catch { /* Storage may be unavailable. */ }
      setReady(true);
    };
    restore();
    window.addEventListener("storage", restore);
    return () => window.removeEventListener("storage", restore);
  }, []);

  const markRead = (ids: string[]) => {
    setRead((current) => {
      const next = markNotificationsRead(current, ids);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep in-memory state. */ }
      return next;
    });
  };
  const unread = ready ? notifications.filter((item) => !read.includes(item.id)).length : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0" aria-label={unread ? `Notificações, ${unread} não lidas` : "Notificações"} title="Notificações">
          <Bell />
          {unread > 0 && <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground" aria-hidden="true">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0" aria-label="Notificações">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-xl">Notificações</h2>
          <Button variant="ghost" size="icon" disabled={!unread} onClick={() => markRead(notifications.map((item) => item.id))} aria-label="Marcar todas como lidas" title="Marcar todas como lidas"><CheckCheck /></Button>
        </div>
        <div className="divide-y divide-border">
          {notifications.map((item) => (
            <Link key={item.id} to={item.href} onClick={() => { markRead([item.id]); setOpen(false); }} className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${ready && !read.includes(item.id) ? "bg-primary" : "bg-border"}`} />
              <div><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p></div>
            </Link>
          ))}
        </div>
        {ready && !unread && <p role="status" className="border-t border-border px-4 py-3 text-xs text-muted-foreground">Você está em dia!</p>}
      </PopoverContent>
    </Popover>
  );
}