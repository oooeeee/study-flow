import { useState } from 'react'
import { WatchlistPage } from './pages/WatchlistPage'
import { WatchedPage } from './pages/WatchedPage'
import './App.css'

type Page = 'watchlist' | 'watched'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('watchlist')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Movie Planner</h1>
        <nav className="app-nav">
          <button
            className={`nav-button ${currentPage === 'watchlist' ? 'active' : ''}`}
            onClick={() => setCurrentPage('watchlist')}
          >
            Watchlist
          </button>
          <button
            className={`nav-button ${currentPage === 'watched' ? 'active' : ''}`}
            onClick={() => setCurrentPage('watched')}
          >
            Watched
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentPage === 'watchlist' && <WatchlistPage />}
        {currentPage === 'watched' && <WatchedPage />}
      </main>
    </div>
  )
}

export default App
