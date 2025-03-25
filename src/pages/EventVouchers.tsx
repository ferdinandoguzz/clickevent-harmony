import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Download, QrCode, Ticket, ShoppingBag, CircleDollarSign, Check, X, Edit, Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { mockEvents, mockAttendees, mockVouchers } from '@/data/mockData';

interface VoucherPackageContent {
  type: 'drink' | 'food';
  quantity: number;
}

interface VoucherPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  contents: VoucherPackageContent[];
}

interface Voucher {
  id: string;
  eventId: string;
  attendeeId: string;
  packageId: string;
  packageName: string;
  purchaseDate: string;
  price: number;
  isRedeemed: boolean;
  redemptionTime: string | null;
  qrCode: string;
}

interface Event {
  id: string;
  name: string;
  voucherPackages: VoucherPackage[];
  // ... other event properties
}

const EventVouchers: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [activeTab, setActiveTab] = useState('packages');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPackage, setEditingPackage] = useState<VoucherPackage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPackage, setNewPackage] = useState<Partial<VoucherPackage>>({
    name: '',
    description: '',
    price: 0,
    contents: [{ type: 'drink', quantity: 1 }]
  });

  useEffect(() => {
    // Load event data
    const foundEvent = mockEvents.find(e => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent as Event);
    } else {
      navigate('/events');
      toast({
        title: "Event not found",
        description: "The requested event could not be found.",
        variant: "destructive"
      });
    }

    // Load voucher data
    const eventVouchers = mockVouchers.filter(v => v.eventId === eventId);
    setVouchers(eventVouchers);
  }, [eventId, navigate]);

  const filteredVouchers = vouchers.filter(voucher => {
    const attendee = mockAttendees.find(a => a.id === voucher.attendeeId);
    if (!attendee) return false;

    const searchTerm = searchQuery.toLowerCase();
    return (
      attendee.name.toLowerCase().includes(searchTerm) ||
      attendee.email.toLowerCase().includes(searchTerm) ||
      voucher.packageName.toLowerCase().includes(searchTerm)
    );
  });

  const handleToggleRedemption = (voucherId: string) => {
    setVouchers(vouchers.map(voucher => {
      if (voucher.id === voucherId) {
        const updated = {
          ...voucher,
          isRedeemed: !voucher.isRedeemed,
          redemptionTime: !voucher.isRedeemed ? new Date().toISOString() : null
        };
        
        toast({
          title: updated.isRedeemed ? "Voucher redeemed" : "Redemption canceled",
          description: `The voucher has been ${updated.isRedeemed ? 'marked as redeemed' : 'unmarked'}.`
        });
        
        return updated;
      }
      return voucher;
    }));
  };

  const handleNewPackage = () => {
    setEditingPackage(null);
    setNewPackage({
      name: '',
      description: '',
      price: 0,
      contents: [{ type: 'drink', quantity: 1 }]
    });
    setIsDialogOpen(true);
  };

  const handleEditPackage = (pkg: VoucherPackage) => {
    setEditingPackage(pkg);
    setNewPackage({ ...pkg });
    setIsDialogOpen(true);
  };

  const handleSavePackage = () => {
    if (!event) return;
    
    if (!newPackage.name || !newPackage.price) {
      toast({
        title: "Missing information",
        description: "Please provide a name and price for the voucher package.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would save to the backend
    if (editingPackage) {
      // Update existing package
      const updatedPackages = event.voucherPackages.map(pkg => 
        pkg.id === editingPackage.id ? { ...newPackage, id: pkg.id } as VoucherPackage : pkg
      );
      
      setEvent({
        ...event,
        voucherPackages: updatedPackages
      });
      
      toast({
        title: "Package updated",
        description: `"${newPackage.name}" has been updated successfully.`
      });
    } else {
      // Add new package
      const newId = `vp${Date.now()}`;
      const updatedPackages = [
        ...event.voucherPackages,
        { ...newPackage, id: newId } as VoucherPackage
      ];
      
      setEvent({
        ...event,
        voucherPackages: updatedPackages
      });
      
      toast({
        title: "Package created",
        description: `"${newPackage.name}" has been added to the event.`
      });
    }
    
    setIsDialogOpen(false);
  };

  const handleDeletePackage = (packageId: string) => {
    if (!event) return;
    
    // Check if any vouchers use this package
    const hasVouchers = vouchers.some(v => v.packageId === packageId);
    
    if (hasVouchers) {
      toast({
        title: "Cannot delete package",
        description: "This package has vouchers associated with it and cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out the package to delete
    const updatedPackages = event.voucherPackages.filter(pkg => pkg.id !== packageId);
    
    setEvent({
      ...event,
      voucherPackages: updatedPackages
    });
    
    toast({
      title: "Package deleted",
      description: "The voucher package has been deleted successfully."
    });
  };

  const handleAddContent = () => {
    setNewPackage({
      ...newPackage,
      contents: [...(newPackage.contents || []), { type: 'drink', quantity: 1 }]
    });
  };

  const handleUpdateContent = (index: number, field: 'type' | 'quantity', value: any) => {
    if (!newPackage.contents) return;
    
    const updatedContents = [...newPackage.contents];
    updatedContents[index] = {
      ...updatedContents[index],
      [field]: field === 'quantity' ? Number(value) : value
    };
    
    setNewPackage({
      ...newPackage,
      contents: updatedContents
    });
  };

  const handleRemoveContent = (index: number) => {
    if (!newPackage.contents) return;
    
    const updatedContents = newPackage.contents.filter((_, i) => i !== index);
    
    setNewPackage({
      ...newPackage,
      contents: updatedContents
    });
  };

  if (!event) {
    return <div className="p-8 text-center">Loading event details...</div>;
  }

  return (
    <div className="animate-in">
      <header className="mb-8">
        <Link 
          to={`/events/${eventId}`} 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Event
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight mb-2">Voucher Management</h1>
        <p className="text-muted-foreground">
          {event.name}
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">Voucher Packages</TabsTrigger>
          <TabsTrigger value="purchases">Purchased Vouchers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="packages" className="pt-6">
          <div className="flex justify-end mb-6">
            <Button onClick={handleNewPackage}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </div>
          
          {event.voucherPackages && event.voucherPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.voucherPackages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle>{pkg.name}</CardTitle>
                      <Badge variant="secondary" className="ml-2">
                        €{pkg.price.toFixed(2)}
                      </Badge>
                    </div>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Contents:</h4>
                      <ul className="text-sm space-y-1">
                        {pkg.contents.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium mr-2">
                              {item.quantity}x
                            </span>
                            <span className="capitalize">{item.type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPackage(pkg)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeletePackage(pkg.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Voucher Packages</CardTitle>
                <CardDescription>
                  You haven't created any voucher packages for this event yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Create your first package</AlertTitle>
                  <AlertDescription>
                    Voucher packages allow attendees to purchase drink and food vouchers in advance.
                    Click the "Create Package" button to get started.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button onClick={handleNewPackage} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create First Package
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="purchases" className="pt-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vouchers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>
          
          {filteredVouchers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers.map((voucher) => {
                    const attendee = mockAttendees.find(a => a.id === voucher.attendeeId);
                    const purchaseDate = new Date(voucher.purchaseDate);
                    
                    return (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-medium">
                          {attendee?.name}
                          <div className="text-xs text-muted-foreground">{attendee?.email}</div>
                        </TableCell>
                        <TableCell>{voucher.packageName}</TableCell>
                        <TableCell>{purchaseDate.toLocaleDateString()}</TableCell>
                        <TableCell>€{voucher.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={voucher.isRedeemed ? "default" : "outline"}>
                            {voucher.isRedeemed ? 'Redeemed' : 'Not Redeemed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {/* View QR code */}}
                            >
                              <QrCode className="h-4 w-4" />
                              <span className="sr-only">View QR Code</span>
                            </Button>
                            <Button
                              variant={voucher.isRedeemed ? "destructive" : "default"}
                              size="icon"
                              onClick={() => handleToggleRedemption(voucher.id)}
                            >
                              {voucher.isRedeemed ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {voucher.isRedeemed ? 'Cancel Redemption' : 'Mark as Redeemed'}
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
            <Card>
              <CardHeader>
                <CardTitle>No Vouchers Found</CardTitle>
                <CardDescription>
                  {searchQuery 
                    ? 'No vouchers match your search criteria.' 
                    : 'No one has purchased vouchers for this event yet.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>How vouchers work</AlertTitle>
                  <AlertDescription>
                    When attendees purchase voucher packages, they'll receive QR codes for each voucher.
                    Staff can scan these codes at the event to redeem them.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Package Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPackage ? 'Edit Voucher Package' : 'Create Voucher Package'}</DialogTitle>
            <DialogDescription>
              {editingPackage 
                ? 'Update the details of this voucher package.' 
                : 'Create a new voucher package for this event.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Package Name</Label>
              <Input 
                id="name" 
                value={newPackage.name || ''}
                onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                placeholder="e.g., 2x Drink Vouchers"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newPackage.description || ''}
                onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                placeholder="Describe what's included in this package"
                rows={2}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="price">Price (€)</Label>
              <Input 
                id="price" 
                type="number"
                min="0"
                step="0.01"
                value={newPackage.price || ''}
                onChange={(e) => setNewPackage({...newPackage, price: parseFloat(e.target.value)})}
                placeholder="0.00"
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Contents</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddContent}>
                  <PlusCircle className="mr-2 h-3 w-3" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {newPackage.contents?.map((content, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={content.type}
                      onChange={(e) => handleUpdateContent(index, 'type', e.target.value)}
                    >
                      <option value="drink">Drink</option>
                      <option value="food">Food</option>
                    </select>
                    
                    <Input
                      type="number"
                      min="1"
                      className="w-20"
                      value={content.quantity}
                      onChange={(e) => handleUpdateContent(index, 'quantity', e.target.value)}
                    />
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveContent(index)}
                      disabled={newPackage.contents?.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePackage}>
              {editingPackage ? 'Update Package' : 'Create Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventVouchers;
