import { Heading } from "@chakra-ui/react";
import { TooltipItem } from "chart.js";
import React, { useCallback } from "react";
import { MatchHistoryService } from "../../services/MatchHistoryService";
import { Match } from "../../types/domain/Match";
import { LineGraph } from "../dataVisualizations/LineGraph";
import { Error } from "../Error";
import { Loading } from "../Loading";

export const CommandersPlayedChart = React.memo(function CommandersPlayedChart() {
    const selectCommanderCounts = useCallback(
        (matches: Match[]) => {
            let commandersDictionary: { [id: string]: string } = {};
            return matches.map((match: Match, index: number) => {
                for (const player of match.players) {
                    for (const commander of player.commanders) {
                        commandersDictionary[commander] = commander;
                    }
                }
                return { x: Number(match.id) + 1, y: Object.values(commandersDictionary).length };
            });
        }, 
        []
    );
    const { data, isPending, isError } = MatchHistoryService.useMatchHistory(selectCommanderCounts);

    const tooltipTitleCallback = (item: TooltipItem<"line">[]) => {
        // TODO: should we be showing an actual match id here? even before the migration to react-query, this was only showing the dataindex value
        return `Match Id: ${item[0].dataIndex}`;
    };
    const tooltipLabelCallback = (item: TooltipItem<"line">) => {
        return `Commanders played: ${item.formattedValue}`;
    };

    if (isPending) {
        return <Loading text="" />;
    } else if (isError) {
        return <Error error="" />
    }

    return (
        <>
            <Heading size="md">Commanders Played</Heading>
            <LineGraph
                dataLabel={"Commanders Played"}
                data={data}
                allowTogglableDataPoints={true}
                tooltipTitleCallback={tooltipTitleCallback}
                tooltipLabelCallback={tooltipLabelCallback}
                minX={1}
                maxX={data.length}
            />
        </>
    );
});
