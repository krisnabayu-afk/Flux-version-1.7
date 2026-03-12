import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import moment from 'moment';

export const CustomToolbar = ({ date, onNavigate, onView, view }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(moment(date).year());
  const [selectedMonth, setSelectedMonth] = useState(moment(date).month());

  const goToBack = () => {
    onNavigate('PREV');
  };

  const goToNext = () => {
    onNavigate('NEXT');
  };

  const goToToday = () => {
    onNavigate('TODAY');
  };

  const handleMonthYearClick = () => {
    setSelectedYear(moment(date).year());
    setSelectedMonth(moment(date).month());
    setShowDatePicker(!showDatePicker);
  };

  const handleDateSelect = () => {
    const newDate = moment().year(selectedYear).month(selectedMonth).toDate();
    onNavigate('DATE', newDate);
    setShowDatePicker(false);
  };

  const months = moment.months();
  const currentYear = moment().year();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="rbc-toolbar flex flex-col md:flex-row gap-4 mb-4 !h-auto">
      <span className="rbc-btn-group w-full md:w-auto flex justify-center">
        <button type="button" onClick={goToToday}>Today</button>
        <button type="button" onClick={goToBack}>Back</button>
        <button type="button" onClick={goToNext}>Next</button>
      </span>
      <span className="rbc-toolbar-label relative w-full md:w-auto text-center py-2 md:py-0">
        <button
          type="button"
          onClick={handleMonthYearClick}
          className="font-bold text-lg hover:text-gray-400 transition-colors cursor-pointer bg-transparent border-0 px-4 py-2"
        >
          {moment(date).format('MMMM YYYY')}
        </button>
        {showDatePicker && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-4 z-50 min-w-[300px]">
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Month</Label>
                <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                  <SelectTrigger className="w-full [&>svg]:hidden">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Year</Label>
                <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                  <SelectTrigger className="w-full [&>svg]:hidden">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleDateSelect}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                  size="sm"
                >
                  Go
                </Button>
                <Button
                  onClick={() => setShowDatePicker(false)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </span>
      <span className="rbc-btn-group w-full md:w-auto flex justify-center">
        <button type="button" onClick={() => onView('month')} className={view === 'month' ? 'rbc-active' : ''}>
          Month
        </button>
        <button type="button" onClick={() => onView('week')} className={view === 'week' ? 'rbc-active' : ''}>
          Week
        </button>
        <button type="button" onClick={() => onView('day')} className={view === 'day' ? 'rbc-active' : ''}>
          Day
        </button>
      </span>
    </div>
  );
};
