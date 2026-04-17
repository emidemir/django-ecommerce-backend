import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="content-area">
        {/* This is where the specific page content will render */}
        <Outlet /> 
      </main>
      {/* We can add a Footer here later */}
    </div>
  );
}

export default App;