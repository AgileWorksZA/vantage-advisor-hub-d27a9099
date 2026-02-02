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
  const [loading, setLoading] = useState(true);

  // Load layout from database on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const fetchLayout = async () => {
      const { data, error } = await supabase
        .from('user_widget_layouts')
        .select('layout')
        .eq('user_id', userId)
        .eq('page_id', pageId)
        .maybeSingle();

      if (data?.layout && Array.isArray(data.layout)) {
        // Validate and cast the layout data
        const savedLayout = data.layout as unknown as WidgetLayout[];
        if (savedLayout.length > 0 && savedLayout[0].i !== undefined) {
          setLayout(savedLayout);
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

  return { layout, onLayoutChange, loading };
};
