
import React from 'react';

const Header = () => {
  return (
    <header className="w-full bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
            <img 
              src="/lovable-uploads/09667bc0-9af8-468b-9c4c-d4844d158bc0.png" 
              alt="Vity Logo" 
              className="h-12 w-auto"
            />
          </div>
        </div>
        <div className="text-center mt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            ✨ Certificación Laboral
          </h1>
          <p className="text-white/90 mt-2 text-base md:text-lg font-medium drop-shadow-md">
            Genera tu certificado de manera fácil y súper rápida 🚀
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
