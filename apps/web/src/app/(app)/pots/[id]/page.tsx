'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PotDetailPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/pots');
  }, [router]);
  return null;
}
