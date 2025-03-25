
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

interface FormFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: FormField | null;
  onSave: (field: FormField) => void;
}

export const FormFieldDialog: React.FC<FormFieldDialogProps> = ({
  open,
  onOpenChange,
  field,
  onSave,
}) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('text');
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (field) {
      setLabel(field.label);
      setType(field.type);
      setRequired(field.required);
    } else {
      // Reset form for new field
      setLabel('');
      setType('text');
      setRequired(false);
    }
  }, [field, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedField: FormField = {
      id: field?.id || '',
      label,
      type,
      required,
    };
    
    onSave(updatedField);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{field ? 'Edit Form Field' : 'Add Form Field'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Label
              </Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={type}
                onValueChange={setType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="textarea">Text Area</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="required" className="text-right">
                Required
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="required"
                  checked={required}
                  onCheckedChange={setRequired}
                />
                <Label htmlFor="required" className="text-sm text-muted-foreground">
                  {required ? 'Required field' : 'Optional field'}
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
