import { redirect } from 'next/navigation';

interface AdminIndexProps {
  params: Promise<{  }>;
}

export default async function AdminIndex({ params }: AdminIndexProps) {
  
  redirect(`/admin/properties`);
}
