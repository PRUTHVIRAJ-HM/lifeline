'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bobbing {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes bounce-shape {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg) translateX(0); }
          25% { transform: rotate(-2deg) translateX(-2px); }
          75% { transform: rotate(2deg) translateX(2px); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-bobbing { animation: bobbing 2.5s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-bounce-shape { animation: bounce-shape 3s ease-in-out infinite; }
        .animate-wiggle { animation: wiggle 2s ease-in-out infinite; }
        .animate-shine { animation: shine 3s infinite; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 overflow-hidden">
        <div className="max-w-5xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Illustration */}
            <div className="flex justify-center md:justify-end">
              <div className="relative w-80 h-80">
                {/* Lightbulb */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-float">
                  <div className="w-16 h-20 border-4 border-slate-800 rounded-b-lg rounded-t-none">
                    <div className="w-full h-3 bg-slate-800 rounded-t-lg"></div>
                  </div>
                  {/* Lightbulb glow */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-14 bg-amber-200 rounded-b-full opacity-70 blur-lg animate-pulse-glow"></div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-b-lg bg-gradient-to-r from-transparent via-white to-transparent animate-shine opacity-30"></div>
                </div>

                {/* Decorative elements - Using Academix palette */}
                {/* Red Circle */}
                <div className="absolute bottom-8 left-0 w-24 h-24 bg-red-300 rounded-full opacity-70 animate-bounce-shape" style={{ animationDelay: '0s' }}></div>
                
                {/* Purple Square */}
                <div className="absolute bottom-12 left-20 w-20 h-20 bg-purple-300 rounded-lg opacity-70 transform rotate-45 animate-bobbing" style={{ animationDelay: '0.3s' }}></div>
                
                {/* Teal Square */}
                <div className="absolute bottom-0 right-8 w-16 h-16 bg-teal-400 rounded-lg opacity-70 transform -rotate-12 animate-bounce-shape" style={{ animationDelay: '0.6s' }}></div>
                
                {/* Green Circle - Small */}
                <div className="absolute bottom-20 right-0 w-8 h-8 bg-green-400 rounded-full opacity-60 animate-wiggle" style={{ animationDelay: '0.2s' }}></div>
                
                {/* Amber Circle - Tiny */}
                <div className="absolute top-1/2 right-12 w-6 h-6 bg-amber-300 rounded-full opacity-70 animate-spin-slow" style={{ animationDelay: '0s' }}></div>
              </div>
            </div>

            {/* Right Side - Text Content */}
            <div className="flex flex-col justify-center">

              <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Looks like you lost your way !
              </h1>

              <p className="text-lg text-slate-700 mb-10 leading-relaxed max-w-md">
                <strong>Error 404,</strong> The Page you are looking for is missing or you have typed a wrong path.
              </p>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-lg font-bold text-teal-600 hover:text-teal-700 transition-colors group"
              >
                Go home
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
