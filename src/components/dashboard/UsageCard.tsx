"use client";

import { useEffect, useState } from "react";
import { Activity, Zap, Timer, Sparkles } from "lucide-react";

interface Usage {
  totalGenerations: number;
  totalTokens: number;
  avgLatencyMs: number;
  last30Days: number;
}

export function UsageCard() {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/usage")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setUsage(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!usage || usage.totalGenerations === 0) return null;

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={<Sparkles className="h-4 w-4 text-primary" />}
        label="Generaciones"
        value={String(usage.totalGenerations)}
      />
      <StatCard
        icon={<Activity className="h-4 w-4 text-primary" />}
        label="Últimos 30 días"
        value={String(usage.last30Days)}
      />
      <StatCard
        icon={<Zap className="h-4 w-4 text-primary" />}
        label="Tokens"
        value={usage.totalTokens.toLocaleString("es-ES")}
      />
      <StatCard
        icon={<Timer className="h-4 w-4 text-primary" />}
        label="Latencia media"
        value={`${(usage.avgLatencyMs / 1000).toFixed(1)}s`}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}