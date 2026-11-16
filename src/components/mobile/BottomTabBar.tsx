import { getCategoryTree } from '@/lib/categories';
import { getCartCount } from '@/lib/cart';
import BottomTabBarClient from './BottomTabBarClient';
import { hasAuthToken } from '../../lib/auth';

export default async function BottomTabBar() {
  const [tree, cartCount, loggedIn] = await Promise.all([
    getCategoryTree(),
    getCartCount(),
    hasAuthToken(),
  ]);
  return (
    <BottomTabBarClient tree={tree} cartCount={cartCount} loggedIn={loggedIn} />
  );
}
