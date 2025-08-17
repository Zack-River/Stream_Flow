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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 text-white mb-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-purple-800 to-purple-600"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">Welcome to StreamFlow</h1>
          <p className="text-lg opacity-90 mb-6 max-w-md">
            Discover, upload, and stream your favorite music with our modern platform
          </p>
          <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Listening
          </button>
        </div>
      </div>

      {/* Featured Songs */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Featured Songs</h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4">
          {featuredSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </div>

      {/* Trending Now */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4">
          {featuredSongs.slice(1, 4).map((song) => (
            <SongCard key={`trending-${song.id}`} song={song} />
          ))}
        </div>
      </div>
    </div>
  )
}