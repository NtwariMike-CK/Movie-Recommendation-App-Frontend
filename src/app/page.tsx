"use client";

import { useState, useEffect, useRef } from 'react';
import MovieSection from './../components/recommendemovies';

// Define Movie interface that's compatible with MovieSection component
interface Movie {
  id: number;
  title: string;
  image?: string; // Required by MovieSection
  overview?: string;
  release_date?: string;
  vote_average?: number;
  poster_path?: string;
  // [key: string]: any;
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch all movies for dropdown
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${apiUrl}/movies`);
        
        if (!response.ok) throw new Error("Failed to fetch movies");
        const data = await response.json();
        
        // Sort movies alphabetically by title
        const sortedMovies = [...data].sort((a, b) => 
          a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        );
        
        setMovies(sortedMovies);
      } catch (error) {
        console.error("Error fetching movies: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Handle click outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery("");
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setSearchQuery("");
    setIsOpen(false);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleShowRecommendations = async () => {
    if (!selectedMovie) return;
    
    setShowRecommendations(true);
    setRecommendationsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${apiUrl}/recommendations/${selectedMovie.id}`);
      
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      
      // Transform data to include 'image' property required by MovieSection
      const formattedRecommendations = data.map((movie: 
        {
          id: number;
          title: string;
          poster_path: string | null;
          overview: string;
          release_date: string;
          vote_average: number;
        }) => ({
        id: movie.id,
        title: movie.title,
        image: movie.poster_path,
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average
      }));
      
      setRecommendations(formattedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Filter movies based on search query
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex justify-center items-center h-screen bg-black-100">
      {/* Add link to Greek font */}
      
      <div className="w-[70%] h-[94%] p-8 rounded-lg shadow-lg items-center overflow-y-auto no-scrollbar">
        <div>
          <p className="text-white text-3xl font-bold greek-font-title">Movie Recommendation System Using Machine Learning</p>
        </div>
        <div>
          <h3 className='my-5 text-m text-white greek-font'>Type or select a movie from dropdown</h3>
          <div className="relative z-10" ref={dropdownRef}>
            {!isOpen ? (
              <button
                onClick={toggleDropdown}
                className="bg-gray-700 text-white w-[90%] px-4 py-2 hover:bg-gray-800 border-2 border-transparent hover:border-red-500 box-border text-left greek-font"
              >
                {selectedMovie ? selectedMovie.title : "Select Movie"}
              </button>
            ) : (
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Type to search for movies..."
                className="bg-gray-700 text-white w-[90%] px-4 py-2 border-2 border-red-500 outline-none text-left greek-font" 
              />
            )}

            {isOpen && (
              <div className="absolute mt-2 w-[90%] bg-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto no-scrollbar">
                {loading ? (
                  <div className="px-4 py-2 text-white greek-font text-left">Loading movies...</div>
                ) : filteredMovies.length > 0 ? (
                  filteredMovies.map((movie) => (
                    <div 
                      key={movie.id}
                      className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white greek-font text-left"
                      onClick={() => handleSelectMovie(movie)}
                    >
                      {movie.title}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-white greek-font text-left">No movies found matching &quot;{searchQuery}&quot;</div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <div>
            <button 
              onClick={handleShowRecommendations}
              className={`rounded-md border border-gray-400 px-3 py-2 my-5 hover:border-red-500 hover:shadow-lg transition-all text-white greek-font ${selectedMovie ? 'hover:text-red-500 hover:border-4' : 'opacity-50 cursor-not-allowed'}`}
              disabled={!selectedMovie}
            >
              Show Recommendation
            </button>
          </div>
          {showRecommendations ? (
            recommendationsLoading ? (
              <div className="text-white greek-font">Loading recommendations...</div>
            ) : recommendations.length > 0 ? (
              <MovieSection movies={recommendations} />
            ) : (
              <div className="text-white greek-font">No recommendations found</div>
            )
          ) : (
            <div className="text-white greek-font">Select a movie and click &quot;Show Recommendation&quot; to see similar movies</div>
          )}
        </div>
      </div>
    </main>
  );
};
