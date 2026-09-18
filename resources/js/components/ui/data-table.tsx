import {
    tableFeatures,
    useTable,
    type ColumnDef,
    type RowData,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export const dataTableFeatures = tableFeatures({});
export type DataTableFeatures = typeof dataTableFeatures;

type DataTableProps<TData extends RowData> = {
    columns: ColumnDef<DataTableFeatures, TData, any>[];
    data: TData[];
    emptyMessage: string;
    getRowId: (row: TData) => string;
    getRowTestId?: (row: TData) => string;
};

export function DataTable<TData extends RowData>({
    columns,
    data,
    emptyMessage,
    getRowId,
    getRowTestId,
}: DataTableProps<TData>) {
    const table = useTable({
        features: dataTableFeatures,
        columns,
        data,
        getRowId: (row) => getRowId(row),
    });

    const rows = table.getRowModel().rows;

    return (
        <div className="overflow-hidden rounded-xl border">
            <Table>
                <TableHeader className="bg-muted/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="px-4 py-3">
                                    {header.isPlaceholder ? null : (
                                        <table.FlexRender header={header} />
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {rows.length > 0 ? (
                        rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-test={getRowTestId?.(row.original)}
                            >
                                {row.getAllCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-4 py-3">
                                        <table.FlexRender cell={cell} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={table.getAllLeafColumns().length}
                                className="text-muted-foreground h-24 px-4 text-center"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
