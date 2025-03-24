import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare NBA Players",
  description: "Compare stats between the greatest basketball players of all time",
};

export default function CompareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
