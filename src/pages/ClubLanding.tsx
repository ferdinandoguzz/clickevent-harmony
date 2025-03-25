
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, Mail, User, Phone, QrCode, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Import mock data from Clubs.tsx
import { mockClubs } from '@/data/mockData';

// Registration form schema
const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits')
});

type FormValues = z.infer<typeof formSchema>;

const ClubLanding: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = useState<any>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    // Find club by ID
    const foundClub = mockClubs.find(c => c.id === clubId);
    if (foundClub) {
      setClub(foundClub);
    }
  }, [clubId]);

  const onSubmit = (data: FormValues) => {
    // Generate a unique QR code for this registration
    const uniqueQr = `CLUB-${clubId}-MEMBER-${Date.now()}`;
    setQrCode(uniqueQr);
    
    // Simulate sending an email
    console.log('Sending email to', data.email, 'with QR code:', uniqueQr);
    
    // Show success toast
    toast({
      title: "Registration successful",
      description: "Check your email for the QR code."
    });
    
    // Open the success dialog
    setSuccessDialogOpen(true);
  };

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Club not found</h2>
            <p className="text-muted-foreground mb-4">The club you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
        
        <header className="mb-8 text-center">
          <div className="bg-primary text-primary-foreground inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
            <Building className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{club.name}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {club.description}
          </p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Join {club.name}</CardTitle>
            <CardDescription>
              Fill out this form to become a member and receive your membership QR code via email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="John" {...field} />
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Doe" {...field} />
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="john.doe@example.com" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        We'll send your membership QR code to this email.
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="+1 (555) 123-4567" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full mt-6">
                  Register for Membership
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>By registering, you agree to receive communications from {club.name}.</p>
        </div>
      </div>
      
      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registration Successful!</DialogTitle>
            <DialogDescription>
              Thank you for joining {club.name}. A QR code has been sent to your email address.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed border-muted-foreground p-4">
                <QrCode className="w-32 h-32 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              <p>Check your email for the QR code</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setSuccessDialogOpen(false)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubLanding;
