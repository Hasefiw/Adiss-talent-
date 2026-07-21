/**
 * Main App component with ErrorBoundary wrapper
 */

import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
// import Router from './Router';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <h1>Addis Talent - Coming Soon</h1>
        {/* <Router /> */}
      </div>
    </ErrorBoundary>
  );
};

export default App;
