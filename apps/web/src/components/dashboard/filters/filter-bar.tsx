import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterState = {
  preset: "7d" | "30d" | "90d" | "ytd" | "custom";
  from: string;
  to: string;
  turnaround: string;
  status: string;
  acquisition: string;
  draft: string;
  customerType: string;
};

export type FilterOptions = {
  turnaroundOptions: Array<string>;
  statusOptions: Array<string>;
  acquisitionOptions: Array<string>;
};

const presetLabels: Record<string, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  ytd: "Year to date",
  custom: "Custom",
};

export function FilterBar({
  filters,
  options,
  onFilterChange,
}: {
  filters: FilterState;
  options: FilterOptions;
  onFilterChange: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
}) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      const from = filters.from ? new Date(filters.from) : undefined;
      const to = filters.to ? new Date(filters.to) : undefined;
      if (from) return { from, to };
      return undefined;
    },
  );

  const [openSelect, setOpenSelect] = React.useState<string | null>(null);

  const handleOpenChange = React.useCallback((name: string, open: boolean) => {
    setOpenSelect(open ? name : null);
  }, []);

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      setDateRange(range);
      onFilterChange("from", format(range.from, "yyyy-MM-dd"));
      if (range.to) {
        onFilterChange("to", format(range.to, "yyyy-MM-dd"));
      }
    }
  };

  return (
    <div className="scrollbar-hide flex flex-nowrap items-center gap-2 overflow-x-auto">
      {/* Date Range - Combined Preset + Custom Picker */}
      <Popover
        open={openSelect === "date"}
        onOpenChange={(open) => handleOpenChange("date", open)}
      >
        <PopoverTrigger
          render={
            <Button
              variant={"outline"}
              size={"sm"}
              className={
                "h-8 w-[170px] shrink-0 justify-between gap-2 text-xs font-normal tabular-nums"
              }
            />
          }
        >
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" />
            <span className="line-clamp-1">
              {filters.preset === "custom" && dateRange?.from
                ? dateRange.to
                  ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                  : format(dateRange.from, "MMM d")
                : presetLabels[filters.preset]}
            </span>
          </span>
          <ChevronDown className="size-3 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="space-y-1 border-r p-2">
              {(["7d", "30d", "90d", "ytd"] as const).map((preset) => (
                <Button
                  key={preset}
                  variant={filters.preset === preset ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 w-full justify-start text-xs"
                  onClick={() => onFilterChange("preset", preset)}
                >
                  {presetLabels[preset]}
                </Button>
              ))}
              <Button
                variant={filters.preset === "custom" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-full justify-start text-xs"
                onClick={() => onFilterChange("preset", "custom")}
              >
                Custom range
              </Button>
            </div>
            {filters.preset === "custom" && (
              <div className="p-2">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="bg-border h-4 w-px" />

      {/* Compact Selects */}
      <CompactSelect
        name="turnaround"
        value={filters.turnaround}
        open={openSelect === "turnaround"}
        onOpenChange={(open) => handleOpenChange("turnaround", open)}
        onValueChange={(v) => onFilterChange("turnaround", v)}
        options={options.turnaroundOptions}
        placeholder="Turnaround"
        allLabel="All speeds"
      />
      <CompactSelect
        name="status"
        value={filters.status}
        open={openSelect === "status"}
        onOpenChange={(open) => handleOpenChange("status", open)}
        onValueChange={(v) => onFilterChange("status", v)}
        options={options.statusOptions}
        placeholder="Status"
        allLabel="All statuses"
      />
      <CompactSelect
        name="acquisition"
        value={filters.acquisition}
        open={openSelect === "acquisition"}
        onOpenChange={(open) => handleOpenChange("acquisition", open)}
        onValueChange={(v) => onFilterChange("acquisition", v)}
        options={options.acquisitionOptions}
        placeholder="Channel"
        allLabel="All channels"
      />
      <CompactSelect
        name="draft"
        value={filters.draft}
        open={openSelect === "draft"}
        onOpenChange={(open) => handleOpenChange("draft", open)}
        onValueChange={(v) => onFilterChange("draft", v)}
        options={["All", "1", "2", "3", "4", "5+"]}
        placeholder="Draft"
        allLabel="All drafts"
      />
      <CompactSelect
        name="customerType"
        value={filters.customerType}
        open={openSelect === "customerType"}
        onOpenChange={(open) => handleOpenChange("customerType", open)}
        onValueChange={(v) => onFilterChange("customerType", v)}
        options={["All", "Single", "Multi"]}
        placeholder="Customer"
        allLabel="All customers"
        labelMap={{ Single: "Single-draft", Multi: "Multi-draft" }}
      />
    </div>
  );
}

function CompactSelect({
  name: _name,
  value,
  open,
  onOpenChange,
  onValueChange,
  options,
  placeholder,
  allLabel,
  labelMap = {},
}: {
  name: string;
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  options: Array<string>;
  placeholder: string;
  allLabel: string;
  labelMap?: Record<string, string>;
}) {
  const displayValue = value === "All" ? allLabel : labelMap[value] || value;

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger className="h-8 w-[140px] shrink-0 justify-between gap-2 border-dashed text-xs tabular-nums [&>span]:line-clamp-1">
        <SelectValue placeholder={placeholder}>{displayValue}</SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {options.map((option) => (
          <SelectItem key={option} value={option} className="text-xs">
            {option === "All" ? allLabel : labelMap[option] || option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
