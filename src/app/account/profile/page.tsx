// src/app/account/profile/page.tsx
import ProfileForm from '@/components/account/ProfileForm';
import { getCustomer } from '@/lib/auth';

export const metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const c = await getCustomer();
  if (!c) return null;
  return (
    <div>
      <h1 className="mb-4 font-head text-2xl font-bold">Profile</h1>
      <ProfileForm
        initial={{
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone ?? '',
          email: c.email,
        }}
      />
    </div>
  );
}
