import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PricingRule, PricingRuleInsert, PricingRuleUpdate, useCreatePricingRule, useUpdatePricingRule } from '@/hooks/usePricingRules';
import { Json } from '@/integrations/supabase/types';

interface PricingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: PricingRule | null;
}

export function PricingRuleDialog({ open, onOpenChange, rule }: PricingRuleDialogProps) {
  const createRule = useCreatePricingRule();
  const updateRule = useUpdatePricingRule();
  const isEditing = !!rule;

  const [formData, setFormData] = useState<Partial<PricingRuleInsert>>({
    name: '',
    rule_type: 'demand',
    conditions: {},
    adjustment_type: 'percentage',
    adjustment_value: 0,
    is_active: true,
    priority: 0,
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        rule_type: rule.rule_type,
        conditions: rule.conditions as Json,
        adjustment_type: rule.adjustment_type,
        adjustment_value: rule.adjustment_value,
        is_active: rule.is_active,
        priority: rule.priority,
      });
    } else {
      setFormData({
        name: '',
        rule_type: 'demand',
        conditions: {},
        adjustment_type: 'percentage',
        adjustment_value: 0,
        is_active: true,
        priority: 0,
      });
    }
  }, [rule, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && rule) {
      await updateRule.mutateAsync({
        id: rule.id,
        updates: formData as PricingRuleUpdate,
      });
    } else {
      await createRule.mutateAsync(formData as PricingRuleInsert);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-accent">
            {isEditing ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
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
              <Label htmlFor="rule_type">Rule Type</Label>
              <Select
                value={formData.rule_type}
                onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demand">Demand</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="time">Time-based</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustment_type">Adjustment Type</Label>
              <Select
                value={formData.adjustment_type}
                onValueChange={(value) => setFormData({ ...formData, adjustment_type: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adjustment_value">
                Adjustment Value {formData.adjustment_type === 'percentage' ? '(%)' : '($)'}
              </Label>
              <Input
                id="adjustment_value"
                type="number"
                step="0.01"
                value={formData.adjustment_value}
                onChange={(e) => setFormData({ ...formData, adjustment_value: parseFloat(e.target.value) })}
                className="bg-input border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="bg-input border-border"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-accent text-accent-foreground"
              disabled={createRule.isPending || updateRule.isPending}
            >
              {isEditing ? 'Save Changes' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
