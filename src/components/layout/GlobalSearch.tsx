
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'event' | 'voucher' | 'attendee';
  path: string;
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Simulazione di una ricerca con ritardo
    setTimeout(() => {
      // In un'applicazione reale, questa sarebbe una chiamata API
      const mockResults: SearchResult[] = [
        { id: '1', title: 'Tech Conference 2023', type: 'event', path: '/events/tech-conference-2023' },
        { id: '2', title: 'Coffee Break Voucher', type: 'voucher', path: '/events/1/vouchers' },
        { id: '3', title: 'Mario Rossi', type: 'attendee', path: '/check-in' },
      ];
      
      setResults(mockResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      ));
      setIsSearching(false);
    }, 500);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setSearchQuery('');
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 hidden md:flex"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span>Cerca...</span>
        <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Cerca</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ricerca globale</DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca eventi, voucher, partecipanti..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1 h-8 w-8"
                onClick={() => {
                  setSearchQuery('');
                  setResults([]);
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="space-y-2 py-2">
                <Skeleton className="h-10 rounded-md" />
                <Skeleton className="h-10 rounded-md" />
                <Skeleton className="h-10 rounded-md" />
              </div>
            ) : results.length > 0 ? (
              <ul className="divide-y">
                {results.map((result) => (
                  <li key={result.id} className="py-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-left"
                      onClick={() => handleResultClick(result)}
                    >
                      <div>
                        <div className="font-medium">{result.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">{result.type}</div>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : searchQuery.length > 1 ? (
              <div className="py-6 text-center text-muted-foreground">
                Nessun risultato trovato per "{searchQuery}"
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalSearch;
