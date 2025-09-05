import React from 'react'

export default function HeroSection() {
    return (
        <div className="relative overflow-hidden rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-purple-800 to-purple-600"></div>
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Welcome to StreamFlow</h1>
                <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-4 sm:mb-6 max-w-sm sm:max-w-md">
                    Discover, upload, and stream your favorite music with our modern platform
                </p>
                <button className="bg-white text-purple-600 px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base">
                    Start Listening
                </button>
            </div>
        </div>
    )
}
