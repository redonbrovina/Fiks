import { useState } from 'react';

/**
 * Reusable User Table Component
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions { key, label, render? }
 * @param {Array} props.data - Array of row data objects
 * @param {Function} props.onAction - Optional action handler (row) => void
 * @param {string} props.actionLabel - Label for the action button
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 */
export default function UserTable({
    columns = [],
    data = [],
    onAction,
    actionLabel = "View",
    searchPlaceholder = "Kërko..."
}) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter data based on search term
    const filteredData = data.filter(row =>
        columns.some(col => {
            const value = row[col.key];
            if (typeof value === 'string') {
                return value.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
        })
    );

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C00F0C]/20 focus:border-[#C00F0C]/20 transition-all duration-300"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider"
                                >
                                    {col.label}
                                </th>
                            ))}
                            {onAction && (
                                <th className="text-right px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Veprimi
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (onAction ? 1 : 0)}
                                    className="text-center py-8 text-gray-500 font-medium"
                                >
                                    Nuk u gjetën rezultate.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors duration-200"
                                >
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-4 text-sm text-gray-700 font-medium">
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {onAction && (
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => onAction(row)}
                                                className="px-4 py-2 text-xs font-bold text-[#C00F0C] bg-[#C00F0C]/10 hover:bg-[#C00F0C] hover:text-white rounded-lg transition-all duration-300"
                                            >
                                                {actionLabel}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer with count */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                    Duke shfaqur {filteredData.length} nga {data.length} rezultate
                </span>
            </div>
        </div>
    );
}
