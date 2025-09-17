import React, { Suspense } from 'react'
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
import MusicErrorBoundary from "./components/errorBoundary/MusicErrorBoundary"
import "./index.css"

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: (
      <MusicErrorBoundary 
        fallbackMessage="There was an issue loading this page"
        onReset={() => window.location.href = '/'}
      >
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Page Error</h1>
            <p className="text-gray-600 mb-4">Something went wrong with this page.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </MusicErrorBoundary>
    ),
    children: [
      { 
        path: '', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading the home page">
            <HomePage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'uploads', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading your uploads">
            <UploadsPage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'favorites', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading your favorites">
            <FavoritesPage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'profile', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading your profile">
            <ProfilePage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'settings', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading settings">
            <SettingsPage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: "/playlist/:playlistId", 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading this playlist">
            <PlaylistPage />
          </MusicErrorBoundary>
        ) 
      },
      { path: '*', element: <NotFound404 /> },
    ]
  }
])

function App() {
  return (
    <MusicErrorBoundary 
      fallbackMessage="We're having trouble loading the music app. This might be a temporary issue."
      onReset={() => {
        // Clear all stored data and reload
        localStorage.removeItem('musicAppData')
        sessionStorage.clear()
        window.location.reload()
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <MusicProvider>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading music app...</p>
                </div>
              </div>
            }>
              <RouterProvider router={router} />
            </Suspense>
          </MusicProvider>
        </AuthProvider>
      </ThemeProvider>
    </MusicErrorBoundary>
  )
}

export default App