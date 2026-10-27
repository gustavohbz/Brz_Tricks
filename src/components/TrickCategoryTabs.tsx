import { useState, type ReactNode } from "react";
import {
  CATEGORIAS,
  categoriaLabel,
  sections,
  type Categoria,
  type Trick,
} from "@/data/tricks";
import {
  DEFAULT_TRICK_SECTION_ID,
  filterTricksByCategory,
} from "@/data/trick-categories";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function TrickCategoryTabs({
  renderTrick,
}: {
  renderTrick: (trick: Trick, index: number) => ReactNode;
}) {
  const [activeSection, setActiveSection] = useState<string>(DEFAULT_TRICK_SECTION_ID);
  const [filters, setFilters] = useState<Record<string, Categoria | "todas">>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  return (
    <Tabs value={activeSection} onValueChange={setActiveSection}>
      <section id="trilha" className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-display text-sm text-accent">Trilha iniciante</p>
          <h2 className="text-display mt-2 text-4xl sm:text-5xl">
            Escolha por onde começar
          </h2>

          <TabsList
            aria-label="Categorias de manobras"
            className="mt-8 grid h-auto w-full grid-cols-3 gap-2 overflow-visible bg-transparent p-0 sm:gap-4"
          >
            {sections.map((section, index) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="shadow-street group min-h-24 min-w-0 flex-col items-start justify-start rounded-lg border border-border bg-card p-3 text-left transition-all hover:-translate-y-1 hover:border-primary data-[state=active]:border-primary data-[state=active]:bg-secondary data-[state=active]:text-foreground sm:min-h-40 sm:p-6"
              >
                <span className="text-display text-2xl text-muted-foreground transition-colors group-data-[state=active]:text-primary sm:text-5xl">
                  0{index + 1}
                </span>
                <span className="text-display mt-1 text-sm leading-tight sm:mt-3 sm:text-2xl">
                  {section.title}
                </span>
                <span className="mt-2 hidden text-sm text-muted-foreground sm:block">
                  {section.tagline}
                </span>
                <span className="text-display mt-auto pt-2 text-[10px] text-primary sm:pt-4 sm:text-xs">
                  Ver 10 manobras →
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <button
              onClick={() => document.getElementById("cronograma")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="text-display text-sm text-accent hover:text-primary"
            >
              Ou monte seu cronograma de treinos →
            </button>
            <button
              onClick={() => document.getElementById("dicas")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="text-display text-sm text-accent hover:text-primary"
            >
              Curiosidades & dicas →
            </button>
            <button
              onClick={() => document.getElementById("pistas")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="text-display text-sm text-accent hover:text-primary"
            >
              Pistas de skate →
            </button>
            <button
              onClick={() => document.getElementById("videos")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="text-display text-sm text-accent hover:text-primary"
            >
              Vídeos recomendados →
            </button>
          </div>
        </div>
      </section>

      {sections.map((section) => {
        const filter = filters[section.id] ?? "todas";
        const visibleTricks = filterTricksByCategory(section.tricks, filter);
        const limit = 5;
        const expanded = !!expandedSections[section.id];
        const shownTricks = expanded ? visibleTricks : visibleTricks.slice(0, limit);

        return (
          <TabsContent key={section.id} value={section.id} className="mt-0">
            <section id={section.id} className="border-t border-border px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-display text-4xl sm:text-6xl">
                      {section.title}
                    </h2>
                    <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                      {section.tagline}
                    </p>
                  </div>
                  <span className="text-display rounded-full border border-border px-4 py-1 text-xs text-primary">
                    {visibleTricks.length} manobras
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-display text-xs text-muted-foreground">
                    Nível:
                  </span>
                  {CATEGORIAS.map((category) => (
                    <button
                      key={category.value}
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          [section.id]: category.value,
                        }))
                      }
                      aria-pressed={filter === category.value}
                      className={`text-display rounded-full border px-3 py-1 text-xs transition-colors ${
                        filter === category.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                {visibleTricks.length === 0 ? (
                  <p className="mt-8 text-sm text-muted-foreground">
                    Nenhuma manobra nessa categoria ainda.
                  </p>
                ) : (
                  <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {shownTricks.map((trick, index) => renderTrick(trick, index))}
                  </div>
                )}

                {visibleTricks.length > limit && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setExpandedSections((current) => ({
                          ...current,
                          [section.id]: !expanded,
                        }))
                      }
                      className="text-display"
                    >
                      {expanded
                        ? "Ver menos"
                        : `Ver mais (${visibleTricks.length - limit})`}
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
