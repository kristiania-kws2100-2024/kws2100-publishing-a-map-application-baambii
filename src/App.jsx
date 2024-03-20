// App.jsx
import React from 'react';
import MapComponent from './MapComponent';
import './App.css';

const pocachhoImageUrl =
  'https://www.pngall.com/wp-content/uploads/15/Pochacco-PNG-Photos.webp'; // Replace with your actual URL

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Kartbasert A1 Map</h1>
      </header>
      <div className="map-container">
        <MapComponent />
      </div>
      <footer>
        <p> Zoom in to look at closer at parts of Norway.</p>
      </footer>
      <img src={pocachhoImageUrl} alt="Pocachho" className="pocachho" />
    </div>
  );
}

export default App;
