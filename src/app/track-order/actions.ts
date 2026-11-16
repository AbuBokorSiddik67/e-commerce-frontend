'use server';

import { sdk } from '@/lib/medusa';

export type TrackedOrder = {
  number: number;
  placed_at: string;
  cancelled: boolean;
  stage: number;
  dates: {
    placed?: string;
    confirmed?: string;
    shipped?: string;
    delivered?: string;
  };
  currency: string;
  subtotal: number;
  shipping: number;
  total: number;
  city: string | null;
  items: {
    title: string;
    variant?: string | null;
    quantity: number;
    price: number;
    thumbnail?: string | null;
  }[];
};

export type TrackState = { error?: string; order?: TrackedOrder };

export async function trackOrder(
  _prev: TrackState,
  formData: FormData,
): Promise<TrackState> {
  const order_number = String(formData.get('order_number') || '');
  const phone = String(formData.get('phone') || '');

  try {
    const res: any = await sdk.client.fetch('/store/track-order', {
      method: 'POST',
      body: { order_number, phone },
    });
    return { order: res.order as TrackedOrder };
  } catch (e: any) {
    return { error: e?.message || 'Something went wrong. Please try again.' };
  }
}
