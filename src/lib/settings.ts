import { localizeMedia } from "./media";

export async function getStoreSettings() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/store-settings`,
      {
        headers: {
          'x-publishable-api-key':
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
        },
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const { settings } = await res.json();
    return localizeMedia(settings);
  } catch {
    return null;
  }
}
