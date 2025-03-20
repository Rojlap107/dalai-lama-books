import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';

import { Link, useLocation } from 'react-router-dom';

const BookCatalog = () => {
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    yearRange: [1960, 2025],
    coAuthored: false
  });
  const [sortBy, setSortBy] = useState('year_desc');
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/dalailama_books.csv');
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setError("Error parsing book data");
              console.error(results.errors);
              return;
            }
            
            // Process and clean data
            const processedBooks = results.data.map(book => ({
              ...book,
              isCoAuthored: book.author && 
                book.author.toLowerCase().includes('dalai lama') && 
                book.author.toLowerCase().includes(' and ')
            }));
            
            // Extract unique categories from books
            const uniqueCategories = ['all'];
            processedBooks.forEach(book => {
              if (book.category && !uniqueCategories.includes(book.category)) {
                uniqueCategories.push(book.category);
              }
            });
            
            setCategories(uniqueCategories);
            setBooks(processedBooks);
            setFilteredBooks(processedBooks);
            setLoading(false);
          },
          error: (error) => {
            setError("Failed to load book data");
            console.error(error);
            setLoading(false);
          }
        });
      } catch (error) {
        setError("Failed to fetch book data");
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let results = [...books];
    
    // Text search
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter(book => 
        (book.title && book.title.toLowerCase().includes(term)) || 
        (book.description && book.description.toLowerCase().includes(term)) ||
        (book.author && book.author.toLowerCase().includes(term))
      );
    }
    
    // Year range
    results = results.filter(book => 
      book.year >= filters.yearRange[0] && book.year <= filters.yearRange[1]
    );
    
    // Co-authored filter
    if (filters.coAuthored) {
      results = results.filter(book => book.isCoAuthored);
    }
    
    // Category filter
    if (activeCategory !== 'all') {
      results = results.filter(book => 
        book.category && book.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    
    // Sorting
    switch (sortBy) {
      case 'year_asc':
        results = _.orderBy(results, ['year'], ['asc']);
        break;
      case 'year_desc':
        results = _.orderBy(results, ['year'], ['desc']);
        break;
      case 'title_asc':
        results = _.orderBy(results, [(book) => book.title?.toLowerCase()], ['asc']);
        break;
      case 'title_desc':
        results = _.orderBy(results, [(book) => book.title?.toLowerCase()], ['desc']);
        break;
      default:
        results = _.orderBy(results, ['year'], ['desc']);
    }
    
    setFilteredBooks(results);
  }, [books, filters, sortBy, activeCategory]);

  const handleSearchChange = (event) => {
    setFilters({
      ...filters,
      searchTerm: event.target.value
    });
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const toggleCoAuthoredFilter = () => {
    setFilters({
      ...filters,
      coAuthored: !filters.coAuthored
    });
  };

  const setCategory = (category) => {
    setActiveCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };
  
  // Pagination functions
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  
  // Get current page books
  const getCurrentPageBooks = () => {
    return filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  };
  
  // Change page
  const paginate = (pageNumber) => {
    // Make sure pageNumber is within valid range
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, activeCategory, sortBy]);
  
  // Reset to page 1 when navigating to home
  useEffect(() => {
    // Check if we're on the home page
    if (location.pathname === '/') {
      setCurrentPage(1);
    }
  }, [location]);

  if (loading) {
    return <div className="text-center py-12">Loading book collection...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, author, or description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={filters.searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <select 
              value={sortBy} 
              onChange={handleSortChange}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="year_desc">Newest First</option>
              <option value="year_asc">Oldest First</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
            </select>
            
            <button
              onClick={toggleCoAuthoredFilter}
              className={`px-4 py-2 rounded-lg border ${
                filters.coAuthored 
                  ? 'bg-amber-100 border-amber-300 text-amber-800' 
                  : 'bg-white border-gray-300'
              }`}
            >
              {filters.coAuthored ? '✓ Co-authored Only' : 'Co-authored Books'}
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setCategory(category)}
              className={`px-3 py-1 whitespace-nowrap rounded-full ${
                activeCategory === category 
                  ? 'bg-red-800 text-white' 
                  : 'bg-gray-100'
              }`}
            >
              {category === 'all' ? 'All Books' : _.startCase(category)}
            </button>
          ))}
        </div>

        <p className="text-gray-600 mb-4">Showing {filteredBooks.length} of {books.length} books</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getCurrentPageBooks().map((book, index) => {
          // Calculate the actual index in the original array for the book detail link
          const originalIndex = books.findIndex(b => 
            b.title === book.title && b.author === book.author && b.year === book.year
          );
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border-b-4 border-red-800">
              <Link 
                to={`/book/${originalIndex !== -1 ? originalIndex : index}`}
                className="h-64 overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                {book.image_url ? (
                  <img 
                    src={book.image_url} 
                    alt={book.title} 
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/200x300?text=No+Cover";
                    }}
                  />
                ) : (
                  <div className="text-center p-4">No cover available</div>
                )}
              </Link>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-1">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                <p className="text-sm text-gray-500 mb-2">{book.publisher}, {book.year}</p>
                {book.category && (
                  <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2">
                    {_.startCase(book.category)}
                  </span>
                )}
                <p className="text-sm flex-1 overflow-hidden line-clamp-3 mb-4">
                  {book.description || "No description available."}
                </p>
                <div className="mt-auto">
                  <Link 
                  to={`/book/${originalIndex !== -1 ? originalIndex : index}`} 
                  className="block w-full bg-red-800 text-white py-2 rounded hover:bg-red-900 transition-colors text-center"
                  >
                  View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredBooks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p>No books match your current filters. Try adjusting your search criteria.</p>
        </div>
      )}
      
      {/* Pagination */}
      {filteredBooks.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } text-sm font-medium focus:z-10 focus:outline-none`}
            >
              First
            </button>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border-t border-b ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } text-sm font-medium focus:z-10 focus:outline-none`}
            >
              Previous
            </button>
            <div className="relative inline-flex items-center px-4 py-2 border-t border-b bg-white text-gray-700 text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border-t border-b ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } text-sm font-medium focus:z-10 focus:outline-none`}
            >
              Next
            </button>
            <button
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } text-sm font-medium focus:z-10 focus:outline-none`}
            >
              Last
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default BookCatalog;