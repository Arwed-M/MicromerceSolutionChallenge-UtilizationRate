import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { useMemo } from "react";
import sourceData from "./source-data.json";
import type { TableDataType } from "./types";

const formatUtilizationRate = (rate: string | undefined): string =>
  !rate || rate === "NaN" ? "-" : `${(parseFloat(rate) * 100).toFixed(0)}%`;

const formatEarnings = (amount: string | undefined): string =>
  !amount ? "-" : `${parseFloat(amount).toFixed(0)} EUR`;

const getMonthlyUtilizationRate = (data: any, month: string): string => {
  const lastThreeMonths = data?.workforceUtilisation?.lastThreeMonthsIndividually;
  if (!lastThreeMonths) return "-";

  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  const monthData = lastThreeMonths.find((m: any) => m.month === capitalizedMonth);
  return monthData ? formatUtilizationRate(monthData.utilisationRate) : "-";
};

const getNetEarningsPrevMonth = (data: any): string => {
  const monthlyCostDifference = data?.workforceUtilisation?.monthlyCostDifference;
  if (!monthlyCostDifference) return "-";

  const isExternal = data.hasOwnProperty('externals');
  const value = parseFloat(monthlyCostDifference);
  return isExternal ? formatEarnings(`-${Math.abs(value)}`) : formatEarnings(monthlyCostDifference);
};

const activePersons = sourceData.filter(
  (item: any) => item.employees?.status === "active" || item.externals?.status === "active"
);

const tableData: TableDataType[] = activePersons.map((dataRow) => {
  const personData = dataRow.employees || dataRow.externals;
  if (!personData) return {} as TableDataType;

  return {
    person: dataRow.hasOwnProperty('externals')
      ? `External ${personData.name}`
      : personData.name,
    past12Months: formatUtilizationRate(personData?.workforceUtilisation?.utilisationRateLastTwelveMonths),
    y2d: formatUtilizationRate(personData?.workforceUtilisation?.utilisationRateYearToDate),
    may: getMonthlyUtilizationRate(personData, "may"),
    june: getMonthlyUtilizationRate(personData, "june"),
    july: getMonthlyUtilizationRate(personData, "july"),
    netEarningsPrevMonth: getNetEarningsPrevMonth(personData),
  };
});

const Example = () => {
  const columns = useMemo<MRT_ColumnDef<TableDataType>[]>(
    () => [
      {
        accessorKey: "person",
        header: "Person",
      },
      {
        accessorKey: "past12Months",
        header: "Past 12 Months",
      },
      {
        accessorKey: "y2d",
        header: "Y2D",
      },
      {
        accessorKey: "may",
        header: "May",
      },
      {
        accessorKey: "june",
        header: "June",
      },
      {
        accessorKey: "july",
        header: "July",
      },
      {
        accessorKey: "netEarningsPrevMonth",
        header: "Net Earnings Prev Month",
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
  });

  return <MaterialReactTable table={table} />;
};

export default Example;
