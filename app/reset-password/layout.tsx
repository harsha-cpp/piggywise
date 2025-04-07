import Link from "next/link";

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#E4DFDA]">
      <div className="p-6">
        <Link href="/" className="inline-block">
          <h1 className="text-2xl font-bold text-green-800">
            Piggywise
          </h1>
        </Link>
      </div>
      {children}
    </div>
  );
} 