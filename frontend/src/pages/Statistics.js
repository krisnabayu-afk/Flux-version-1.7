import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2, PieChart as PieChartIcon, BarChart as BarChartIcon, Download, Star, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_API_URL}/api`;

const COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#64748b'  // slate
];

const Statistics = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'
    const [statDimension, setStatDimension] = useState('user'); // 'user' or 'site'

    // Filters
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedRegion, setSelectedRegion] = useState("all"); // NEW: Region filter
    const [viewType, setViewType] = useState('monthly'); // NEW: 'monthly' or 'annual'

    const setDimensionAndClearCategory = (dim) => {
        setStatDimension(dim);
        if (dim === 'category') {
            setSelectedCategory("all");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchStatistics();
    }, [selectedMonth, selectedYear, selectedCategory, statDimension, selectedRegion, viewType]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API}/activity-categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            // LEADERBOARD: Uses a different endpoint
            if (statDimension === 'leaderboard') {
                let url = `${API}/reports/statistics/leaderboard?year=${selectedYear}&view_type=${viewType}`;
                if (viewType === 'monthly') url += `&month=${selectedMonth}`;
                if (selectedRegion && selectedRegion !== 'all') url += `&region=${selectedRegion}`;
                const response = await axios.get(url);
                setStats(response.data);
            } else {
                let endpoint;
                if (statDimension === 'user') endpoint = 'user-counts';
                else if (statDimension === 'site') endpoint = 'site-counts';
                else endpoint = 'category-counts';

                let url = `${API}/reports/statistics/${endpoint}?year=${selectedYear}&view_type=${viewType}`;

                if (viewType === 'monthly') {
                    url += `&month=${selectedMonth}`;
                }

                if (selectedCategory && selectedCategory !== "all") {
                    url += `&category_id=${selectedCategory}`;
                }

                if (selectedRegion && selectedRegion !== "all") {
                    url += `&region=${selectedRegion}`;
                }

                const response = await axios.get(url);
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
            toast.error('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`${API}/reports/statistics/export`, {
                params: {
                    year: selectedYear,
                    dimension: statDimension,
                    region: selectedRegion,
                    category_id: selectedCategory
                },
                responseType: 'blob' // Important for handling binary/file data
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `statistics_${selectedYear}_${statDimension}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Statistics exported successfully");
        } catch (error) {
            console.error('Failed to export:', error);
            toast.error('Failed to export statistics');
        }
    };

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Report Statistics</h1>
                    <p className="text-muted-foreground">Analyze user report submissions</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* Dimension Toggle */}
                    <div className="flex items-center space-x-2 bg-secondary/50 p-1 rounded-lg border border-border">
                        <Button
                            variant={statDimension === 'user' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setDimensionAndClearCategory('user')}
                            className={statDimension === 'user' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}
                        >
                            By User
                        </Button>
                        <Button
                            variant={statDimension === 'site' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setDimensionAndClearCategory('site')}
                            className={statDimension === 'site' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}
                        >
                            By Site
                        </Button>
                        <Button
                            variant={statDimension === 'category' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setDimensionAndClearCategory('category')}
                            className={statDimension === 'category' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}
                        >
                            By Category
                        </Button>
                        <Button
                            variant={statDimension === 'leaderboard' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setDimensionAndClearCategory('leaderboard')}
                            className={statDimension === 'leaderboard' ? 'bg-yellow-500 text-black' : 'text-muted-foreground hover:bg-secondary'}
                        >
                            <Star size={14} className="mr-1" />
                            Leaderboard
                        </Button>
                    </div>

                    {/* Chart Type Toggle */}
                    <div className="flex items-center space-x-2 bg-secondary/50 p-1 rounded-lg border border-border">
                        <Button
                            variant={chartType === 'pie' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setChartType('pie')}
                            className={chartType === 'pie' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}
                        >
                            <PieChartIcon size={16} className="mr-2" />
                            Pie
                        </Button>
                        <Button
                            variant={chartType === 'bar' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setChartType('bar')}
                            className={chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}
                        >
                            <BarChartIcon size={16} className="mr-2" />
                            Bar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Minimalist Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-center gap-4 py-4 overflow-x-auto w-full">
                {/* View Type Toggle */}
                <div className="flex items-center bg-secondary/50 p-1 rounded-lg border border-border">
                    <button
                        onClick={() => setViewType('monthly')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewType === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setViewType('annual')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewType === 'annual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Annual
                    </button>
                </div>

                {/* Region Select */}
                <div className="w-[150px]">
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="bg-transparent border-input hover:bg-accent">
                            <SelectValue placeholder="All Regions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            <SelectItem value="Region 1">Region 1</SelectItem>
                            <SelectItem value="Region 2">Region 2</SelectItem>
                            <SelectItem value="Region 3">Region 3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Month Select - Only show if Monthly */}
                {viewType === 'monthly' && (
                    <div className="w-[160px]">
                        <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                            <SelectTrigger className="bg-transparent border-input hover:bg-accent">
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(m => (
                                    <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>

                        </Select>
                    </div>
                )}

                {/* Year Select */}
                <div className="w-[180px]">
                    <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                        <SelectTrigger className="bg-transparent border-input hover:bg-accent">
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Category Select */}
                <div className="w-[240px]">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="bg-transparent border-input hover:bg-accent">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Export Button - Only show if Annual */}
                {viewType === 'annual' && (
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="ml-auto border-green-800 text-green-500 hover:bg-green-900/20 hover:text-green-400"
                    >
                        <Download size={16} className="mr-2" />
                        Export CSV
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">
                            {statDimension === 'leaderboard' ? (
                                <span className="flex items-center gap-2"><Trophy size={18} className="text-yellow-400" /> Performance Leaderboard</span>
                            ) : (
                                `Reports by ${statDimension === 'user' ? 'User' : statDimension === 'site' ? 'Site' : 'Category'}`
                            )}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {statDimension === 'leaderboard'
                                ? `Ranked by average final score (${viewType === 'monthly' ? months.find(m => m.value === selectedMonth)?.label + ' ' + selectedYear : selectedYear})`
                                : `Showing report submission counts for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}
                            ${selectedCategory !== "all" ? ` • Category: ${categories.find(c => c.id === selectedCategory)?.name || 'Unknown'}` : ''}`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[450px] flex justify-center items-center">
                        {loading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : stats.length === 0 ? (
                            <div className="text-muted-foreground">No data available for this period</div>
                        ) : statDimension === 'leaderboard' ? (
                            /* LEADERBOARD VIEW */
                            <div className="w-full h-full overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                {stats.map((entry, index) => (
                                    <div key={entry.user_id || index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                                    index === 1 ? 'bg-slate-300/20 text-slate-400 border border-slate-300/50' :
                                                        index === 2 ? 'bg-orange-600/20 text-orange-500 border border-orange-500/50' :
                                                            'bg-secondary text-muted-foreground'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{entry.user_name}</p>
                                                {entry.division && <p className="text-xs text-muted-foreground">{entry.division}{entry.region ? ` • ${entry.region}` : ''}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={14} className={s <= Math.round(entry.avg_score) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'} />
                                                ))}
                                            </div>
                                            <span className="text-lg font-bold text-yellow-400 min-w-[36px] text-right">{entry.avg_score?.toFixed(1)}</span>
                                            <span className="text-xs text-muted-foreground">({entry.report_count} rpt{entry.report_count !== 1 ? 's' : ''})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={400} minWidth={300} minHeight={300}>
                                {chartType === 'pie' ? (
                                    <PieChart>
                                        <Pie
                                            data={stats}
                                            cx="50%"
                                            cy="45%"
                                            labelLine={false}
                                            label={false}
                                            outerRadius={120}
                                            innerRadius={60}
                                            paddingAngle={5}
                                            minAngle={3}
                                            dataKey="value"
                                            stroke="hsl(var(--background))"
                                            strokeWidth={2}
                                        >
                                            {stats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                    </PieChart>
                                ) : (
                                    <BarChart
                                        data={stats}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 60,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="hsl(var(--muted-foreground))"
                                            angle={-45}
                                            textAnchor="end"
                                            interval={0}
                                            height={60}
                                        />
                                        <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Bar dataKey="value" name="Reports" radius={[4, 4, 0, 0]}>
                                            {stats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Top 5 / Leaderboard Top 5 Section */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center justify-between">
                            {statDimension === 'leaderboard' ? 'Top Performers' : `Top 5 ${statDimension === 'user' ? 'Reporters' : statDimension === 'site' ? 'Sites' : 'Categories'}`}
                            <span className="text-xs font-normal text-muted-foreground">This Period</span>
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {statDimension === 'leaderboard' ? 'Highest rated report authors' : 'Most active contributors'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : stats.length === 0 ? (
                            <p className="text-muted-foreground text-center py-10">No rankings available</p>
                        ) : statDimension === 'leaderboard' ? (
                            <div className="space-y-4">
                                {stats.slice(0, 5).map((entry, index) => (
                                    <div key={entry.user_id || index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                                                    index === 1 ? 'bg-slate-300/20 text-slate-500 border border-slate-300/50' :
                                                        index === 2 ? 'bg-orange-600/20 text-orange-600 border border-orange-600/50' :
                                                            'bg-secondary text-muted-foreground'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-foreground">{entry.user_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-lg font-bold text-yellow-400">{entry.avg_score?.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {[...stats].sort((a, b) => b.value - a.value).slice(0, 5).map((user, index) => (
                                    <div key={user.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                                                index === 1 ? 'bg-slate-300/20 text-slate-500 border border-slate-300/50' :
                                                    index === 2 ? 'bg-orange-600/20 text-orange-600 border border-orange-600/50' :
                                                        'bg-secondary text-muted-foreground'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-foreground">{user.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-lg font-bold text-foreground">{user.value}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">Reports</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
};

export default Statistics;
