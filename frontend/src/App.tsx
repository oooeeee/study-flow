import { useState } from "react";
import { WatchlistPage } from "./pages/WatchlistPage";
import { WatchedPage } from "./pages/WatchedPage";

type Tab = "watchlist" | "watched";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("watchlist");
  const [watchedRefreshKey, setWatchedRefreshKey] = useState(0);

  function handleMarkWatched() {
    setWatchedRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <h1>Movie Planner</h1>
      <nav>
        <button
          onClick={() => setActiveTab("watchlist")}
          aria-current={activeTab === "watchlist" ? "page" : undefined}
        >
          Watchlist
        </button>
        <button
          onClick={() => setActiveTab("watched")}
          aria-current={activeTab === "watched" ? "page" : undefined}
        >
          Watched
        </button>
      </nav>
      {activeTab === "watchlist" && (
        <WatchlistPage onMarkWatched={handleMarkWatched} />
      )}
      {activeTab === "watched" && (
        <WatchedPage refreshKey={watchedRefreshKey} />
      )}
    </div>
  );
}

export default App;
