"use client";

import { useRef } from "react";
import Image from 'next/image';
import "../styles/scrollbar.css";

// interface Movie {
//   title: string;
//   image: string;
// }

interface Movie {
  id?: number;      // For recommendations API
  movie_id?: number; // For all movies API
  title: string;
  image?: string; // Required by MovieSection
  poster_path: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  genres?: string[];
}

interface MovieSectionProps {
  movies: Movie[];
}

export default function MovieSection({ movies }: MovieSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAmount = 200; // px to scroll per button click

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full py-4">
      <h2 className="text-2xl font-bold mb-4">Recommended Movies</h2>
      <div className="flex items-center">
        <button 
          onClick={scrollLeft}
          className="bg-gray-800 text-white p-2 rounded-full mr-2 hover:bg-gray-700"
        >
          ◀
        </button>
        <div 
          ref={containerRef}
          className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {movies.map((movie, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden"
              style={{ width: '180px' }} // Fixed width
            >
              <div className="h-64 bg-gray-800 relative"> {/* Fixed height */}
                {movie.image? (
                  <Image
                    src={movie.image} 
                    alt={movie.title}
                    width={180}
                    height={256}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div className="p-3 h-16"> {/* Fixed height for title area */}
                <h3 className="text-sm font-medium line-clamp-2">{movie.title}</h3>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={scrollRight}
          className="bg-gray-800 text-white p-2 rounded-full ml-2 hover:bg-gray-700"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
