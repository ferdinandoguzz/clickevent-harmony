
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';

interface EmptyEventStateProps {
  searchQuery: string;
  activeTab: string;
  canCreateEvent: boolean;
  onClearSearch: () => void;
  onCreateEvent: () => void;
}

export const EmptyEventState: React.FC<EmptyEventStateProps> = ({
  searchQuery,
  activeTab,
  canCreateEvent,
  onClearSearch,
  onCreateEvent
}) => {
  return (
    <div className="text-center py-10">
      <CalendarPlus className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-1">No events found</h3>
      <p className="text-muted-foreground mb-4">
        {searchQuery 
          ? 'No events match your search criteria.' 
          : activeTab === 'upcoming' 
            ? 'There are no upcoming events scheduled.'
            : activeTab === 'past'
              ? 'There are no past events.'
              : 'There are no draft events.'}
      </p>
      {searchQuery ? (
        <Button variant="outline" onClick={onClearSearch}>
          Clear search
        </Button>
      ) : canCreateEvent ? (
        <Button onClick={onCreateEvent}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Create your first event
        </Button>
      ) : null}
    </div>
  );
};
