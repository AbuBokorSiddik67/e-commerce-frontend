// src/app/account/orders/page.tsx
import { getMyOrders } from '@/lib/account';
import OrderRow from '@/components/account/OrderRow';

export const metadata = { title: 'My orders' };

export default async function OrdersPage() {
  const orders = await getMyOrders();
  return (
    <div>
      <h1 className="mb-4 font-head text-2xl font-bold">My orders</h1>
      {orders.length ? (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.id}>
              <OrderRow o={o} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-black/60 dark:text-white/60">
          No orders yet.
        </p>
      )}
    </div>
  );
}
