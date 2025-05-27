
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ showBackButton, onBack, title }) => {
  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/09667bc0-9af8-468b-9c4c-d4844d158bc0.png" 
              alt="Vity Logo" 
              className="h-10 w-10 rounded-lg shadow-md"
            />
            <div>
              <h1 className="text-xl font-bold text-white">
                {title || 'Certificado Laboral'}
              </h1>
              <p className="text-white/80 text-sm">Genera tu certificado de manera rápida y segura</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a 
            href="/admin" 
            className="text-white/80 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            Admin
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
