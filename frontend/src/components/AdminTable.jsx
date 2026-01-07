import { useState } from 'react';

/**
 * Reusable Admin Table Component
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions { key, label, render? }
 * @param {Array} props.data - Array of row data objects
 * @param {Function} props.onEdit - Optional edit handler (row) => void
 * @param {Function} props.onDelete - Optional delete handler (row) => void
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 */
export default function AdminTable({
    columns = [],
    data = [],
    onEdit,
    onDelete,
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
        <div className="bg-[#3a3a3a] rounded-[2rem] p-6 shadow-lg border border-white/5">
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40"
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
                        className="w-full pl-12 pr-4 py-3 bg-[#2d2d2d] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C00F0C]/50 transition-all duration-300"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="text-left px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider"
                                >
                                    {col.label}
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th className="text-right px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">
                                    Veprimet
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                                    className="text-center py-8 text-white/40"
                                >
                                    Nuk u gjetën rezultate.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                                >
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-4 text-sm text-white/80">
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(row)}
                                                        className="p-2 text-white/60 hover:text-[#C00F0C] hover:bg-white/10 rounded-lg transition-all duration-200"
                                                        title="Redakto"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(row)}
                                                        className="p-2 text-white/60 hover:text-red-500 hover:bg-white/10 rounded-lg transition-all duration-200"
                                                        title="Fshi"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer with count */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/40">
                    Duke shfaqur {filteredData.length} nga {data.length} rezultate
                </span>
            </div>
        </div>
    );
}
