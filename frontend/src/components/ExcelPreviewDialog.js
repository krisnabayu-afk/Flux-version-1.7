import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Download, X, Loader2, Table2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const ExcelPreviewDialog = ({ open, onOpenChange, fileUrl, fileName, downloadFile }) => {
    const [data, setData] = useState({}); // { sheetName: [ { row: data }, ... ] }
    const [sheetNames, setSheetNames] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open || !fileUrl) {
            setData({});
            setSheetNames([]);
            setActiveTab(null);
            setError(null);
            return;
        }

        const fetchExcel = async () => {
            setLoading(true);
            setError(null);
            try {
                const fullUrl = `${process.env.REACT_APP_API_URL || ''}${fileUrl}`;
                const response = await fetch(fullUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();

                // Parse the excel file
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                const sheetDataMap = {};
                const names = workbook.SheetNames;

                for (const sheetName of names) {
                    const worksheet = workbook.Sheets[sheetName];
                    // Convert sheet to json array of arrays to preserve table structure easily
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    sheetDataMap[sheetName] = json;
                }

                setData(sheetDataMap);
                setSheetNames(names);
                if (names.length > 0) {
                    setActiveTab(names[0]);
                }
            } catch (err) {
                console.error("Error reading excel file:", err);
                setError("Failed to load Excel file for preview.");
            } finally {
                setLoading(false);
            }
        };

        fetchExcel();
    }, [open, fileUrl]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 bg-slate-950 border-slate-800 [&>button]:hidden text-slate-200" data-testid="excel-preview-dialog" onCloseAutoFocus={(e) => e.preventDefault()}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Table2 size={20} className="text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-200">{fileName}</h3>
                            <p className="text-xs text-slate-500">Excel Preview</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadFile}
                            className="gap-2"
                        >
                            <Download size={14} />
                            Download
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                            <X size={20} />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-slate-900 relative flex flex-col overflow-hidden">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 backdrop-blur-sm z-50">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <h3 className="text-xl font-medium text-slate-200 mb-2">Loading Excel File...</h3>
                            <p className="text-slate-400 text-sm max-w-sm">
                                Parsing spreadsheet data, please wait.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="p-4 bg-red-500/10 rounded-full mb-4">
                                <X className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-medium text-slate-200 mb-2">Preview Failed</h3>
                            <p className="text-slate-400 text-sm max-w-sm">{error}</p>
                        </div>
                    ) : (
                        <>
                            {sheetNames.length > 1 && (
                                <div className="flex border-b border-slate-800 bg-slate-900/80 px-2 pt-2 gap-1 overflow-x-auto custom-scrollbar">
                                    {sheetNames.map((name) => (
                                        <button
                                            key={name}
                                            onClick={() => setActiveTab(name)}
                                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap outline-none focus:ring-2 focus:ring-primary ${activeTab === name
                                                    ? 'bg-slate-800 text-slate-100 border-t border-x border-slate-700'
                                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                                }`}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex-1 overflow-auto bg-slate-950 p-4 custom-scrollbar">
                                {activeTab && data[activeTab] && (
                                    <div className="max-w-full overflow-x-auto pb-4 border rounded-md shadow-sm border-slate-800 inline-block min-w-full">
                                        <table className="min-w-full border-collapse text-sm text-left whitespace-nowrap bg-slate-900">
                                            <tbody>
                                                {data[activeTab].map((row, rowIndex) => {
                                                    // Find total columns in this row, to render cells properly
                                                    const colCount = Math.max(...data[activeTab].map(r => r.length));
                                                    // Create an array for columns up to colCount
                                                    const rowCells = Array.from({ length: colCount }).map((_, i) => row[i]);

                                                    return (
                                                        <tr key={rowIndex} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                                            {rowCells.map((cell, colIndex) => (
                                                                <td
                                                                    key={colIndex}
                                                                    className={`px-4 py-2 border-r border-slate-800 last:border-r-0 ${rowIndex === 0 ? 'font-semibold bg-slate-800/30' : ''}`}
                                                                >
                                                                    {cell !== undefined && cell !== null ? String(cell) : ''}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {data[activeTab].length === 0 && (
                                            <div className="py-8 text-center text-slate-500">
                                                This sheet is empty.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ExcelPreviewDialog;
