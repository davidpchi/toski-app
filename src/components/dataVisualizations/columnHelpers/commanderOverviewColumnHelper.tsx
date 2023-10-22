import { Box, Flex, Image } from "@chakra-ui/react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { commanderList } from "../../../services/commanderList";
import { Commander } from "../../../types/domain/Commander";

const columnHelper = createColumnHelper<Commander>();

export const commanderOverviewColumns: ColumnDef<Commander, any>[] = [
    columnHelper.accessor((row) => row.name, {
        id: "name",
        cell: (info) => {
            const commander = info.getValue();
            const commanderImage = commanderList[commander]
                ? commanderList[commander].image.replace("normal", "art_crop")
                : "";

            return (
                <Flex direction={"row"} alignItems={"center"}>
                    <Image src={commanderImage} width={20} borderRadius={8} />
                    <Box padding="2">{commander}</Box>
                </Flex>
            );
        },
        header: () => <span>Name</span>
    }),
    columnHelper.accessor((row) => row.validMatchesCount, {
        id: "gameCount",
        cell: (info) => info.row.original.validMatchesCount,
        header: () => <span>Game Count</span>
    }),
    columnHelper.accessor((row) => row.wins, {
        id: "wins",
        cell: (info) => info.row.original.wins,
        header: () => <span>Wins</span>
    }),
    columnHelper.accessor((row) => (row.validMatchesCount > 0 ? Math.round((row.wins / row.validMatchesCount) * 100) : 0), {
        id: "winrate",
        cell: (info) =>
            info.row.original.validMatchesCount > 0
                ? `${Math.round((info.row.original.wins / info.row.original.validMatchesCount) * 100)}%`
                : `N/A`,
        header: () => <span>Winrate</span>
    })
];
