import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { MusicProvider } from "./context/MusicContext"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import Layout from "./components/layout/Layout"
import HomePage from "./components/home/HomePage"
import UploadsPage from "./components/uploads/UploadsPage"
import FavoritesPage from "./components/favorites/FavoritesPage"
import PlaylistPage from "./components/playlist/PlaylistPage"
import NotFound404 from "./components/404Page/NotFound404"
import ProfilePage from "./components/profile/ProfilePage"
import SettingsPage from "./components/settings/SettingsPage"
import "./index.css"

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'uploads', element: <UploadsPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: "/playlist/:playlistId", element: <PlaylistPage /> },
      { path: '*', element: <NotFound404 /> },
    ]
  }
])

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MusicProvider>
          <RouterProvider router={router} />
        </MusicProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App