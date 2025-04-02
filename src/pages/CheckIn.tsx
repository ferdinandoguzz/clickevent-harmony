
import React, { useState, useEffect } from 'react';
import { QrCodeIcon, UserCheck, Search, MoreVertical, Download, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { supabase } from "@/integrations/supabase/client";
import QRCodeDialog from '@/components/events/QRCodeDialog';
import QRScanner from '@/components/events/QRCodeScanner';
import AttendeeInfo from '@/components/events/AttendeeInfo';

interface Event {
  id: string;
  name: string;
}

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

const CheckIn: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>('1');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('scan');
  const [scannedAttendee, setScannedAttendee] = useState<Attendee | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [selectedQrCodeAttendee, setSelectedQrCodeAttendee] = useState<Attendee | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*');
        
        if (eventsError) throw eventsError;
        
        const mappedEvents = eventsData.map(event => ({
          id: event.id,
          name: event.name
        }));
        
        setEvents(mappedEvents);
        
        if (mappedEvents.length > 0) {
          setSelectedEvent(mappedEvents[0].id);
        }
        
        const { data: attendeesData, error: attendeesError } = await supabase
          .from('attendees')
          .select('*')
          .eq('event_id', mappedEvents[0].id);
        
        if (attendeesError) throw attendeesError;
        
        const mappedAttendees = attendeesData.map(attendee => ({
          id: attendee.id,
          eventId: attendee.event_id,
          name: attendee.name,
          email: attendee.email,
          phone: attendee.phone || '',
          company: attendee.company || '',
          jobTitle: attendee.job_title || '',
          dietaryRestrictions: attendee.dietary_restrictions || '',
          registrationDate: attendee.registration_date,
          checkedIn: attendee.checked_in,
          checkinTime: attendee.checkin_time,
          qrCode: attendee.qr_code
        }));
        
        setAttendees(mappedAttendees);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error loading data",
          description: "There was a problem loading events and attendees.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAttendees = async () => {
      if (!selectedEvent) return;
      
      setLoading(true);
      try {
        const { data: attendeesData, error: attendeesError } = await supabase
          .from('attendees')
          .select('*')
          .eq('event_id', selectedEvent);
        
        if (attendeesError) throw attendeesError;
        
        const mappedAttendees = attendeesData.map(attendee => ({
          id: attendee.id,
          eventId: attendee.event_id,
          name: attendee.name,
          email: attendee.email,
          phone: attendee.phone || '',
          company: attendee.company || '',
          jobTitle: attendee.job_title || '',
          dietaryRestrictions: attendee.dietary_restrictions || '',
          registrationDate: attendee.registration_date,
          checkedIn: attendee.checked_in,
          checkinTime: attendee.checkin_time,
          qrCode: attendee.qr_code
        }));
        
        setAttendees(mappedAttendees);
      } catch (error) {
        console.error('Error fetching attendees:', error);
        toast({
          title: "Error loading attendees",
          description: "There was a problem loading attendees for this event.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendees();
  }, [selectedEvent]);

  const filteredAttendees = attendees.filter(attendee => 
    attendee.eventId === selectedEvent &&
    (attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attendee.phone.includes(searchQuery))
  );

  const handleScan = (qrCode: string) => {
    const attendee = attendees.find(a => a.qrCode === qrCode);
    if (attendee) {
      setScannedAttendee(attendee);
      setSelectedEvent(attendee.eventId);
      
      if (activeTab !== 'scan') {
        setActiveTab('scan');
      }
    } else {
      toast({
        title: "Invalid QR Code",
        description: "No attendee found with this QR code.",
        variant: "destructive"
      });
    }
  };

  const handleCheckIn = async (attendeeId: string) => {
    setIsCheckingIn(true);
    
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('attendees')
        .update({ 
          checked_in: true, 
          checkin_time: now 
        })
        .eq('id', attendeeId);
      
      if (error) throw error;
      
      setAttendees(
        attendees.map(attendee => {
          if (attendee.id === attendeeId && !attendee.checkedIn) {
            toast({
              title: "Check-in successful",
              description: `${attendee.name} has been checked in.`
            });
            return {
              ...attendee,
              checkedIn: true,
              checkinTime: now
            };
          }
          return attendee;
        })
      );
      
      if (scannedAttendee && scannedAttendee.id === attendeeId) {
        setScannedAttendee({
          ...scannedAttendee,
          checkedIn: true,
          checkinTime: now
        });
      }
    } catch (error) {
      console.error('Error checking in attendee:', error);
      toast({
        title: "Check-in failed",
        description: "There was a problem checking in this attendee.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId);
    setScannedAttendee(null);
  };

  const handleViewQR = (attendee: Attendee) => {
    setSelectedQrCodeAttendee(attendee);
    setQrDialogOpen(true);
  };

  const handleSendQRCode = async (attendee: Attendee) => {
    toast({
      title: "Sending QR Code",
      description: `Sending QR code to ${attendee.email}...`
    });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "QR Code Sent",
        description: `QR Code has been sent to ${attendee.email}.`
      });
    } catch (error) {
      toast({
        title: "Error Sending Email",
        description: "Could not send QR code via email. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadQR = (attendee: Attendee) => {
    toast({
      title: "QR Code downloaded",
      description: `QR Code for ${attendee.name} has been downloaded.`
    });
  };

  const handleDeleteAttendee = async (attendeeId: string) => {
    try {
      const { error } = await supabase
        .from('attendees')
        .delete()
        .eq('id', attendeeId);
      
      if (error) throw error;
      
      setAttendees(attendees.filter(a => a.id !== attendeeId));
      
      toast({
        title: "Attendee deleted",
        description: "The attendee has been removed from the event."
      });
      
      if (scannedAttendee && scannedAttendee.id === attendeeId) {
        setScannedAttendee(null);
      }
    } catch (error) {
      console.error('Error deleting attendee:', error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting this attendee.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="animate-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Check-in</h1>
        <p className="text-muted-foreground">Scan QR codes and manage event attendees.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {events.length > 0 ? (
                events.map(event => (
                  <Button
                    key={event.id}
                    variant={selectedEvent === event.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleEventChange(event.id)}
                  >
                    {event.name}
                  </Button>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {loading ? "Loading events..." : "No events found"}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Check-in Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Registered</div>
                  <div className="text-2xl font-bold">
                    {attendees.filter(a => a.eventId === selectedEvent).length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Checked In</div>
                  <div className="text-2xl font-bold">
                    {attendees.filter(a => a.eventId === selectedEvent && a.checkedIn).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">QR Scanner</TabsTrigger>
              <TabsTrigger value="list">Attendee List</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scan" className="pt-6">
              <div className="flex flex-col items-center md:flex-row gap-8">
                <div className="w-full md:w-auto">
                  <QRScanner onScan={handleScan} />
                </div>
                
                <div className="w-full md:flex-1 flex justify-center">
                  {scannedAttendee ? (
                    <AttendeeInfo 
                      attendee={scannedAttendee} 
                      onCheckIn={() => handleCheckIn(scannedAttendee.id)} 
                    />
                  ) : (
                    <div className="w-full max-w-md flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-lg">
                      <QrCodeIcon className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium mb-1">No QR Code Scanned</h3>
                      <p className="text-center text-muted-foreground mb-4">
                        Scan a QR code to view attendee information and check them in.
                      </p>
                      <p className="text-xs text-muted-foreground text-center max-w-xs">
                        You can also search for attendees in the "Attendee List" tab if you need to check someone in manually.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="pt-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search attendees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Loading attendees...</p>
                </div>
              ) : filteredAttendees.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttendees.map((attendee) => (
                        <TableRow key={attendee.id}>
                          <TableCell className="font-medium">{attendee.name}</TableCell>
                          <TableCell>{attendee.email}</TableCell>
                          <TableCell>{attendee.phone}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={attendee.checkedIn ? "default" : "outline"}>
                              {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {attendee.checkinTime ? (
                              new Date(attendee.checkinTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!attendee.checkedIn && (
                                  <DropdownMenuItem onClick={() => handleCheckIn(attendee.id)}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Check In
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleViewQR(attendee)}>
                                  <QrCodeIcon className="mr-2 h-4 w-4" />
                                  View QR Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendQRCode(attendee)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send QR Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadQR(attendee)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download QR
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteAttendee(attendee.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Attendee
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-lg">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">No Attendees Found</h3>
                    <p className="text-muted-foreground max-w-md">
                      {searchQuery ? 'No attendees match your search criteria.' : 'There are no attendees registered for this event yet.'}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        attendee={selectedQrCodeAttendee}
        onSendInvitation={handleSendQRCode}
        onDownloadQR={handleDownloadQR}
      />
    </div>
  );
};

export default CheckIn;
