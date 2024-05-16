import "./App.css"; 
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './components/HomePage';
import CreateNFT from './components/CreateNFT';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <nav className="bg-gray-800 p-4">
          <Link to="/" className="text-white hover:text-gray-300">Home</Link>
          
        </nav>
        <div className="flex justify-center items-center h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
