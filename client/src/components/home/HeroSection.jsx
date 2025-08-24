import React from 'react'

export default function HeroSection() {
    return (

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
    )
}
