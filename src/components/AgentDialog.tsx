import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Agent, AgentInsert, AgentUpdate, useCreateAgent, useUpdateAgent } from '@/hooks/useAgents';

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: Agent | null;
}

export function AgentDialog({ open, onOpenChange, agent }: AgentDialogProps) {
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const isEditing = !!agent;

  const [formData, setFormData] = useState<Partial<AgentInsert>>({
    name: '',
    type: 'inventory',
    status: 'idle',
    description: '',
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        type: agent.type,
        status: agent.status,
        description: agent.description || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'inventory',
        status: 'idle',
        description: '',
      });
    }
  }, [agent, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && agent) {
      await updateAgent.mutateAsync({
        id: agent.id,
        updates: formData as AgentUpdate,
      });
    } else {
      await createAgent.mutateAsync(formData as AgentInsert);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">
            {isEditing ? 'Edit Agent' : 'Add Agent'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-input border-border"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="customer_service">Customer Service</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-input border-border"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary text-primary-foreground"
              disabled={createAgent.isPending || updateAgent.isPending}
            >
              {isEditing ? 'Save Changes' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
