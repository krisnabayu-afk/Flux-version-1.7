import React, { useState } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../lib/utils';

const SiteCombobox = ({ sites, value, onChange }) => {
    const [open, setOpen] = useState(false);

    // Ensure sites is an array to prevent errors if undefined/null is passed
    const safeSites = Array.isArray(sites) ? sites : [];
    const selectedSite = safeSites.find((site) => site.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-background border-input text-foreground hover:bg-accent overflow-hidden"
                    data-testid="site-select-combobox"
                >
                    <span className="truncate mr-2">
                        {value
                            ? selectedSite?.name
                            : "Select site..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 bg-popover border-border">
                <Command className="bg-popover border-border">
                    <CommandInput placeholder="Search site..." className="text-white" />
                    <CommandList>
                        <CommandEmpty className="text-muted-foreground">No site found.</CommandEmpty>
                        <CommandGroup>
                            {safeSites.map((site) => (
                                <CommandItem
                                    key={site.id}
                                    value={site.name}
                                    className="text-foreground data-[selected=true]:bg-accent"
                                    onSelect={() => {
                                        onChange(site.id === value ? "" : site.id);
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

export default SiteCombobox;
