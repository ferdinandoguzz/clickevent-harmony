
import React from 'react';
import { Coffee, Pizza } from 'lucide-react';

const EmptyVoucherState: React.FC = () => {
  return (
    <div className="w-full max-w-md flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-lg animate-in fade-in-50 duration-500">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {Math.random() > 0.5 ? (
          <Coffee className="h-6 w-6 text-primary" />
        ) : (
          <Pizza className="h-6 w-6 text-primary" />
        )}
      </div>
      <h3 className="text-lg font-medium mb-1">Nessun Voucher Scansionato</h3>
      <p className="text-center text-muted-foreground mb-4">
        Scansiona un codice QR del voucher per validarlo e riscattarlo.
      </p>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Ogni voucher può essere riscattato una sola volta. Dopo il riscatto, il codice QR sarà invalidato.
      </p>
    </div>
  );
};

export default EmptyVoucherState;
