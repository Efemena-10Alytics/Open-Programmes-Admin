// app/admin/users/_components/custom-faceted-filter.tsx
import * as React from "react";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface CustomFacetedFilterProps {
  name: string;
  storageKey: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onChange?: (values: string[]) => void;
}

export function CustomFacetedFilter({
  name,
  storageKey,
  options,
  onChange,
}: CustomFacetedFilterProps) {
  // Loading initial values from localStorage
  const getInitialValues = React.useCallback(() => {
    if (typeof window === "undefined") return new Set<string>();
    
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set<string>(JSON.parse(stored) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  }, [storageKey]);

  const [selectedValues, setSelectedValues] = React.useState<Set<string>>(getInitialValues);

  // Saving to localStorage whenever values change
  const saveToStorage = React.useCallback((values: Set<string>) => {
    if (typeof window === "undefined") return;
    
    try {
      if (values.size > 0) {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(values)));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Failed to save filter to localStorage:", error);
    }
  }, [storageKey]);

  // Initialize from storage on mount
  React.useEffect(() => {
    const initialValues = getInitialValues();
    if (initialValues.size > 0) {
      setSelectedValues(initialValues);
      onChange?.(Array.from(initialValues));
    }
  }, [getInitialValues, onChange]);

  const handleSelect = (value: string) => {
    const newSelectedValues = new Set(selectedValues);
    
    if (newSelectedValues.has(value)) {
      newSelectedValues.delete(value);
    } else {
      newSelectedValues.add(value);
    }
    
    setSelectedValues(newSelectedValues);
    onChange?.(Array.from(newSelectedValues));
    saveToStorage(newSelectedValues);
  };

  const handleClear = () => {
    const newSelectedValues = new Set<string>();
    setSelectedValues(newSelectedValues);
    onChange?.([]);
    saveToStorage(newSelectedValues);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {name}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${name.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}