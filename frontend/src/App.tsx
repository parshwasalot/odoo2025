import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { UserProvider } from './contexts/UserContext';
import { ItemsProvider } from './contexts/ItemsContext';
import { MessagesProvider } from './contexts/MessagesContext';
import { LandingPage } from './components/LandingPage';
import { BrowseItems } from './components/BrowseItems';
import { Dashboard } from './components/Dashboard';
import { SocialImpactDashboard } from './components/SocialImpactDashboard';
import { Messages } from './components/Messages';
import { AddItem } from './components/AddItem';
import { AdminWrapper } from './components/AdminWrapper';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <UserProvider>
        <ItemsProvider>
          <MessagesProvider>
            <Routes>
              {/* Admin route - separate layout */}
              <Route path="/admin" element={<AdminWrapper />} />
              
              {/* Regular app routes with header */}
              <Route 
                path="/*" 
                element={
                  <div className="min-h-screen bg-gray-50">
                    <Header 
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      setIsAuthModalOpen={setIsAuthModalOpen}
                    />
                    
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <Routes>
                        <Route path="/" element={<LandingPage setCurrentPage={setCurrentPage} />} />
                        <Route path="/browse" element={<BrowseItems />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/impact" element={<SocialImpactDashboard />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/add-item" element={<AddItem />} />
                      </Routes>
                    </main>

                    <AuthModal 
                      isOpen={isAuthModalOpen}
                      onClose={() => setIsAuthModalOpen(false)}
                    />
                  </div>
                } 
              />
            </Routes>
          </MessagesProvider>
        </ItemsProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;