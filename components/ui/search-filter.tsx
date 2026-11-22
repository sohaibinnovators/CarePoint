"use client";

import { Search } from "lucide-react";
import { Input, Select } from "./input";

export function SearchFilter({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filter,
  onFilterChange,
  filterOptions,
  filterLabel = "Filter",
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filter?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: { label: string; value: string }[];
  filterLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
          aria-label={searchPlaceholder}
        />
      </div>
      {filterOptions && onFilterChange ? (
        <Select
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          aria-label={filterLabel}
          className="sm:w-48"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : null}
    </div>
  );
}
