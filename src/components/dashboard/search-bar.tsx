"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  value?: string;
}

/**
 * 検索バーコンポーネント
 * ダッシュボード各タプでの統一検索UI
 */
export function SearchBar({
  onSearch,
  placeholder = "検索...",
  className,
  value: controlledValue,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const query = controlledValue ?? internalValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalValue("");
    }
    onSearch("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onSearch(newValue);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("search-bar", className)}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="search-clear"
            aria-label="クリア"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </form>
  );
}
