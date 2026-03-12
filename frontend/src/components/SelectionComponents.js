import React, { useState, useMemo, memo } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from './ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const OptimizedMultiStaffCombobox = memo(({ users = [], selectedIds = [], onChange, isLoading = false }) => {
    const [open, setOpen] = useState(false);

    const toggleUser = (userId) => {
        if (selectedIds.includes(userId)) {
            onChange(selectedIds.filter((id) => id !== userId));
        } else {
            onChange([...selectedIds, userId]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-transparent border-slate-700 hover:bg-slate-800/50 overflow-hidden"
                    data-testid="multi-staff-select"
                >
                    <span className="truncate">
                        {selectedIds.length > 0
                            ? `${selectedIds.length} staff selected`
                            : "Select staff"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search staff..." />
                    <CommandList>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading staff list...
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>No staff found.</CommandEmpty>
                                <CommandGroup>
                                    {users.map((user) => (
                                        <CommandItem
                                            key={user.id}
                                            value={`${user.username} ${user.role} ${user.division}`}
                                            onSelect={() => toggleUser(user.id)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 text-primary",
                                                    selectedIds.includes(user.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span>{user.username}</span>
                                                <span className="text-xs text-muted-foreground">{user.role} - {user.division}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
});

export const OptimizedSiteCombobox = memo(({ sites = [], value, onChange, isLoading = false }) => {
    const [open, setOpen] = useState(false);
    const selectedSite = useMemo(() => sites.find((s) => s.id === value), [sites, value]);

    // OPTIMIZATION: Display a subset by default to avoid initial mounting lag
    const displayLimit = 300;
    const displaySites = useMemo(() => sites.slice(0, displayLimit), [sites]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-transparent border-slate-700 hover:bg-slate-800/50 overflow-hidden"
                    data-testid="site-select-combobox"
                >
                    <span className="truncate mr-2">
                        {value ? selectedSite?.name : "Select site..."}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search site..." />
                    <CommandList>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading sites...
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>No site found.</CommandEmpty>
                                <CommandGroup>
                                    {displaySites.map((site) => (
                                        <CommandItem
                                            key={site.id}
                                            value={site.name}
                                            onSelect={() => {
                                                onChange(site.id === value ? "" : site.id);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 text-primary",
                                                    value === site.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {site.name}
                                        </CommandItem>
                                    ))}
                                    {sites.length > displayLimit && (
                                        <div className="p-2 text-[10px] text-center text-muted-foreground border-t border-border">
                                            Showing first {displayLimit} sites. Search for specific sites.
                                        </div>
                                    )}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
});

export const OptimizedStaffCombobox = memo(({ users = [], value, onChange, isLoading = false }) => {
    const [open, setOpen] = useState(false);
    const selectedUser = useMemo(() => users.find((user) => user.id === value), [users, value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-transparent border-slate-700 hover:bg-slate-800/50 overflow-hidden"
                    data-testid="staff-filter"
                >
                    <span className="truncate">
                        {value && value !== 'all'
                            ? `${selectedUser?.username} (${selectedUser?.role} - ${selectedUser?.division})`
                            : "All Staff"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search staff..." />
                    <CommandList>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading staff...
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>No staff found.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                        value="all-staff"
                                        onSelect={() => {
                                            onChange('all');
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === 'all' ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        All Staff
                                    </CommandItem>
                                    {users.map((user) => (
                                        <CommandItem
                                            key={user.id}
                                            value={`${user.username} ${user.role} ${user.division}`}
                                            onSelect={() => {
                                                onChange(user.id);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === user.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span>{user.username}</span>
                                                <span className="text-xs text-muted-foreground">{user.role} - {user.division}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
});

