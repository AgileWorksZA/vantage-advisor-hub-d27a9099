import { useState, useEffect, useCallback, useMemo } from 'react';
import { kapable } from '@/integrations/kapable/client';
import { debounce } from '@/lib/utils';

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
  pageId: 'dashboard' | 'insights' | 'client-dashboard';
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
      // Don't set loading to false -- we're still waiting for auth
      return;
    }
    
    const fetchLayout = async () => {
      const { data, error } = await kapable
        .from('user_widget_layouts')
        .select('*')
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

          // Check if saved layout contains widget IDs not in the default layout (cross-page contamination)
          const hasForeignWidgets = savedLayout.some(item => !defaultLayoutMap.has(item.i));

          // Widgets are not resizable in the UI, so any height mismatch is safe to auto-migrate.
          const needsHeightMigration = savedLayout.some(item => {
            const defaults = defaultLayoutMap.get(item.i);
            return defaults !== undefined && item.h !== defaults.h;
          });
          
          if (isInvalidLayout || hasForeignWidgets) {
            // Auto-heal: use default layout and persist it
            setLayout(defaultLayout);
            const { data: existingLayout } = await kapable
              .from('user_widget_layouts')
              .select('*')
              .eq('user_id', userId)
              .eq('page_id', pageId)
              .maybeSingle();
            if (existingLayout) {
              await kapable.from('user_widget_layouts').update({
                layout: defaultLayout as unknown as Record<string, unknown>,
                updated_at: new Date().toISOString(),
              }).eq('id', (existingLayout as any).id);
            } else {
              await kapable.from('user_widget_layouts').insert({
                user_id: userId,
                page_id: pageId,
                layout: defaultLayout as unknown as Record<string, unknown>,
                updated_at: new Date().toISOString(),
              });
            }
          } else if (needsHeightMigration) {
            const migratedLayout = savedLayout.map(item => {
              const defaults = defaultLayoutMap.get(item.i);
              if (!defaults) return item;
              return { ...item, h: defaults.h };
            });

            setLayout(migratedLayout);
            const { data: existingMig } = await kapable
              .from('user_widget_layouts')
              .select('*')
              .eq('user_id', userId)
              .eq('page_id', pageId)
              .maybeSingle();
            if (existingMig) {
              await kapable.from('user_widget_layouts').update({
                layout: migratedLayout as unknown as Record<string, unknown>,
                updated_at: new Date().toISOString(),
              }).eq('id', (existingMig as any).id);
            } else {
              await kapable.from('user_widget_layouts').insert({
                user_id: userId,
                page_id: pageId,
                layout: migratedLayout as unknown as Record<string, unknown>,
                updated_at: new Date().toISOString(),
              });
            }
        } else {
            // Check for new widgets missing from saved layout
            const savedIds = new Set(savedLayout.map(item => item.i));
            const missingWidgets = defaultLayout.filter(item => !savedIds.has(item.i));

            if (missingWidgets.length > 0) {
              const mergedLayout = [...savedLayout, ...missingWidgets];
              setLayout(mergedLayout);
              const { data: existingMerge } = await kapable
                .from('user_widget_layouts')
                .select('*')
                .eq('user_id', userId)
                .eq('page_id', pageId)
                .maybeSingle();
              if (existingMerge) {
                await kapable.from('user_widget_layouts').update({
                  layout: mergedLayout as unknown as Record<string, unknown>,
                  updated_at: new Date().toISOString(),
                }).eq('id', (existingMerge as any).id);
              } else {
                await kapable.from('user_widget_layouts').insert({
                  user_id: userId,
                  page_id: pageId,
                  layout: mergedLayout as unknown as Record<string, unknown>,
                  updated_at: new Date().toISOString(),
                });
              }
            } else {
              setLayout(savedLayout);
            }
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

      const { data: existing } = await kapable
        .from('user_widget_layouts')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('page_id', pageId)
        .maybeSingle();
      if (existing) {
        await kapable.from('user_widget_layouts').update({
          layout: newLayout as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        }).eq('id', (existing as any).id);
      } else {
        await kapable.from('user_widget_layouts').insert({
          user_id: currentUserId,
          page_id: pageId,
          layout: newLayout as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        });
      }
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

    const { data: existing } = await kapable
      .from('user_widget_layouts')
      .select('*')
      .eq('user_id', userId)
      .eq('page_id', pageId)
      .maybeSingle();
    if (existing) {
      await kapable.from('user_widget_layouts').update({
        hidden_widgets: widgetIds as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      }).eq('id', (existing as any).id);
    } else {
      await kapable.from('user_widget_layouts').insert({
        user_id: userId,
        page_id: pageId,
        hidden_widgets: widgetIds as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      });
    }
  }, [userId, pageId]);

  return { layout, onLayoutChange, hiddenWidgets, setHiddenWidgets, loading };
};
