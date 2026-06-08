'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { BrokerStats } from '@/types/transaction';

function getAdminSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function registerOperation(payload: {
  property_id: string;
  operation_type: 'venta' | 'alquiler';
  price: number;
  operation_date: string;
  notes?: string;
}) {
  const adminSupabase = getAdminSupabase();

  // Check if already closed
  const { data: existingTransactions } = await adminSupabase
    .from('property_transactions')
    .select('id')
    .eq('property_id', payload.property_id)
    .limit(1);

  if (existingTransactions && existingTransactions.length > 0) {
    throw new Error('Esta propiedad ya fue cerrada previamente.');
  }

  // Insert transaction
  const { error: transactionError } = await adminSupabase
    .from('property_transactions')
    .insert([payload]);

  if (transactionError) {
    throw new Error(`Failed to register operation: ${transactionError.message}`);
  }

  // Deactivate property since it was sold/rented
  const { error: updateError } = await adminSupabase
    .from('properties')
    .update({ is_active: false })
    .eq('id', payload.property_id);

  if (updateError) {
    throw new Error(`Failed to update property status: ${updateError.message}`);
  }

  revalidatePath('/admin/properties');
  revalidatePath(`/admin/properties/${payload.property_id}/edit`);
  
  return { success: true };
}

export async function getBrokerStats(): Promise<BrokerStats> {
  const supabase = await createClient();

  // Get properties including coordinates
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('id, title, latitude, longitude, price, status, is_active');

  let totalProperties = 0;
  let activeProperties = 0;
  let inactiveProperties = 0;

  if (properties) {
    totalProperties = properties.length;
    activeProperties = properties.filter(p => p.is_active !== false).length;
    inactiveProperties = properties.filter(p => p.is_active === false).length;
  }

  // Get transactions with property details
  const { data: transactions, error: transactionsError } = await supabase
    .from('property_transactions')
    .select(`
      id,
      property_id,
      price,
      operation_type,
      operation_date,
      properties (
        date_entry
      )
    `);

  let totalSales = 0;
  let totalRents = 0;
  let revenueSales = 0;
  let revenueRents = 0;
  let totalDaysSales = 0;
  let totalDaysRents = 0;

  if (transactions) {
    transactions.forEach(t => {
      if (t.operation_type === 'venta') {
        totalSales++;
        revenueSales += Number(t.price);
      } else {
        totalRents++;
        revenueRents += Number(t.price);
      }

      // Calculate days on market
      if (t.properties && (t.properties as any).date_entry) {
        const entryDate = new Date((t.properties as any).date_entry);
        const opDate = new Date(t.operation_date);
        const diffTime = Math.abs(opDate.getTime() - entryDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (t.operation_type === 'venta') {
          totalDaysSales += diffDays;
        } else {
          totalDaysRents += diffDays;
        }
      }
    });
  }

  const avgDaysOnMarketSales = totalSales > 0 ? Math.round(totalDaysSales / totalSales) : 0;
  const avgDaysOnMarketRents = totalRents > 0 ? Math.round(totalDaysRents / totalRents) : 0;

  const mapData = (properties || [])
    .filter(p => p.latitude !== null && p.longitude !== null)
    .map(p => ({
      id: p.id,
      title: p.title || 'Propiedad sin título',
      lat: p.latitude,
      lng: p.longitude,
      price: Number(p.price) || 0,
      type: p.status === 'alquilar' ? 'alquiler' : 'venta',
      isClosed: transactions?.some(t => t.property_id === p.id) || false
    }));

  return {
    totalProperties,
    activeProperties,
    inactiveProperties,
    totalSales,
    totalRents,
    revenueSales,
    revenueRents,
    avgDaysOnMarketSales,
    avgDaysOnMarketRents,
    mapData
  };
}
