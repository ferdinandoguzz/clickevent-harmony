
import React from 'react';
import { Building, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyClubStateProps {
  searchQuery: string;
  onClearSearch: () => void;
  onCreateClub: () => void;
}

const EmptyClubState: React.FC<EmptyClubStateProps> = ({ 
  searchQuery, 
  onClearSearch, 
  onCreateClub 
}) => {
  return (
    <div className="text-center py-10">
      <Building className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-1">No clubs found</h3>
      <p className="text-muted-foreground mb-4">
        {searchQuery ? 'No clubs match your search criteria.' : 'There are no clubs created yet.'}
      </p>
      {searchQuery ? (
        <Button variant="outline" onClick={onClearSearch}>
          Clear search
        </Button>
      ) : (
        <Button onClick={onCreateClub}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create your first club
        </Button>
      )}
    </div>
  );
};

export default EmptyClubState;
