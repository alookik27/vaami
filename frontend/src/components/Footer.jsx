import React from 'react'

const Footer = () => {
  return (
    <div>
        <footer className="border-t border-white/10 bg-black/95 backdrop-blur-2xl">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between text-xs text-zinc-400">
                <p className="text-[10px] font-mono tracking-wider">
                    &copy; {new Date().getFullYear()} Vaami. All rights reserved.
                </p>
                <p className="text-[10px] font-mono tracking-wider">
                    Made with by Aniket kumar
                </p>
                <p className="text-[10px] font-mono tracking-wider">
                    <a href="https://github.com/aniketkumar64" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        GitHub(Aniket kumar)
                    </a>
                </p>
            </div>
        </footer>
    </div>
  )
}


export default Footer