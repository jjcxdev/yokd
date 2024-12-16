"use client";

import { useSearchParams } from "next/navigation";

export default function Routine() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");

  return <div></div>;
}
