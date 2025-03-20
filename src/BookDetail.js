import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Papa from 'papaparse';
import _ from 'lodash';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.PUBLIC_URL}/data/dalailama_books.csv`);
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setError("Error parsing book data");
              return;
            }
            
            // Find the book with the matching ID
            const foundBook = results.data[parseInt(id)];
            if (foundBook) {
              setBook(foundBook);
            } else {
              setError("Book not found");
            }
            setLoading(false);
          },
          error: (error) => {
            setError("Failed to load book data");
            setLoading(false);
          }
        });
      } catch (error) {
        setError("Failed to fetch book data");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12">Loading book details...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  if (!book) {
    return <div className="text-center py-12">Book not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link to="/" className="inline-block mb-4 text-red-800 hover:underline">
        &larr; Back to all books
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden border-b-4 border-red-800">
        <div className="md:flex">
          <div className="md:w-1/3 p-4">
            {book.image_url ? (
              <img 
                src={book.image_url} 
                alt={book.title} 
                className="w-full object-cover rounded"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x450?text=No+Cover";
                }}
              />
            ) : (
              <div className="bg-gray-100 h-64 flex items-center justify-center rounded">
                No cover available
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 p-4">
            <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
            <p className="text-gray-700 mb-2">{book.author}</p>
            <p className="text-gray-600 mb-4">{book.publisher}, {book.year}</p>
            
            {book.category && (
              <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full mb-4">
                {_.startCase(book.category)}
              </span>
            )}
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h2 className="text-xl font-bold mb-2">Description</h2>
              <p className="text-gray-800">{book.description || "No description available."}</p>
            </div>
            
            <div className="mt-6">
              <a 
                href={`https://www.amazon.com/s?k=${encodeURIComponent(book.title + ' ' + book.author)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-red-800 text-white py-2 px-4 rounded hover:bg-red-900 transition-colors mr-3"
              >
                Find on Amazon
              </a>
              
              <a 
                href={`https://www.barnesandnoble.com/s/${encodeURIComponent(book.title + ' ' + book.author)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors"
              >
                Find on Barnes & Noble
              </a>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-4">Reader Comments</h2>
          <p className="text-gray-600 italic">Comments feature coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;