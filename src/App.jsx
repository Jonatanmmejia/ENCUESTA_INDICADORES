import React, { useState, useEffect } from 'react';
import SurveyLayout from './components/SurveyLayout';
import SurveyForm from './components/SurveyForm';
import CursorEffect from './components/CursorEffect';

function App() {
  const [isClientMode, setIsClientMode] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      setIsClientMode(window.location.hash === '#/cliente');
    };

    // Check initially
    checkHash();

    // Listen for hash changes
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  return (
    <>
      <CursorEffect />
      <SurveyLayout>
        <SurveyForm isClientMode={isClientMode} />
      </SurveyLayout>
    </>
  );
}

export default App;
