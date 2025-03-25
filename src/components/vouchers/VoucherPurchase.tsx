
import React, { useState } from 'react';
import { CircleDollarSign, ShoppingCart, Coffee, Pizza, PlusCircle, MinusCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { QRCodeDisplay } from '@/components/vouchers/QRCodeDisplay';
import { EventVoucher } from '@/types/event';

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

interface VoucherPurchaseProps {
  voucher?: EventVoucher;  // From the EventLanding page
  eventId?: string;        // Original prop, now optional
  packages?: VoucherPackage[]; // Original prop, now optional
  attendeeId?: string;     // Original prop
  onPurchaseComplete?: () => void; // New prop from EventLanding
}

const VoucherPurchase: React.FC<VoucherPurchaseProps> = ({ 
  eventId, 
  packages = [], 
  attendeeId,
  voucher,
  onPurchaseComplete
}) => {
  const [selectedPackage, setSelectedPackage] = useState<VoucherPackage | null>(null);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  
  // Handle single voucher purchase from EventLanding page
  const handleSingleVoucherPurchase = () => {
    if (!voucher || !attendeeId) return;
    
    // Simulate purchase process
    toast({
      title: "Processing payment...",
      description: "Please wait while we process your payment."
    });
    
    // Simulate payment processing delay
    setTimeout(() => {
      const newVoucherCode = `VOUCHER-${voucher.eventId}-${attendeeId}-${Date.now()}`;
      setVoucherCode(newVoucherCode);
      setPurchaseComplete(true);
      
      toast({
        title: "Purchase successful!",
        description: "Your voucher has been generated successfully."
      });
      
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
      
      // In a real app, you would save this to the database
      console.log('Sending email to', attendeeId, 'with QR code:', newVoucherCode);
    }, 1500);
  };
  
  const handleSelectPackage = (pkg: VoucherPackage) => {
    setSelectedPackage(pkg);
    setPurchaseComplete(false);
  };
  
  const handlePurchase = () => {
    if (voucher) {
      handleSingleVoucherPurchase();
      return;
    }
    
    if (!selectedPackage || !attendeeId) return;
    
    // Simulate purchase process
    toast({
      title: "Processing payment...",
      description: "Please wait while we process your payment."
    });
    
    // Simulate payment processing delay
    setTimeout(() => {
      const newVoucherCode = `VOUCHER-${eventId}-${attendeeId}-${Date.now()}`;
      setVoucherCode(newVoucherCode);
      setPurchaseComplete(true);
      
      toast({
        title: "Purchase successful!",
        description: "Your voucher has been generated successfully."
      });
      
      // In a real app, you would save this to the database
      console.log('Sending email to', attendeeId, 'with QR code:', newVoucherCode);
    }, 1500);
  };
  
  const getContentIcon = (type: 'drink' | 'food') => {
    if (type === 'drink') return <Coffee className="h-4 w-4" />;
    return <Pizza className="h-4 w-4" />;
  };
  
  // If we're in the complete state, show the completion screen
  if (purchaseComplete) {
    return (
      <div className="py-6 px-4 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-green-600 dark:text-green-300" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Purchase Complete!</h2>
        <p className="text-center text-muted-foreground mb-6">
          Your voucher has been generated and sent to your email.
        </p>
        
        <div className="mb-4">
          <QRCodeDisplay value={voucherCode} />
        </div>
        
        <div className="text-center space-y-2 mb-6">
          {voucher ? (
            <>
              <h3 className="font-semibold">{voucher.name}</h3>
              <p className="text-sm text-muted-foreground">{voucher.description}</p>
            </>
          ) : (
            <>
              <h3 className="font-semibold">{selectedPackage?.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPackage?.description}</p>
            </>
          )}
        </div>
        
        <Button variant="outline" onClick={() => setPurchaseComplete(false)}>
          Purchase Another Voucher
        </Button>
      </div>
    );
  }
  
  // If we have a single voucher, show a simplified purchase view
  if (voucher) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
            <CardDescription>
              You're purchasing the following voucher
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="font-medium mb-2">{voucher.name}</div>
              <div className="text-sm text-muted-foreground mb-3">{voucher.description}</div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Total:</span>
                <span className="font-bold">€{voucher.price.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={handlePurchase} disabled={!attendeeId}>
              <CircleDollarSign className="mr-2 h-4 w-4" />
              Complete Purchase
            </Button>
            <Button variant="ghost" className="w-full" onClick={onPurchaseComplete}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Original view for package selection
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Event Vouchers</h2>
      
      {!selectedPackage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pkg.contents.map((item, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                        {getContentIcon(item.type)}
                      </div>
                      <span>
                        {item.quantity}x {item.type === 'drink' ? 'Drink' : 'Food'} Voucher
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-2 pb-4">
                <div className="font-semibold">€{pkg.price.toFixed(2)}</div>
                <Button onClick={() => handleSelectPackage(pkg)}>
                  Select
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Purchase</CardTitle>
              <CardDescription>
                You're purchasing the following voucher package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="font-medium mb-2">{selectedPackage.name}</div>
                <div className="text-sm text-muted-foreground mb-3">{selectedPackage.description}</div>
                
                <div className="space-y-2 mb-4">
                  {selectedPackage.contents.map((item, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                        {getContentIcon(item.type)}
                      </div>
                      <span>
                        {item.quantity}x {item.type === 'drink' ? 'Drink' : 'Food'} Voucher
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">€{selectedPackage.price.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={handlePurchase} disabled={!attendeeId}>
                <CircleDollarSign className="mr-2 h-4 w-4" />
                Complete Purchase
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setSelectedPackage(null)}>
                Back to Packages
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VoucherPurchase;
