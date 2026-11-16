import CheckoutForm from '@/components/checkout/CheckoutForm';
import { redirect } from 'next/navigation';
import { getCart, getShippingOptions } from '../../lib/cart';
import { getAssuranceItems } from '../../lib/assurance';
import { getStoreSettings } from '../../lib/settings';
import { getCustomer } from '../../lib/auth';

export const metadata = { title: 'Checkout' };

export default async function CheckoutPage() {

  const customer = await getCustomer();
  if (!customer) redirect('/login?next=/checkout');

  const cart = await getCart();
  if (!cart || cart.lines.length === 0) redirect('/cart');

  const options = await getShippingOptions(cart.id);
  const assurance = getAssuranceItems(await getStoreSettings());
  const defaults = {
    fullName: customer
      ? [customer.firstName, customer.lastName].filter(Boolean).join(' ')
      : '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <h1 className="mb-5 font-head text-2xl font-bold">Checkout</h1>

      {options.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/20 px-6 py-14 text-center dark:border-white/20">
          <p className="text-sm text-black/70 dark:text-white/70">
            Delivery is not available for this order right now. Please contact
            us and we will help you.
          </p>
          <a
            href="/cart"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Back to cart
          </a>
        </div>
      ) : (
        <CheckoutForm
          currency={cart.currency}
          lines={cart.lines}
          subtotal={cart.subtotal}
          discount={cart.discount}
          options={options}
          defaults={defaults}
          loggedIn={!!customer}
          assurance={assurance}
        />
      )}
    </main>
  );
}
