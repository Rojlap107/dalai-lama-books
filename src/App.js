import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import BookCatalog from './BookCatalog';
import BookDetail from './BookDetail';

function App() {
  return ( 
      <Router basename="/dalai-lama-books">
        <div className="App">
        <header style={{ 
          backgroundColor: '#9E0000', 
          color: 'white', 
          padding: '12px 20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  margin: 0,
                  letterSpacing: '0.5px'
                }}>
                  Dalai Lama Books
                </h1>
              </div>
            </Link>
            
            <nav>
              <ul style={{ 
                display: 'flex', 
                listStyle: 'none', 
                margin: 0, 
                padding: 0, 
                gap: '1.5rem' 
              }}>
                <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link></li>
                <li><Link to="/categories" style={{ color: 'white', textDecoration: 'none' }}>Categories</Link></li>
                <li><Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main style={{ marginTop: '64px' }}>
          <Routes>
            <Route path="/" element={<BookCatalog />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/categories" element={<div className="p-12 text-center">Categories page coming soon!</div>} />
            <Route path="/about" element={<div className="p-12 text-center">About page coming soon!</div>} />
          </Routes>
        </main>
        
        <footer style={{ 
          backgroundColor: '#333', 
          color: 'white', 
          padding: '20px', 
          textAlign: 'center',
          marginTop: '40px'
        }}>
          <p>© 2025 Dalai Lama Books - All works by His Holiness the 14th Dalai Lama</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;