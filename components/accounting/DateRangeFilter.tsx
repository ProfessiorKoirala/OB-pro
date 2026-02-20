import React from 'react';

interface DateRangeFilterProps {
    startDate: string;
    endDate: string;
    onFilterChange: (startDate: string, endDate: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ startDate, endDate, onFilterChange }) => {
    return (
        <div className="bg-white p-4 rounded-lg my-4 border shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Select Date Range</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1">From</label>
                    <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={e => onFilterChange(e.target.value, endDate)}
                        className="bg-gray-100 p-2 rounded-lg text-sm w-full focus:ring-primary focus:border-primary border-gray-200"
                        style={{ colorScheme: 'light' }}
                    />
                </div>
                <div className="hidden sm:block text-gray-500 font-semibold text-sm pt-5">to</div>
                <div className="flex-1">
                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1">To</label>
                    <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={e => onFilterChange(startDate, e.target.value)}
                        className="bg-gray-100 p-2 rounded-lg text-sm w-full focus:ring-primary focus:border-primary border-gray-200"
                        style={{ colorScheme: 'light' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DateRangeFilter;