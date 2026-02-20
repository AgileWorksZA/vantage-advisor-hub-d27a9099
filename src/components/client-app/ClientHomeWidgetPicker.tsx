import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

export interface ClientWidgetConfig {
  id: string;
  label: string;
}

interface ClientHomeWidgetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgets: ClientWidgetConfig[];
  visibleWidgets: string[];
  onToggle: (widgetId: string, visible: boolean) => void;
}

const ClientHomeWidgetPicker = ({ open, onOpenChange, widgets, visibleWidgets, onToggle }: ClientHomeWidgetPickerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base">Customise Home</SheetTitle>
          <SheetDescription className="text-xs">Choose which widgets appear on your home screen</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 pt-2">
          {widgets.map((w) => (
            <div key={w.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-foreground">{w.label}</span>
              <Switch
                checked={visibleWidgets.includes(w.id)}
                onCheckedChange={(checked) => onToggle(w.id, checked)}
              />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ClientHomeWidgetPicker;
