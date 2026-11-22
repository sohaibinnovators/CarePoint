"use client";

import { SearchFilter } from "@/components/ui/search-filter";
import { Tabs } from "@/components/ui/tabs";

export function DataToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filter,
  onFilterChange,
  filterOptions,
  tabs,
  activeTab,
  onTabChange,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filter?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: { label: string; value: string }[];
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
}) {
  const showSearch = typeof search === "string" && typeof onSearchChange === "function";

  return (
    <div className="space-y-4">
      {tabs && activeTab && onTabChange ? (
        <Tabs tabs={tabs} active={activeTab} onChange={onTabChange} />
      ) : null}
      {showSearch ? (
        <SearchFilter
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          filter={filter}
          onFilterChange={onFilterChange}
          filterOptions={filterOptions}
        />
      ) : null}
    </div>
  );
}
