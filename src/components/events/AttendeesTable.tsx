
import React from 'react';
import { Search, UserCheck, Check, X, QrCode, Mail, Download, Printer, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Attendee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  dietaryRestrictions?: string;
  registrationDate: string;
  checkedIn: boolean;
  checkinTime: string | null;
  qrCode: string;
}

interface AttendeesTableProps {
  attendees: Attendee[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setManualAddDialogOpen: (open: boolean) => void;
  handleExportAttendees: () => void;
  handleViewQR: (attendee: Attendee) => void;
  handleSendInvitation: (attendee: Attendee) => void;
  handleToggleCheckin: (attendeeId: string) => void;
}

const AttendeesTable: React.FC<AttendeesTableProps> = ({
  attendees,
  searchQuery,
  setSearchQuery,
  setManualAddDialogOpen,
  handleExportAttendees,
  handleViewQR,
  handleSendInvitation,
  handleToggleCheckin
}) => {
  const filteredAttendees = attendees.filter(attendee => 
    attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attendee.phone.includes(searchQuery)
  );

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attendees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setManualAddDialogOpen(true)} variant="default" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Manually
          </Button>
          <Button onClick={handleExportAttendees} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button onClick={() => window.print()} variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print List
          </Button>
        </div>
      </div>
      
      {filteredAttendees.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendees.map((attendee) => {
                const registrationDate = new Date(attendee.registrationDate);
                return (
                  <TableRow key={attendee.id}>
                    <TableCell className="font-medium">{attendee.name}</TableCell>
                    <TableCell>{attendee.email}</TableCell>
                    <TableCell>{attendee.phone}</TableCell>
                    <TableCell>
                      {registrationDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={attendee.checkedIn ? "default" : "outline"}>
                        {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewQR(attendee)}
                        >
                          <QrCode className="h-4 w-4" />
                          <span className="sr-only">View QR Code</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSendInvitation(attendee)}
                        >
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Send Invitation</span>
                        </Button>
                        <Button
                          variant={attendee.checkedIn ? "destructive" : "default"}
                          size="icon"
                          onClick={() => handleToggleCheckin(attendee.id)}
                        >
                          {attendee.checkedIn ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {attendee.checkedIn ? 'Check Out' : 'Check In'}
                          </span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10">
          <UserCheck className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">No attendees found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'No attendees match your search criteria.' 
              : 'There are no attendees registered for this event yet.'}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default AttendeesTable;
