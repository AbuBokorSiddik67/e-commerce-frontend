import { getLatestProducts } from '@/lib/products';
import ProductCard from '@/components/product/ProductCard';

export default async function JustForYou() {
  const products = await getLatestProducts(12);
  if (!products.length) return null;

  return (
    <section
      aria-labelledby="jfy-title"
      className="mx-auto max-w-7xl px-4 py-3 sm:px-6"
    >
      <h2 id="jfy-title" className="mb-3 font-head text-lg font-bold">
        Just for you
      </h2>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {products.map((p, i) => (
          <li key={p.id} className={i >= 8 ? 'hidden sm:block' : ''}>
            <ProductCard p={p} />
          </li>
        ))}
      </ul>

      <div className="mt-5 flex justify-center">
        <a
          href="/products"
          className="rounded-full border border-accent px-8 py-2.5 text-sm font-semibold text-accent hover:bg-accent hover:text-white"
        >
          Show more
        </a>
      </div>
    </section>
  );
}
