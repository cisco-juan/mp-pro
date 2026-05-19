import { Skeleton } from '@/components/ui/skeleton';

export default function ClientesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-full max-w-sm" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
