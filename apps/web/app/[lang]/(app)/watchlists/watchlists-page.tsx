"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, LogIn } from "lucide-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useLocalePath } from "@/lib/useLocalePath";
import { useAuth } from "@/lib/useAuth";
import type { WatchlistSummary } from "@/lib/actions/watchlists";
import { createWatchlist } from "@/lib/actions/watchlists";
import { WatchlistCard, CreateWatchlistCard } from "@/components/watchlist/watchlist-card";
import { PublicWatchlistSearch } from "@/components/watchlist/public-watchlist-search";
import { Button } from "@/components/ui/Button";

export function WatchlistsPage({
  initialWatchlists,
  username,
  limitReached,
}: {
  initialWatchlists: WatchlistSummary[];
  username: string | null;
  limitReached: boolean;
}) {
  const { t } = useLingui();
  const router = useRouter();
  const lp = useLocalePath();
  const { user, isLoggedIn } = useAuth();
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (creating || !isLoggedIn) return;
    if (limitReached) {
      router.push(lp("/settings"));
      return;
    }
    setCreating(true);
    try {
      const result = await createWatchlist({
        title: "New watchlist",
        companyIds: [],
      });
      if ("slug" in result && (username ?? user?.username)) {
        router.push(lp(`/${username ?? user?.username}/${result.slug}`));
      } else {
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* My watchlists */}
      <div>
        <h1 className="mb-4 text-lg font-semibold">
          <Trans id="watchlists.page.title" comment="Title of the watchlists exploration page">
            Watchlists
          </Trans>
        </h1>

        {!isLoggedIn ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center text-muted">
            <Eye size={32} />
            <p className="text-sm">
              <Trans
                id="watchlists.page.loginPrompt"
                comment="Prompt for non-logged-in users to sign in to create watchlists"
              >
                Sign in to create and manage your own watchlists.
              </Trans>
            </p>
            <Button href={lp("/sign-in")} variant="primary" size="sm" className="gap-2">
              <LogIn size={16} />
              {t({ id: "common.auth.login", comment: "Login button label", message: "Log in" })}
            </Button>
          </div>
        ) : initialWatchlists.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center text-muted">
            <Eye size={32} />
            <p className="text-sm">
              <Trans
                id="watchlists.page.empty"
                comment="Empty state when user has no watchlists"
              >
                No watchlists yet. Create one to track jobs from your favorite
                companies.
              </Trans>
            </p>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-contrast transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {creating && <Loader2 size={14} className="animate-spin" />}
              <Trans id="watchlists.page.createFirst" comment="Button to create first watchlist">
                Create watchlist
              </Trans>
            </button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {initialWatchlists.map((wl) => (
              <WatchlistCard
                key={wl.id}
                watchlist={wl}
                ownerUsername={username}
              />
            ))}
            <CreateWatchlistCard
              onClick={handleCreate}
              creating={creating}
              disabled={limitReached}
            />
          </div>
        )}
      </div>

      {/* Public search — always visible */}
      <PublicWatchlistSearch />
    </div>
  );
}
