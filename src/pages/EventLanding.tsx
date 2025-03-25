
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, Ticket, Info, User, Mail, Phone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import VoucherPurchase from '@/components/vouchers/VoucherPurchase';
import { QRCodeDisplay } from '@/components/vouchers/QRCodeDisplay';
import { Event, EventVoucher } from '@/types/event';
import { mockEvents, mockVouchers } from '@/data/mockData';

// Registration form schema
const registrationFormSchema = z.object({
  firstName: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri" }),
  lastName: z.string().min(2, { message: "Il cognome deve contenere almeno 2 caratteri" }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido" }),
  phone: z.string().min(5, { message: "Inserisci un numero di telefono valido" }),
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

interface Attendee {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  registrationDate: string;
  qrCode: string;
}

const EventLanding: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [vouchers, setVouchers] = useState<EventVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<EventVoucher | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [attendee, setAttendee] = useState<Attendee | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    // Find the event by ID
    const foundEvent = mockEvents.find(e => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
    }

    // Filter vouchers for this event from mockData
    const eventVouchers = mockVouchers.filter(v => v.eventId === eventId);
    setVouchers(eventVouchers);
  }, [eventId]);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Evento non trovato</h2>
            <p className="text-muted-foreground mb-4">L'evento che stai cercando non esiste o è stato rimosso.</p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna alla Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(event?.startDate || '');
  const endDate = new Date(event?.endDate || '');
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };

  const handleVoucherClick = (voucher: EventVoucher) => {
    if (!attendee) {
      toast({
        title: "Registrazione richiesta",
        description: "Devi registrarti all'evento prima di acquistare un voucher",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedVoucher(voucher);
    setPurchaseDialogOpen(true);
  };

  const onSubmit = (values: RegistrationFormValues) => {
    // Generate a unique QR code
    const qrCode = `EVENT-${eventId}-${Date.now()}-${values.email}`;
    
    // Create a new attendee
    const newAttendee: Attendee = {
      id: `attendee-${Date.now()}`,
      eventId: eventId || '',
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      registrationDate: new Date().toISOString(),
      qrCode: qrCode
    };
    
    // In a real application, we would save the data to a database
    console.log('New attendee registered:', newAttendee);
    
    // Set the attendee to show the QR code
    setAttendee(newAttendee);
    
    // Show the registration success
    setRegistrationSuccess(true);
    
    // Send confirmation email (simulated)
    sendConfirmationEmail(newAttendee);
  };

  const sendConfirmationEmail = (attendee: Attendee) => {
    // In a real application, we would send the email via a service like SendGrid, Mailchimp, etc.
    console.log(`Email of confirmation sent to ${attendee.email} with QR code ${attendee.qrCode}`);
    
    // Show toast of confirmation
    toast({
      title: "Email inviata!",
      description: `Una email di conferma è stata inviata a ${attendee.email}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in">
      <Link 
        to="/" 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Torna alla Home
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={event.isPaid ? "default" : "outline"}>
              {event.isPaid ? `${event.price} €` : 'Gratuito'}
            </Badge>
            <Badge variant="secondary">
              {event.status === 'upcoming' ? 'In arrivo' : event.status === 'past' ? 'Passato' : 'Bozza'}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{event.name}</h1>
          <p className="text-muted-foreground">
            Organizzato da {event.clubName}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Dettagli Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{event.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Data</div>
                      <div className="text-muted-foreground">
                        {formatDate(startDate)}
                        {startDate.toDateString() !== endDate.toDateString() && (
                          <> - {formatDate(endDate)}</>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Orario</div>
                      <div className="text-muted-foreground">
                        {formatTime(startDate)} - {formatTime(endDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Luogo</div>
                      <div className="text-muted-foreground">{event.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Prezzo</div>
                      <div className="text-muted-foreground">
                        {event.isPaid ? `${event.price.toFixed(2)} €` : 'Gratuito'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!registrationSuccess ? (
              <Card>
                <CardHeader>
                  <CardTitle>Registrazione</CardTitle>
                  <CardDescription>Inserisci i tuoi dati per registrarti all'evento</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Inserisci il tuo nome" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cognome</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Inserisci il tuo cognome" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="email" placeholder="La tua email" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Riceverai il QR code a questo indirizzo email
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numero di telefono</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Il tuo numero di telefono" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full">
                        Registrati all'evento
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Registrazione completata!</CardTitle>
                  <CardDescription>
                    Grazie per esserti registrato a {event.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-center mb-6">
                    Una email con il tuo QR code è stata inviata a <strong>{attendee?.email}</strong>.<br />
                    Mostra questo QR code all'ingresso dell'evento.
                  </p>
                  
                  {attendee && (
                    <div className="mt-4">
                      <QRCodeDisplay value={attendee.qrCode} size="lg" />
                    </div>
                  )}
                  
                  <Alert className="mt-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      Salva questo QR code sul tuo telefono. Ti servirà per accedere all'evento.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setRegistrationSuccess(false);
                      form.reset();
                      setAttendee(null);
                    }}
                  >
                    Registra un'altra persona
                  </Button>
                  
                  {vouchers.length > 0 && (
                    <Button 
                      variant="default"
                      onClick={() => {
                        const scrollTarget = document.getElementById('vouchers-section');
                        if (scrollTarget) {
                          scrollTarget.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      Acquista Voucher
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}
          </div>
          
          <div>
            <Card id="vouchers-section" className="sticky top-4">
              <CardHeader>
                <CardTitle>Voucher Disponibili</CardTitle>
                <CardDescription>
                  {attendee 
                    ? "Acquista i tuoi voucher per questo evento" 
                    : "Registrati all'evento per poter acquistare i voucher"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {vouchers.length > 0 ? (
                  vouchers.map(voucher => (
                    <div 
                      key={voucher.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        attendee ? 'hover:bg-accent cursor-pointer' : 'border-muted hover:border-muted-foreground'
                      }`}
                      onClick={() => attendee && handleVoucherClick(voucher)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{voucher.name}</h3>
                          <p className="text-sm text-muted-foreground">{voucher.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{voucher.price} €</div>
                          <div className="text-xs text-muted-foreground">
                            {voucher.remaining} disponibili
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Ticket className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
                    <h3 className="font-medium mb-1">Nessun voucher disponibile</h3>
                    <p className="text-sm text-muted-foreground">
                      Non ci sono voucher disponibili per questo evento al momento.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="block">
                <Separator className="my-2" />
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Voucher</AlertTitle>
                  <AlertDescription className="text-sm">
                    {!attendee 
                      ? "Registrati all'evento per poter acquistare i voucher."
                      : "I voucher acquistati ti saranno inviati via email. Potrai mostrarli all'ingresso dell'evento per accedere."
                    }
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acquista Voucher</DialogTitle>
            <DialogDescription>
              {selectedVoucher?.name} - {event?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVoucher && (
            <VoucherPurchase 
              voucher={selectedVoucher}
              attendeeId={attendee?.id}
              onPurchaseComplete={() => setPurchaseDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventLanding;
