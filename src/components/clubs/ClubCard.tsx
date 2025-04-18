
import React from 'react';
import { Building, Edit, MoreHorizontal, Trash, UserPlus, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Club {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  eventCount: number;
  createdAt: string;
  logo?: string;
  location?: string;
}

interface ClubCardProps {
  club: Club;
  onEdit: (club: Club) => void;
  onDelete: (club: Club) => void;
  onCreateStaff: (club: Club) => void;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, onEdit, onDelete, onCreateStaff }) => {
  return (
    <Card className="hover-lift">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border">
              {club.logo ? (
                <AvatarImage src={club.logo} alt={club.name} />
              ) : (
                <AvatarFallback>{club.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle>{club.name}</CardTitle>
              <CardDescription className="mt-1">{club.description}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(club)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit club
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateStaff(club)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create staff user
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(club)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete club
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{club.memberCount} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{club.eventCount} events</span>
          </div>
          {club.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{club.location}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Created on {new Date(club.createdAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ClubCard;
