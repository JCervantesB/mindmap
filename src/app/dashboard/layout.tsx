"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Plus, Map, Search, MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { InterviewHistorySidebar } from "@/components/dashboard/InterviewHistorySidebar";
import { InterviewDialog } from "@/components/interview/InterviewDialog";
import { NotificationsDialog } from "@/components/NotificationsDialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onOpenInterview?: (sessionId?: string) => void;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/notifications")
        .then((res) => res.ok ? res.json() : { unreadCount: 0 })
        .then((data) => setUnreadNotifications(data.unreadCount || 0))
        .catch(() => {});
    }
  }, [isSignedIn, notificationsOpen]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleNewInterview = () => {
    setResumeSessionId(null);
    setIsInterviewOpen(true);
  };

  const handleResumeSession = (sessionId: string) => {
    setResumeSessionId(sessionId);
    setIsInterviewOpen(true);
  };

  const handleInterviewComplete = (result: { sessionId: string; mapId?: string }) => {
    setIsInterviewOpen(false);
    setResumeSessionId(null);
    if (result.mapId) {
      router.push(`/dashboard/${result.mapId}`);
    }
  };

  if (!mounted || !isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Cargando...
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r bg-card">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-4">
          <a href="/dashboard" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-bold">MindMap</span>
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-1">
            <a
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm font-medium"
            >
              <Map className="h-4 w-4" />
              Mis mapas
            </a>
          </div>

          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar mapas..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Interview History */}
          <InterviewHistorySidebar
            onNewInterview={handleNewInterview}
            onResumeSession={handleResumeSession}
          />
        </nav>

        {/* Create New */}
        <div className="border-t p-4 space-y-2">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleNewInterview}
          >
            <MessageSquare className="h-4 w-4" />
            Nueva entrevista
          </Button>
        </div>

        {/* User */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserButton />
              <span className="text-sm text-muted-foreground">Mi cuenta</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(true)}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>

      {/* Interview Dialog */}
      <InterviewDialog
        open={isInterviewOpen}
        onOpenChange={setIsInterviewOpen}
        onComplete={handleInterviewComplete}
        resumeSessionId={resumeSessionId}
      />

      {/* Notifications Dialog */}
      <NotificationsDialog
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </div>
  );
}
