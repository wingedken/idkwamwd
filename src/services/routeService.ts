import { supabase } from '../lib/supabase';
import type { Route, Task, ApiResponse } from '../types';

export const routeService = {
  // Opret/opdater rute for medarbejder
  async createOrUpdateRoute(routeData: {
    employee_id: string;
    date: string;
    task_ids: string[];
    start_location: { lat: number; lng: number };
  }): Promise<ApiResponse<Route>> {
    try {
      // Tjek om rute allerede eksisterer
      const { data: existingRoute } = await supabase
        .from('routes')
        .select('*')
        .eq('employee_id', routeData.employee_id)
        .eq('route_date', routeData.date)
        .single();

      const routePayload = {
        employee_id: routeData.employee_id,
        route_date: routeData.date,
        start_lat: routeData.start_location.lat,
        start_lng: routeData.start_location.lng,
        is_optimized: false,
        updated_at: new Date().toISOString()
      };

      let route;
      if (existingRoute) {
        // Opdater eksisterende rute
        const { data, error } = await supabase
          .from('routes')
          .update(routePayload)
          .eq('id', existingRoute.id)
          .select()
          .single();

        if (error) throw error;
        route = data;
      } else {
        // Opret ny rute
        const { data, error } = await supabase
          .from('routes')
          .insert(routePayload)
          .select()
          .single();

        if (error) throw error;
        route = data;
      }

      // Opdater route stops
      await this.updateRouteStops(route.id, routeData.task_ids);

      return { success: true, data: route };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Opdater route stops
  async updateRouteStops(routeId: string, taskIds: string[]): Promise<void> {
    // Slet eksisterende stops
    await supabase
      .from('route_stops')
      .delete()
      .eq('route_id', routeId);

    // Opret nye stops
    const stops = taskIds.map((taskId, index) => ({
      route_id: routeId,
      task_id: taskId,
      stop_order: index + 1,
      status: 'pending'
    }));

    if (stops.length > 0) {
      await supabase
        .from('route_stops')
        .insert(stops);
    }
  },

  // Hent rute for medarbejder og dato
  async getRoute(employeeId: string, date: string): Promise<ApiResponse<Route | null>> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          route_stops (
            *,
            tasks (
              *,
              customers (name),
              customer_addresses (street, postal_code, city)
            )
          )
        `)
        .eq('employee_id', employeeId)
        .eq('route_date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return { success: true, data: data || null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Optimer rute med GraphHopper
  async optimizeRoute(routeId: string): Promise<ApiResponse<Route>> {
    try {
      // Hent rute med stops
      const { data: route, error: routeError } = await supabase
        .from('routes')
        .select(`
          *,
          route_stops (
            *,
            tasks (
              *,
              customer_addresses (street, postal_code, city)
            )
          )
        `)
        .eq('id', routeId)
        .single();

      if (routeError) throw routeError;

      // Simuler GraphHopper API kald (i produktion ville dette være et rigtigt API kald)
      const optimizationResult = await this.callGraphHopperAPI(route);

      // Opdater rute med optimeret rækkefølge
      const { data: updatedRoute, error: updateError } = await supabase
        .from('routes')
        .update({
          total_distance_km: optimizationResult.total_distance,
          total_duration_minutes: optimizationResult.total_duration,
          is_optimized: true,
          optimization_data: optimizationResult.raw_data,
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Opdater stop rækkefølge
      await this.updateStopOrder(routeId, optimizationResult.optimized_order);

      return { success: true, data: updatedRoute };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Simuleret GraphHopper API kald
  async callGraphHopperAPI(route: any): Promise<{
    total_distance: number;
    total_duration: number;
    optimized_order: string[];
    raw_data: any;
  }> {
    // Simuler API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simuleret optimering - i produktion ville dette være GraphHopper API
    const stops = route.route_stops || [];
    const optimizedOrder = stops
      .sort(() => Math.random() - 0.5) // Random shuffle som simulation
      .map((stop: any) => stop.task_id);

    return {
      total_distance: Math.random() * 50 + 10, // 10-60 km
      total_duration: stops.length * 30 + Math.random() * 60, // ~30 min per stop + variation
      optimized_order: optimizedOrder,
      raw_data: {
        provider: 'GraphHopper',
        optimized_at: new Date().toISOString(),
        algorithm: 'genetic'
      }
    };
  },

  // Opdater stop rækkefølge efter optimering
  async updateStopOrder(routeId: string, optimizedTaskIds: string[]): Promise<void> {
    for (let i = 0; i < optimizedTaskIds.length; i++) {
      await supabase
        .from('route_stops')
        .update({ stop_order: i + 1 })
        .eq('route_id', routeId)
        .eq('task_id', optimizedTaskIds[i]);
    }
  },

  // Manuel ændring af stop rækkefølge
  async reorderStops(routeId: string, newOrder: string[]): Promise<ApiResponse<boolean>> {
    try {
      await this.updateStopOrder(routeId, newOrder);

      // Marker rute som ikke-optimeret da den er manuelt ændret
      await supabase
        .from('routes')
        .update({ 
          is_optimized: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId);

      return { success: true, data: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Hent alle ruter for en dato (til oversigt)
  async getRoutesByDate(companyId: string, date: string): Promise<ApiResponse<Route[]>> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          employees:users!routes_employee_id_fkey (
            id,
            name,
            email
          ),
          route_stops (
            *,
            tasks (
              *,
              customers (name)
            )
          )
        `)
        .eq('route_date', date)
        .in('employee_id', 
          // Subquery for at få medarbejdere fra virksomheden
          supabase
            .from('users')
            .select('id')
            .eq('company_id', companyId)
            .eq('role', 'employee')
        );

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};