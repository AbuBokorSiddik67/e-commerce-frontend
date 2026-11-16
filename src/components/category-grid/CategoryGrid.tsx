import { getCategoryTree } from '@/lib/categories';

export default async function CategoryGrid() {
  const tree = await getCategoryTree();
  if (!tree.length) return null;
  const list = tree.slice(0, 16);

  return (
    <section
      aria-labelledby="cat-title"
      className="mx-auto max-w-7xl px-4 py-3 sm:px-6"
    >
      <div className="overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/15 dark:bg-[#171b22]">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/15">
          <h2 id="cat-title" className="font-head text-lg font-bold">
            Popular categories
          </h2>
          <a
            href="/categories"
            className="text-sm font-semibold text-accent hover:underline"
          >
            Show more →
          </a>
        </div>

        <ul className="grid auto-cols-[84px] grid-flow-col grid-rows-2 gap-x-2 gap-y-4 overflow-x-auto p-4 [scrollbar-width:none] lg:grid-flow-row lg:grid-cols-8 lg:grid-rows-none lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {list.map((c, i) => (
            <li key={c.id} className={i >= 8 ? 'lg:hidden' : ''}>
              <a
                href={`/category/${c.handle}`}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-black/5 lg:h-20 lg:w-20 dark:border-white/15 dark:bg-white/5">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-semibold text-black/30 dark:text-white/30">
                      {c.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 text-xs leading-4 group-hover:text-accent">
                  {c.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
