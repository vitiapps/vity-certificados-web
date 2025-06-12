
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EmployeeDataManager from './EmployeeDataManager';

const CreateEmployeeDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmployeeCreated = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-vity-green hover:bg-vity-green-dark flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Empleado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-vity-green">Crear Nuevo Empleado</DialogTitle>
        </DialogHeader>
        <EmployeeDataManager onEmployeeCreated={handleEmployeeCreated} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmployeeDialog;
