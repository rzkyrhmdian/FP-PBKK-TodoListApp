"use client"

import { Button } from "@/components/ui/button"

interface TodoFiltersProps {
  filterPriority: "all" | "low" | "medium" | "high"
  filterStatus: "all" | "completed" | "pending"
  onPriorityChange: (priority: "all" | "low" | "medium" | "high") => void
  onStatusChange: (status: "all" | "completed" | "pending") => void
}

export function TodoFilters({ filterPriority, filterStatus, onPriorityChange, onStatusChange }: TodoFiltersProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2 text-foreground">Filter Prioritas</p>
        <div className="flex flex-wrap gap-2">
          {(["all", "low", "medium", "high"] as const).map((priority) => (
            <Button
              key={priority}
              size="sm"
              variant={filterPriority === priority ? "default" : "outline"}
              onClick={() => onPriorityChange(priority)}
              className="text-xs"
            >
              {priority === "all"
                ? "Semua"
                : priority === "low"
                  ? "Rendah"
                  : priority === "medium"
                    ? "Sedang"
                    : "Tinggi"}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2 text-foreground">Filter Status</p>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "completed"] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filterStatus === status ? "default" : "outline"}
              onClick={() => onStatusChange(status)}
              className="text-xs"
            >
              {status === "all" 
                ? "Semua" 
                  : status === "pending" 
                    ? "Pending" 
                      : "Selesai"}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
