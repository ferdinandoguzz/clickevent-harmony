
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, TicketCheck } from 'lucide-react';
import VoucherScanner from '@/components/vouchers/VoucherScanner';
import { toast } from '@/hooks/use-toast';

const VoucherCheckIn: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [redeemedCount, setRedeemedCount] = useState(0);

  const handleVoucherRedeemed = () => {
    setRedeemedCount(prev => prev + 1);
  };

  return (
    <div className="animate-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Voucher Check-In</h1>
        <p className="text-muted-foreground">Scan and redeem vouchers at your event.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scanner Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Vouchers Redeemed</div>
                  <div className="text-2xl font-bold">
                    {redeemedCount}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Time</div>
                  <div className="text-lg font-medium">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                1. Select the scanner tab to scan voucher QR codes.
              </p>
              <p>
                2. When a valid QR code is scanned, you'll see the voucher details.
              </p>
              <p>
                3. Click "Redeem Voucher" to mark it as used. Each voucher can only be used once.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">Voucher Scanner</TabsTrigger>
              <TabsTrigger value="manual">Manual Check-In</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scan" className="pt-6">
              <VoucherScanner eventId="1" onVoucherRedeemed={handleVoucherRedeemed} />
            </TabsContent>
            
            <TabsContent value="manual" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manual Voucher Redemption</CardTitle>
                  <CardDescription>
                    If you cannot scan a QR code, you can manually enter the voucher code here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label htmlFor="voucher-code">Voucher Code</label>
                      <input 
                        id="voucher-code" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter voucher code" 
                      />
                    </div>
                    
                    <Button className="w-full" onClick={() => {
                      toast({
                        title: "Feature coming soon",
                        description: "Manual check-in will be available in a future update."
                      });
                    }}>
                      <TicketCheck className="mr-2 h-4 w-4" />
                      Check Voucher
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VoucherCheckIn;
