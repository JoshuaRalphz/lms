"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/layout/SearchBar";

export const LandingSearch = () => {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-2xl">
        <SearchBar onSearch={handleSearch} />
      </div>
    </div>
  );
}; 