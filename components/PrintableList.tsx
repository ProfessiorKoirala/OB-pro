import React from 'react';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    align?: 'left' | 'center' | 'right';
}

interface PrintableListProps<T> {
    columns: Column<T>[];
    data: T[];
}

const PrintableList = <T,>({ columns, data }: PrintableListProps<T>) => {
    const getValue = (item: T, accessor: Column<T>['accessor']) => {
        if (typeof accessor === 'function') {
            return accessor(item);
        }
        return item[accessor as keyof T] as React.ReactNode;
    };
    
    return (
        <table>
            <thead>
                <tr>
                    {columns.map((col, index) => (
                        <th key={index} style={{ textAlign: col.align || 'left' }}>{col.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                            <td key={colIndex} style={{ textAlign: col.align || 'left' }}>
                                {getValue(item, col.accessor)}
                            </td>
                        ))}
                    </tr>
                ))}
                {data.length === 0 && (
                    <tr>
                        <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                            No data available.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default PrintableList;