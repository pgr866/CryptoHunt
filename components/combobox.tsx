import { useState, useEffect, useRef, useMemo, ReactNode } from "react";
import { Check, ChevronDown, Loader2, Pencil, Trash, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useVirtualizer } from "@tanstack/react-virtual";

type TagConfig = {
  condition: (value: string) => boolean;
  name: string;
  className?: string;
};

type ComboboxItem = {
  name: string;
  imageUrl?: string;
};

type ButtonProps = {
  value?: string;
  values?: ComboboxItem[];
  alwaysSelected?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "logo";
  width?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  icon?: ReactNode;
  isLoading?: boolean;
  tagConfig?: TagConfig[];
  onEdit?: (oldValue: string, newValue: string) => void;
  onDelete?: (value: string) => void;
};

export function Combobox({
  value = "",
  values = [],
  alwaysSelected = false,
  variant = "default",
  size = "default",
  width = "200px",
  placeholder = "Items",
  onChange,
  icon,
  isLoading = false,
  tagConfig = [],
  onEdit,
  onDelete,
}: Readonly<ButtonProps>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

  const filteredValues = useMemo(() =>
    values.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    ),
    [values, search]
  );

  const parentRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = (item: ComboboxItem) => {
    if (!isEditing && !deletingItem) {
      const newValue = (item.name === value && !alwaysSelected) ? "" : item.name;
      setOpen(false);
      onChange?.(newValue);
    }
  };

  const handleEditClick = (e: React.MouseEvent, item: ComboboxItem) => {
    e.stopPropagation();
    setEditingItem(item.name);
    setEditValue(item.name);
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, item: ComboboxItem) => {
    e.stopPropagation();
    setDeletingItem(item.name);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing && editingItem) {
      onEdit?.(editingItem, editValue);
    } else if (deletingItem) {
      onDelete?.(deletingItem);
    }
    handleCancel(e);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditingItem(null);
    setDeletingItem(null);
  };

  const virtualizer = useVirtualizer({
    count: filteredValues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 5,
  });

  const [_, forceRerender] = useState(0);
  useEffect(() => {
    setTimeout(() => forceRerender(n => n + 1));
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          role="combobox"
          aria-expanded={open}
          style={{ width }}
          disabled={isLoading}
          className="justify-between overflow-hidden font-normal"
        >
          <span className="flex items-center gap-2 truncate">
            {icon && icon}
            {isLoading && <Loader2 className="animate-spin ml-1" />}
            {!isLoading && (value || placeholder)}
          </span>
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-fit" style={{ minWidth: width }}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            className="h-9"
            value={search}
            onValueChange={setSearch}
          />
          <CommandGroup className="overflow-hidden">
            <div ref={parentRef} className="max-h-[300px] overflow-auto">
              {filteredValues.length === 0 ? (
                <p className="h-9 py-1 text-center text-sm text-muted-foreground">
                  No {placeholder.toLowerCase()} found
                </p>
              ) : (
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {virtualizer.getVirtualItems().map(virtualRow => {
                    const item = filteredValues[virtualRow.index];
                    const matchingTag = tagConfig.find(config => config.condition(item.name));
                    const isItemSelected = value === item.name;
                    const isItemEditing = editingItem === item.name;
                    const isItemDeleting = deletingItem === item.name;
                    const hasEditButtons = Boolean(onEdit || onDelete);

                    return (
                      <CommandItem
                        key={virtualRow.key}
                        value={item.name}
                        onSelect={() => handleSelect(item)}
                        className={cn(
                          "cursor-pointer",
                          "flex items-center justify-between",
                          isItemSelected && "bg-accent text-accent-foreground"
                        )}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className="flex items-center flex-1 gap-2">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="size-5"
                            />
                          )}
                          {isItemEditing ? (
                            <Input
                              className="h-6 p-0.5"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          ) : (
                            <span>{item.name}</span>
                          )}
                          {matchingTag && (
                            <span className={cn(
                              "ml-2 px-2 py-0.5 text-xs rounded-full",
                              matchingTag.className || "bg-muted text-muted-foreground"
                            )}>
                              {matchingTag.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center ml-auto">
                          {isItemSelected && (
                            <>
                              {(isItemEditing || isItemDeleting) ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    onClick={handleConfirm}
                                  >
                                    <Check className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    onClick={handleCancel}
                                  >
                                    <X className="size-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {onEdit && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 hover:bg-accent"
                                      onClick={(e) => handleEditClick(e, item)}
                                    >
                                      <Pencil className="size-3" />
                                    </Button>
                                  )}
                                  {onDelete && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-6 hover:bg-accent"
                                      onClick={(e) => handleDeleteClick(e, item)}
                                    >
                                      <Trash className="size-3" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </>
                          )}
                          <Check className={cn(isItemSelected && !hasEditButtons ? "size-4" : "size-0")} />
                        </div>
                      </CommandItem>
                    );
                  })}
                </div>
              )}
            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
