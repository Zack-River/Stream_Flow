import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { MusicProvider } from "./context/MusicContext"
import { ThemeProvider } from "./context/ThemeContext"
import Layout from "./components/layout/Layout"
import HomePage from "./components/home/HomePage"
import UploadsPage from "./components/uploads/UploadsPage"
import FavoritesPage from "./components/favorites/FavoritesPage"
import PlaylistPage from "./components/playlist/PlaylistPage"
import NotFound404 from "./components/404Page/NotFound404"
import "./index.css"

const router = createBrowserRouter([
  {
    path: '/', 
    element: <Layout />, 
    children: [
      { path: '', element: <HomePage /> },
      { path: 'uploads', element: <UploadsPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path:"/playlist/:playlistId", element: <PlaylistPage /> }, 
      { path: '*', element: <NotFound404 /> },
    ]
  }
])

function App() {
  return (
    <ThemeProvider>
      <MusicProvider>
        <RouterProvider router={router} />
      </MusicProvider>
    </ThemeProvider>
  )
}

export default App