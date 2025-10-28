
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Media <span className="text-blue-600">Insight Hub</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-500">Staf Humas</span>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 font-bold">SH</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
