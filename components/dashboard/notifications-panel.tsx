"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { notifications as seed } from "@/lib/mock-data";
import type { NotificationItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NotificationsPanel() {
  const [items, setItems] = useState<NotificationItem[]>(seed);

  function markRead(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card
          key={item.id}
          className={cn(!item.read && "border-primary/30 bg-light-blue/40")}
        >
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{item.title}</h3>
                <Badge variant={item.read ? "muted" : "default"}>
                  {item.read ? "Read" : "Unread"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted">{item.message}</p>
              <p className="mt-2 text-xs text-muted">{item.time}</p>
            </div>
            {!item.read ? (
              <button
                type="button"
                onClick={() => markRead(item.id)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Mark read
              </button>
            ) : null}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
