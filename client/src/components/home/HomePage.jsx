import SongCard from "../songCard/SongCard.jsx"

// Mock data for featured songs
const featuredSongs = [
  {
    id: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:20",
    cover: "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover",
    url: "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover",
  },
  {
    id: 2,
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: "2:54",
    cover: "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover",
    url: "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover",
  },
  {
    id: 3,
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:23",
    cover: "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover",
    url: "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover",
  },
  {
    id: 4,
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    duration: "2:58",
    cover: "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover",
    url: "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover",
  },
]

export default function HomePage() {
  return (
    <main className="space-y-8" role="main" aria-labelledby="home-page-title">
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-800 to-purple-600 p-8 text-white"
        aria-labelledby="hero-title"
      >
        <div className="relative z-10">
          <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Welcome to StreamFlow
          </h1>
          <p className="text-lg sm:text-xl mb-6 max-w-2xl opacity-90">
            Discover, upload, and stream your favorite music. Create playlists, manage your library, and enjoy a seamless music experience.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              aria-label="Start uploading music"
            >
              Start Uploading
            </button>
            <button 
              className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              aria-label="Explore music library"
            >
              Explore Library
            </button>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-24 -translate-x-24" aria-hidden="true"></div>
      </section>

      {/* Featured Songs */}
      <section aria-labelledby="featured-songs-title">
        <h2 id="featured-songs-title" className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Featured Songs
        </h2>
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
          role="list"
          aria-label="Featured songs"
        >
          {featuredSongs.map((song) => (
            <div key={song.id} role="listitem">
              <SongCard song={song} />
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section aria-labelledby="trending-songs-title">
        <h2 id="trending-songs-title" className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Trending Now
        </h2>
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
          role="list"
          aria-label="Trending songs"
        >
          {featuredSongs.slice(1, 4).map((song) => (
            <div key={`trending-${song.id}`} role="listitem">
              <SongCard song={song} />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}