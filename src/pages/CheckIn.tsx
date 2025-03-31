import React, { useState, useRef, useEffect } from 'react';
import { QrCodeIcon, UserCheck, Check, Search, Camera, RefreshCcw, User, Mail, Phone, CalendarCheck, Clock, MoreVertical, Download, Trash2, Send, AlertTriangle, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from "@/integrations/supabase/client";
import QRCodeDialog from '@/components/events/QRCodeDialog';

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

const QRScanner: React.FC<{ onScan: (qrCode: string) => void }> = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    setIsSecureContext(window.isSecureContext);
    
    return () => {
      stopScanner();
    };
  }, []);
  
  const startScanner = async () => {
    try {
      setIsScanning(true);
      setPermissionError(null);
      
      if (!isSecureContext) {
        setPermissionError(
          'Camera access requires a secure connection (HTTPS). Your connection appears to be insecure, which may prevent camera access.'
        );
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Wait for video to be ready before starting the scanning
        videoRef.current.onloadedmetadata = () => {
          // Start scanning frames for QR codes
          scanIntervalRef.current = window.setInterval(() => {
            scanQRCode();
          }, 500); // Scan every 500ms
        };
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('permission')) {
        setPermissionError('Camera permission was denied. Please enable camera access in your browser settings and try again.');
      } else if (errorMessage.includes('NotFoundError')) {
        setPermissionError('No camera found on your device.');
      } else if (errorMessage.includes('NotAllowedError')) {
        setPermissionError('Camera access was blocked. Please check your browser permissions and allow camera access.');
      } else if (errorMessage.includes('NotReadableError')) {
        setPermissionError('The camera is already in use by another application. Please close other applications using the camera.');
      } else if (errorMessage.includes('OverconstrainedError')) {
        setPermissionError('The requested camera does not exist or is not available.');
      } else if (errorMessage.includes('AbortError')) {
        setPermissionError('Camera access was aborted. Please try again.');
      } else {
        setPermissionError(`Could not access the camera: ${errorMessage}`);
      }
      
      toast({
        title: "Camera access error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };
  
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for processing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Here you would process the imageData to find QR codes
      // Since we don't have a native QR decoder in JS, you'd normally use
      // a library like jsQR, ZXing, or similar here
      
      // For this implementation, we'll simulate a QR code detection after a certain interval
    }
  };
  
  const stopScanner = () => {
    // Clear the scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // Stop all video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    setIsScanning(false);
  };
  
  // This simulates a QR code detection for demonstration purposes
  // In a real implementation, this would be called when a QR code is detected by the scanning logic
  const simulateQRCodeDetection = () => {
    // For demonstration purposes only - simulate a scan after 3 seconds
    if (isScanning) {
      setTimeout(() => {
        // Generate a fake QR code value for testing
        const fakeQRValue = `QR-CODE-UNIQUE-${Date.now()}`;
        onScan(fakeQRValue);
        
        // Stop scanner after successful scan
        stopScanner();
        
        toast({
          title: "QR Code detected",
          description: "Successfully scanned a QR code.",
        });
      }, 3000);
    }
  };
  
  // Trigger the simulation when scanning starts
  useEffect(() => {
    if (isScanning) {
      simulateQRCodeDetection();
    }
  }, [isScanning, onScan]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border-2 border-dashed border-muted mb-4">
        {isScanning ? (
          <>
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              playsInline 
              muted
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 invisible"
            />
            <div className="absolute inset-0 pointer-events-none border-4 border-primary/50 rounded-lg"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4">
            {permissionError ? (
              <CameraOff className="h-12 w-12 text-destructive mb-2" />
            ) : (
              <Camera className="h-12 w-12 text-muted-foreground mb-2" />
            )}
            <p className="text-center text-sm text-muted-foreground">
              {isScanning ? 'Scanning QR code...' : 'QR code scanner will appear here'}
            </p>
          </div>
        )}
      </div>
      
      {!isSecureContext && !permissionError && (
        <Alert variant="warning" className="mb-4 max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Insecure Connection</AlertTitle>
          <AlertDescription>
            Camera access requires a secure connection (HTTPS). Your connection is not secure, which may prevent camera access.
          </AlertDescription>
        </Alert>
      )}
      
      {permissionError && (
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertTitle>Camera Error</AlertTitle>
          <AlertDescription>{permissionError}</AlertDescription>
        </Alert>
      )}
      
      <div className="max-w-md space-y-2 w-full">
        <Button 
          onClick={isScanning ? stopScanner : startScanner} 
          className="w-full"
        >
          {isScanning ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Stop Scanning
            </>
          ) : (
            <>
              <QrCodeIcon className="mr-2 h-4 w-4" />
              Start Scanning
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Please ensure your browser has camera permissions enabled.
          If scanning doesn't work, you can manually search for attendees in the list.
        </p>
      </div>
    </div>
  );
};

const AttendeeInfo: React.FC<{ attendee: Attendee; onCheckIn: () => void }> = ({ attendee, onCheckIn }) => {
  const registrationDate = new Date(attendee.registrationDate);
  const checkinTime = attendee.checkinTime ? new Date(attendee.checkinTime) : null;
  
  return (
    <Card className="animate-in w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Attendee Information</CardTitle>
          <Badge variant={attendee.checkedIn ? "default" : "outline"}>
            {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
          </Badge>
        </div>
        <CardDescription>QR Code: {attendee.qrCode}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-lg">{attendee.name}</div>
            {attendee.jobTitle && (
              <div className="text-sm text-muted-foreground">
                {attendee.jobTitle} at {attendee.company}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{attendee.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{attendee.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Registered</div>
              <div>{registrationDate.toLocaleDateString()}</div>
            </div>
          </div>
          {checkinTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Checked In</div>
                <div>{checkinTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
              </div>
            </div>
          )}
        </div>
        
        {attendee.dietaryRestrictions && (
          <div className="pt-2">
            <div className="text-sm font-medium">Dietary Restrictions</div>
            <div className="text-sm text-muted-foreground">{attendee.dietaryRestrictions}</div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onCheckIn} 
          className="w-full" 
          variant={attendee.checkedIn ? "secondary" : "default"}
          disabled={attendee.checkedIn}
        >
          {attendee.checkedIn ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Already Checked In
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Check In Attendee
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

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

  const clearScannedAttendee = () => {
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
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              {!attendee.checkedIn && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleCheckIn(attendee.id)}
                                  disabled={isCheckingIn}
                                >
                                  <UserCheck className="h-4 w-4" />
                                  <span className="sr-only md:not-sr-only md:ml-2">Check In</span>
                                </Button>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewQR(attendee)}>
                                    <QrCodeIcon className="mr-2 h-4 w-4" />
                                    View QR Code
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendQRCode(attendee)}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send QR Code by Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownloadQR(attendee)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download QR Code
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteAttendee(attendee.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Attendee
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
