import { TooltipItem } from "chart.js";
import React from "react";
import { Flex, Heading, Text } from "@chakra-ui/react";

import { Loading } from "../Loading";
import { Match } from "../../types/domain/Match";
import { BarGraph } from "../dataVisualizations/BarGraph";
import { NUMBER_OF_PLAYERS_FOR_VALID_MATCH } from "../constants";
import { filterMatchesByPlayerCount } from "../../logic/dictionaryUtils";

export const MatchPlacementBarChart = React.memo(function MatchPlacementBarChart({
    matches,
    commanderName
}: {
    matches: Match[];
    commanderName: string;
}) {
    if (matches === undefined) {
        return <Loading text="" />;
    }
    const matchPlacementDictionary: { [rank: string]: number } = {};
    const validMatches = filterMatchesByPlayerCount(matches, NUMBER_OF_PLAYERS_FOR_VALID_MATCH);

    if (validMatches.length === 0) {
        return <Text textAlign={"center"}>No valid matches</Text>;
    }

    for (const match of validMatches) {
        for (const player of match.players) {
            for (const commander of player.commanders) {
                if (commander === commanderName) {
                    if (matchPlacementDictionary[player.rank] === undefined) {
                        matchPlacementDictionary[player.rank] = 1;
                    } else {
                        matchPlacementDictionary[player.rank] += 1;
                    }
                }
            }
        }
    }

    const matchPlacementData = Object.keys(matchPlacementDictionary).map((rank: string) => {
        return { x: Number(rank), y: matchPlacementDictionary[rank] };
    });
    
    const matchPlacementMaxY = Math.max(...matchPlacementData.map(height => height.y)); // Finds the tallest column

    const tooltipTitleCallback = (item: TooltipItem<"bar">[]) => {
        return `Games placed in rank ${matchPlacementData[item[0].dataIndex].x}: ${
            matchPlacementData[item[0].dataIndex].y
        }`;
    };
    const tooltipLabelCallback = (_item: TooltipItem<"bar">) => {
        return ``;
    };

    return (
        <Flex flexDirection={"column"} justifyContent={"center"} alignItems={"center"} padding="8px">
            <Heading size="md">Match Placements</Heading>
            <BarGraph
                dataLabel={"Match Placement Count"}
                data={matchPlacementData}
                tooltipTitleCallback={tooltipTitleCallback}
                tooltipLabelCallback={tooltipLabelCallback}
                maxY={matchPlacementMaxY + 5}
            />
        </Flex>
    );
});
