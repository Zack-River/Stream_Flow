// components/songCard/DeleteConfirmModal.jsx (Complete Implementation)
import React from 'react'

export default function DeleteConfirmModal({ show, songTitle, onConfirm, onCancel }) {
    if (!show) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-2xl">
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                    Delete Song
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm">
                    Are you sure you want to delete "{songTitle}"? This action cannot be undone and will remove it from all playlists and queue.
                </p>
                <div className="flex space-x-2 sm:space-x-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}