import { redirect } from "next/navigation";
import { DEFAULT_FALLBACK_TOKEN } from "@/lib/constants";

interface RootPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function RootPage({ searchParams }: RootPageProps) {
  const params = await searchParams;
  const token = params?.token || DEFAULT_FALLBACK_TOKEN;
  redirect(`/menu/${token}`);
}
