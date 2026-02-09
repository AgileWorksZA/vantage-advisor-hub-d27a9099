import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface WidgetConfig {
  id: string;
  label: string;
}

interface WidgetSettingsDialogProps {
  widgets: WidgetConfig[];
  hiddenWidgets: string[];
  onToggleWidget: (widgetId: string, visible: boolean) => void;
}

export const WidgetSettingsDialog = ({
  widgets,
  hiddenWidgets,
  onToggleWidget,
}: WidgetSettingsDialogProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <p className="text-sm font-medium mb-3">Show / Hide Widgets</p>
        <div className="space-y-3">
          {widgets.map((widget) => {
            const isVisible = !hiddenWidgets.includes(widget.id);
            return (
              <div key={widget.id} className="flex items-center justify-between">
                <span className="text-sm">{widget.label}</span>
                <Switch
                  checked={isVisible}
                  onCheckedChange={(checked) => onToggleWidget(widget.id, checked)}
                />
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
