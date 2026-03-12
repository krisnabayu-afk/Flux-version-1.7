import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const SiteFilterCombobox = ({ sites, value, onChange }) => {
    const [open, setOpen] = useState(false);

    const selectedSite = sites.find((site) => site.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-transparent border-slate-700 hover:bg-slate-800/50 overflow-hidden"
                    data-testid="site-filter-select"
                >
                    <span className="truncate mr-2">
                        {value && value !== 'all'
                            ? selectedSite?.name
                            : "All Sites"}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command>
                    <CommandInput placeholder="Search site..." />
                    <CommandList>
                        <CommandEmpty>No site found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="all-sites"
                                onSelect={() => {
                                    onChange('all');
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === 'all' || !value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                All Sites
                            </CommandItem>
                            {sites.map((site) => (
                                <CommandItem
                                    key={site.id}
                                    value={site.name}
                                    onSelect={() => {
                                        onChange(site.id === value ? 'all' : site.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === site.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {site.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
