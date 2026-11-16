import { getCategoryTree } from '@/lib/categories';
import CategoryBarClient from './CategoryBarClient';

export default async function CategoryBar() {
  const tree = await getCategoryTree();
  if (!tree.length) return null;
  return <CategoryBarClient tree={tree} />;
}
