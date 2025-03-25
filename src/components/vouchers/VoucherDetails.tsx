
import React from 'react';
import { RefreshCcw, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface VoucherWithAttendee {
  id: string;
  packageName: string;
  isRedeemed: boolean;
  redemptionTime: string | null;
  attendeeName: string;
  attendeeEmail: string;
}

interface VoucherDetailsProps {
  voucher: VoucherWithAttendee | null;
  isRedeeming: boolean;
  onRedeem: () => void;
}

const VoucherDetails: React.FC<VoucherDetailsProps> = ({ 
  voucher, 
  isRedeeming, 
  onRedeem 
}) => {
  if (!voucher) return null;

  return (
    <Card className="animate-in w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dettagli Voucher</CardTitle>
          <Badge variant={voucher.isRedeemed ? "default" : "outline"} 
                 className="transition-all duration-300">
            {voucher.isRedeemed ? 'Riscattato' : 'Non Riscattato'}
          </Badge>
        </div>
        <CardDescription>{voucher.packageName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm font-medium mb-1">Partecipante</div>
            <div className="font-medium">{voucher.attendeeName}</div>
            <div className="text-sm text-muted-foreground">{voucher.attendeeEmail}</div>
          </div>
          
          {voucher.isRedeemed && voucher.redemptionTime && (
            <div className="p-3 bg-muted rounded-md animate-in slide-in-from-bottom-5 duration-500">
              <div className="text-sm font-medium mb-1">Orario di Riscatto</div>
              <div className="font-medium">
                {new Date(voucher.redemptionTime).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onRedeem} 
          className="w-full transition-all duration-300" 
          variant={voucher.isRedeemed ? "secondary" : "default"}
          disabled={voucher.isRedeemed || isRedeeming}
        >
          {isRedeeming ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Riscatto in corso...
            </>
          ) : voucher.isRedeemed ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Già Riscattato
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Riscatta Voucher
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente skeleton per mostrare durante il caricamento
export const VoucherDetailsSkeleton: React.FC = () => (
  <Card className="w-full max-w-md animate-pulse">
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-4 w-48 mt-1" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="p-3 bg-muted/40 rounded-md">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);

export default VoucherDetails;
