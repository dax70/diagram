import { ReactNode } from "react";

export default function TwoColumnLayout({
  rightContent,
  children,
}: {
  rightContent: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full">
      <div className="w-1/3 p-4 flex flex-col">{rightContent}</div>
      <div className="w-2/3 p-4">{children}</div>
    </div>
  );
}
