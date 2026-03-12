import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const TicketCombobox = ({ tickets, value, onChange }) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="truncate">
                        {value
                            ? tickets.find((ticket) => ticket.id === value)?.title
                            : "Select ticket..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command>
                    <CommandInput placeholder="Search ticket..." />
                    <CommandList>
                        <CommandEmpty>No ticket found.</CommandEmpty>
                        <CommandGroup>
                            {tickets.map((ticket) => (
                                <CommandItem
                                    key={ticket.id}
                                    value={ticket.title}
                                    onSelect={() => {
                                        onChange(ticket.id === value ? "" : ticket.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === ticket.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {ticket.title}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
