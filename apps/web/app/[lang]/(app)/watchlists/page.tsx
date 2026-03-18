import { initI18nForPage } from "@/lib/i18n";
import { getUserWatchlists } from "@/lib/actions/watchlists";
import { getSession } from "@/lib/sessionCache";
import { canCreateWatchlist } from "@/lib/plans";
import { WatchlistsPage } from "./watchlists-page";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function WatchlistsRoute({ params }: Props) {
  await initI18nForPage(params);
  const session = await getSession();
  const watchlists = session ? await getUserWatchlists() : [];
  const username = session?.user?.username ?? null;
  const limit = session
    ? await canCreateWatchlist(session.user.id)
    : { allowed: false, current: 0, max: 0 };

  return (
    <WatchlistsPage
      initialWatchlists={watchlists}
      username={username}
      limitReached={!limit.allowed}
    />
  );
}
