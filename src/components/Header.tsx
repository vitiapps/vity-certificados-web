
import React from 'react';

const Header = () => {
  return (
    <header className="w-full bg-vity-green shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/09667bc0-9af8-468b-9c4c-d4844d158bc0.png" 
            alt="Vity Logo" 
            className="h-12 w-auto"
          />
        </div>
        <div className="text-center mt-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Certificación Laboral
          </h1>
          <p className="text-white/90 mt-2 text-sm md:text-base">
            Genera tu certificado de manera fácil y segura
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
