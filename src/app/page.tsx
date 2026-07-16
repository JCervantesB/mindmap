"use client";

import { useAuth } from "@clerk/nextjs";
import { Brain, Sparkles, BookOpen, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Home() {
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">MindMap</span>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">MindMap</span>
          </div>
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <Button variant="outline">Iniciar sesión</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Comenzar</Button>
                </SignUpButton>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <a href="/dashboard">
                  <Button variant="outline">Mis mapas</Button>
                </a>
                <UserButton />
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 w-full">
        <section className="w-full py-24 md:py-32 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Transforma ideas en{" "}
              <span className="text-primary">mapas mentales vivos</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Crea mapas mentales enriquecidos con investigación pedagógica asistida
              por IA. Cada nodo es una unidad de estudio con contexto, conexiones y
              profundidad didáctica.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {!isSignedIn ? (
                <SignUpButton mode="modal">
                  <Button size="lg" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Crear mi primer mapa
                  </Button>
                </SignUpButton>
              ) : (
                <a href="/dashboard">
                  <Button size="lg" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Ir a mis mapas
                  </Button>
                </a>
              )}
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Ver demostración
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-16 px-4">
          <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Network className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Entrevista inteligente</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Un agente de IA te hace preguntas precisas para entender tu objetivo
                y crear mapas contextualmente relevantes.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                Contenido pedagógico
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Genera contenido estructurado con definiciones, ejemplos,
                preguntas de estudio y relaciones entre conceptos.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Investigación profunda</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Integra fuentes externas y genera contenido fundamentado en
                investigación real, no solo en conocimiento de la IA.
              </p>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="w-full py-16 px-4">
          <div className="mx-auto max-w-3xl rounded-lg border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">Estado del proyecto</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta aplicación está en desarrollo activo. La infraestructura base
              está lista y el canvas interactivo está siendo implementado.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 w-full">
        <div className="w-full text-center text-sm text-muted-foreground">
          MindMap — Plataforma de mapas mentales con investigación pedagógica
          asistida por IA
        </div>
      </footer>
    </div>
  );
}
