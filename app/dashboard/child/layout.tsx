import { XpHandler } from "@/components/xp-handler";

export default function ChildDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <XpHandler />
    </>
  );
} 