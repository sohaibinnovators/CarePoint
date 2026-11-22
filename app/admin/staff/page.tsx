"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchFilter } from "@/components/ui/search-filter";
import { Table, Td } from "@/components/ui/table";
import { staff } from "@/lib/mock-data";

export default function AdminStaffPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter((member) => {
      const matchesFilter = filter === "all" || member.status === filter;
      const matchesSearch =
        member.name.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.department.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [search, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Administrative and support staff directory (demo)."
      />
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff…"
        filter={filter}
        onFilterChange={setFilter}
        filterOptions={[
          { label: "All statuses", value: "all" },
          { label: "Active", value: "active" },
          { label: "On leave", value: "on-leave" },
        ]}
      />
      <Card>
        <Table headers={["Name", "Role", "Department", "Email", "Phone", "Status"]}>
          {filtered.map((member) => (
            <tr key={member.id}>
              <Td className="font-medium">{member.name}</Td>
              <Td>{member.role}</Td>
              <Td>{member.department}</Td>
              <Td>{member.email}</Td>
              <Td>{member.phone}</Td>
              <Td>
                <Badge variant={statusBadgeVariant(member.status)}>
                  {member.status}
                </Badge>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
