
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, TicketCheck, RefreshCcw } from 'lucide-react';
import VoucherScanner from '@/components/vouchers/VoucherScanner';
import { toast } from '@/hooks/use-toast';
import { getVoucherStats, resetVouchers } from '@/services/voucherService';
import { Progress } from '@/components/ui/progress';

const VoucherCheckIn: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [redeemedCount, setRedeemedCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    redeemed: 0,
    remaining: 0,
    redemptionRate: 0
  });
  const [isResetting, setIsResetting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Aggiorna l'ora corrente ogni secondo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Ottieni le statistiche sui voucher
  useEffect(() => {
    updateStats();
  }, [redeemedCount]);

  const updateStats = () => {
    const eventStats = getVoucherStats('1'); // "1" è l'ID dell'evento di esempio
    setStats(eventStats);
  };

  const handleVoucherRedeemed = () => {
    setRedeemedCount(prev => prev + 1);
    updateStats();
  };

  const handleReset = () => {
    setIsResetting(true);
    
    // Simuliamo un ritardo nella reimpostazione
    setTimeout(() => {
      const success = resetVouchers();
      
      if (success) {
        setRedeemedCount(0);
        updateStats();
        toast({
          title: "Reset completato",
          description: "Tutti i voucher sono stati reimpostati allo stato originale."
        });
      } else {
        toast({
          title: "Errore durante il reset",
          description: "Non è stato possibile reimpostare i voucher.",
          variant: "destructive"
        });
      }
      
      setIsResetting(false);
    }, 1000);
  };

  return (
    <div className="animate-in fade-in-50 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Voucher Check-In</h1>
        <p className="text-muted-foreground">Scansiona e convalida i voucher al tuo evento.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiche Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Voucher Convalidati</div>
                    <div className="text-sm font-medium">{stats.redeemed}/{stats.total}</div>
                  </div>
                  <Progress value={stats.redemptionRate} className="h-2" />
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Tasso di Convalida</div>
                  <div className="text-2xl font-bold">
                    {stats.redemptionRate.toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Orario Corrente</div>
                  <div className="text-lg font-medium">
                    {currentTime.toLocaleTimeString()}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleReset}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Reset in corso...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reset Demo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Istruzioni</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                1. Seleziona la scheda scanner per scansionare i codici QR dei voucher.
              </p>
              <p>
                2. Quando viene scansionato un codice QR valido, vedrai i dettagli del voucher.
              </p>
              <p>
                3. Clicca su "Riscatta Voucher" per segnarlo come utilizzato. Ogni voucher può essere usato una sola volta.
              </p>
              <p className="text-xs text-muted-foreground border-t pt-4">
                Per scopi dimostrativi, puoi usare il pulsante "Reset Demo" per reimpostare tutti i voucher al loro stato originale.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">Scanner Voucher</TabsTrigger>
              <TabsTrigger value="manual">Check-In Manuale</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scan" className="pt-6">
              <VoucherScanner eventId="1" onVoucherRedeemed={handleVoucherRedeemed} />
            </TabsContent>
            
            <TabsContent value="manual" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Convalida Manuale Voucher</CardTitle>
                  <CardDescription>
                    Se non riesci a scansionare un codice QR, puoi inserire manualmente il codice del voucher qui.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label htmlFor="voucher-code">Codice Voucher</label>
                      <div className="relative">
                        <Ticket className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input 
                          id="voucher-code" 
                          className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Inserisci il codice del voucher" 
                        />
                      </div>
                    </div>
                    
                    <Button className="w-full" onClick={() => {
                      toast({
                        title: "Funzionalità in arrivo",
                        description: "Il check-in manuale sarà disponibile in un aggiornamento futuro."
                      });
                    }}>
                      <TicketCheck className="mr-2 h-4 w-4" />
                      Verifica Voucher
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
