import { Button } from '@/components/ui';
import Link from 'next/link';

export default function Home() {
  return (
    <Button asChild>
      <Link href={'/calendar'}>To Calendar</Link>
    </Button>
  );
}
