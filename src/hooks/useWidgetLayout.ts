import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from '@/lib/utils';
import { Json } from '@/integrations/supabase/types';

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
}

interface UseWidgetLayoutProps {
  pageId: 'dashboard' | 'insights';
  defaultLayout: WidgetLayout[];
  userId: string | undefined;
}

export const useWidgetLayout = ({ pageId, defaultLayout, userId }: UseWidgetLayoutProps) => {
  const [layout, setLayout] = useState<WidgetLayout[]>(defaultLayout);
  const [hiddenWidgets, setHiddenWidgetsState] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load layout + hidden_widgets from database on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const fetchLayout = async () => {
      const { data, error } = await supabase
        .from('user_widget_layouts')
        .select('layout, hidden_widgets')
        .eq('user_id', userId)
        .eq('page_id', pageId)
        .maybeSingle();

      // Restore hidden widgets
      if (data?.hidden_widgets && Array.isArray(data.hidden_widgets)) {
        setHiddenWidgetsState(data.hidden_widgets as string[]);
      }

      if (data?.layout && Array.isArray(data.layout)) {
        // Validate and cast the layout data
        const savedLayout = data.layout as unknown as WidgetLayout[];
        if (savedLayout.length > 0 && savedLayout[0].i !== undefined) {
          // Build lookup from default layout for validation/migrations
          const defaultLayoutMap = new Map(
            defaultLayout.map(item => [item.i, { w: item.w, h: item.h }])
          );
          
          // Check if saved layout has invalid widths (corrupted by responsive reflow)
          const isInvalidLayout = savedLayout.some(item => {
            const defaults = defaultLayoutMap.get(item.i);
            return defaults !== undefined && item.w !== defaults.w;
          });

          // Widgets are not resizable in the UI, so any height mismatch is safe to auto-migrate.
          const needsHeightMigration = savedLayout.some(item => {
            const defaults = defaultLayoutMap.get(item.i);
            return defaults !== undefined && item.h !== defaults.h;
          });
          
          if (isInvalidLayout) {
            // Auto-heal: use default layout and persist it
            setLayout(defaultLayout);
            await supabase
              .from('user_widget_layouts')
              .upsert({
                user_id: userId,
                page_id: pageId,
                layout: defaultLayout as unknown as Json,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'user_id,page_id'
              });
          } else if (needsHeightMigration) {
            const migratedLayout = savedLayout.map(item => {
              const defaults = defaultLayoutMap.get(item.i);
              if (!defaults) return item;
              return { ...item, h: defaults.h };
            });

            setLayout(migratedLayout);
            await supabase
              .from('user_widget_layouts')
              .upsert(
                {
                  user_id: userId,
                  page_id: pageId,
                  layout: migratedLayout as unknown as Json,
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: 'user_id,page_id',
                }
              );
          } else {
            setLayout(savedLayout);
          }
        }
      }
      setLoading(false);
    };

    fetchLayout();
  }, [userId, pageId, defaultLayout]);

  // Debounced save function - memoized to prevent recreation
  const saveLayout = useMemo(
    () => debounce(async (newLayout: WidgetLayout[], currentUserId: string) => {
      if (!currentUserId) return;
      
      await supabase
        .from('user_widget_layouts')
        .upsert({
          user_id: currentUserId,
          page_id: pageId,
          layout: newLayout as unknown as Json,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,page_id'
        });
    }, 1000),
    [pageId]
  );

  const onLayoutChange = useCallback((newLayout: WidgetLayout[]) => {
    setLayout(newLayout);
    if (userId) {
      saveLayout(newLayout, userId);
    }
  }, [saveLayout, userId]);

  const setHiddenWidgets = useCallback(async (widgetIds: string[]) => {
    setHiddenWidgetsState(widgetIds);
    if (!userId) return;
    
    await supabase
      .from('user_widget_layouts')
      .upsert({
        user_id: userId,
        page_id: pageId,
        hidden_widgets: widgetIds as unknown as Json,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,page_id'
      });
  }, [userId, pageId]);

  return { layout, onLayoutChange, hiddenWidgets, setHiddenWidgets, loading };
};
