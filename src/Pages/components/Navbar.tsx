import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">RealEndorse</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-500">Home</Link>
        <Link to="/login" className="hover:text-blue-500">Login</Link>
        <Link to="/signup" className="hover:text-blue-500">Signup</Link>
      </div>
    </nav>
  );
};

export default Navbar;
