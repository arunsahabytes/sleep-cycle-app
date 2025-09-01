import React from 'react';
import { FaGithub, FaTwitter } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">© {currentYear} All rights reserved</span>
          
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <FaGithub className="text-xl" />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <FaTwitter className="text-xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 