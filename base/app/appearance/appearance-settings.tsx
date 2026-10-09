"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon } from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { Badge } from "@mmanto/devbout-ui"
import { Button } from "@mmanto/devbout-ui"
import { Input } from "@mmanto/devbout-ui"
import { Progress } from "@mmanto/devbout-ui"
import { Separator } from "@mmanto/devbout-ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mmanto/devbout-ui"
import { useThemePreset } from "@/components/theme-preset-provider"
import { BLOCKS, BLOCK_TONE_LABELS } from "@/lib/theme-presets/blocks"
import { PRESET_CATALOG } from "@/lib/theme-presets/catalog"
import {
  DEFAULT_TITLE_SIZE,
  TITLE_SIZES,
  TITLE_SIZE_OPTIONS,
} from "@/lib/theme-presets/typography"

/** Tokens rendered as swatches on a preset card, in display order. */
const SWATCH_TOKENS = [
  "background",
  "primary",
  "secondary",
  "accent",
  "border",
  "sidebar",
]

const BRANCHES = [
  { value: "main", label: "main" },
  { value: "feat/search", label: "feat/search" },
  { value: "fix/sidebar", label: "fix/sidebar" },
]

function PresetCard({
  name,
  description,
  code,
  swatches,
  active,
  onSelect,
}: {
  name: string
  description: string
  code: string | null
  /** Light-theme tokens to show as colors; omitted for the base theme. */
  swatches?: Record<string, string>
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-4 text-left transition-colors",
        active
          ? "border-ring bg-muted/50 ring-2 ring-ring/30"
          : "border-border hover:bg-muted/40"
      )}
    >
      {swatches ? (
        <span className="flex overflow-hidden rounded-md border border-border">
          {SWATCH_TOKENS.map((token) => (
            <span
              key={token}
              className="h-6 flex-1"
              style={{ backgroundColor: swatches[token] }}
            />
          ))}
        </span>
      ) : null}
      <span className="flex flex-col gap-0.5">
        <span className="text-xs font-medium">{name}</span>
        <span className="text-xs/relaxed text-muted-foreground">
          {description}
        </span>
      </span>
      {code ? (
        <span className="font-mono text-[0.625rem] text-muted-foreground">
          {code}
        </span>
      ) : null}
    </button>
  )
}

export function AppearanceSettings() {
  const {
    code,
    preset,
    overrides,
    title,
    setPreset,
    setBlockTone,
    setTitleSize,
  } = useThemePreset()
  const [branch, setBranch] = React.useState("main")
  const titleSize = TITLE_SIZES[title ?? DEFAULT_TITLE_SIZE]

  async function copyCode() {
    if (!preset) {
      return
    }

    try {
      await navigator.clipboard.writeText(preset.code)
    } catch {
      // Clipboard blocked (insecure context, denied permission).
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading heading-screen font-medium">Apariencia</h1>
        <p className="text-sm text-muted-foreground">
          Elegí un preset para ver cómo cambia el diseño de toda la aplicación.
          Se guarda en este navegador.
        </p>
      </div>

      <Separator />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading heading-section font-medium">Presets</h2>
          <p className="text-xs/relaxed text-muted-foreground">
            Cada preset define los tokens de color (claro y oscuro), el radio y
            la tipografía.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Presets de diseño"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <PresetCard
            name="Predeterminado"
            description="Tema base Mira con Inter y radio 0.625rem"
            code={null}
            active={code === null}
            onSelect={() => setPreset(null)}
          />
          {PRESET_CATALOG.map((entry) => (
            <PresetCard
              key={entry.code}
              name={entry.name}
              description={entry.description}
              code={entry.code}
              swatches={entry.light}
              active={entry.code === code}
              onSelect={() => setPreset(entry.code)}
            />
          ))}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading heading-section font-medium">
            Tipografía
          </h2>
          <p className="text-xs/relaxed text-muted-foreground">
            El tamaño se aplica al título de pantalla y escala proporcionalmente
            las secciones y los títulos de diálogos. Se guarda en este
            navegador.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Tamaño de títulos"
          className="flex flex-wrap gap-1"
        >
          {TITLE_SIZE_OPTIONS.map((step) => {
            const active = (title ?? DEFAULT_TITLE_SIZE) === step

            return (
              <button
                key={step}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTitleSize(step)}
                className={cn(
                  "rounded-md border px-2 py-1 text-[0.625rem] transition-colors",
                  active
                    ? "border-ring bg-muted/50 text-foreground ring-1 ring-ring/30"
                    : "border-border text-muted-foreground hover:bg-muted/40"
                )}
              >
                {TITLE_SIZES[step].label}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <p className="font-heading heading-screen font-medium">
            Título de pantalla
          </p>
          <span className="font-mono text-[0.625rem] text-muted-foreground">
            {titleSize.size} / {titleSize.leading}
          </span>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading heading-section font-medium">Bloques</h2>
          <p className="text-xs/relaxed text-muted-foreground">
            Elegí de qué parte de la paleta toma la superficie cada bloque. Los
            tonos apuntan a los tokens del preset, así que valen igual en claro
            y en oscuro.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {BLOCKS.map((block) => {
            const selected = overrides[block.id] ?? "preset"

            return (
              <div
                key={block.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <span className="text-xs font-medium">{block.label}</span>
                <div
                  role="radiogroup"
                  aria-label={block.label}
                  className="flex flex-wrap gap-1"
                >
                  {block.tones.map((tone) => {
                    const active = selected === tone

                    return (
                      <button
                        key={tone}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setBlockTone(block.id, tone)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-[0.625rem] transition-colors",
                          active
                            ? "border-ring bg-muted/50 text-foreground ring-1 ring-ring/30"
                            : "border-border text-muted-foreground hover:bg-muted/40"
                        )}
                      >
                        {BLOCK_TONE_LABELS[tone]}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs/relaxed text-muted-foreground">
          Cada tono mueve la superficie del bloque junto con sus pares (texto,
          hover, borde y acento). Los hovers de la grilla, las tarjetas de aviso
          (success/warning/info) y el estilo estructural siguen viniendo del
          preset.
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading heading-section font-medium">
            Vista previa
          </h2>
          <p className="text-xs/relaxed text-muted-foreground">
            Los controles de abajo usan los tokens del preset{" "}
            {preset ? preset.name : "predeterminado"}.
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-md border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Guardar</Button>
            <Button variant="outline">Cancelar</Button>
            <Button variant="destructive">Eliminar</Button>
            <Button variant="link">Ver detalle</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Producción</Badge>
            <Badge variant="secondary">Preview</Badge>
            <Badge variant="outline">Draft</Badge>
            <Badge variant="success">Ready</Badge>
            <Badge variant="warning">Building</Badge>
            <Badge variant="destructive">Failed</Badge>
            <Badge variant="info">Queued</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input defaultValue="acme-web" className="max-w-48" />
            <Select
              items={BRANCHES}
              value={branch}
              onValueChange={(next) => setBranch(next ?? "main")}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rama" />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">
              Progreso del deploy
            </span>
            <Progress value={62} />
          </div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          disabled={
            code === null &&
            Object.keys(overrides).length === 0 &&
            title === undefined
          }
          onClick={() => setPreset(null)}
        >
          Restablecer
        </Button>
        {preset ? (
          <>
            <span className="font-mono text-xs text-muted-foreground">
              {preset.code}
            </span>
            <Button variant="outline" onClick={copyCode}>
              <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
              Copiar código
            </Button>
          </>
        ) : null}
      </section>

      <p className="text-xs/relaxed text-muted-foreground">
        El estilo estructural (nova, vega, …), la librería de iconos y el fondo
        translúcido del menú no se aplican en runtime: viven en las clases de
        los componentes, no en los tokens.
      </p>
    </div>
  )
}
