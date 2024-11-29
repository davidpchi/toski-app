import { TooltipItem } from "chart.js";
import React from "react";
import { Heading } from "@chakra-ui/react";

import { Match } from "../../types/domain/Match";
import { BarGraph } from "../dataVisualizations/BarGraph";

export const MatchLengthBarChart = React.memo(function MatchHistory({ matches }: { matches: Match[] }) {
    const matchesWithLengths = matches.filter((match: Match) => match.numberOfTurns);

    const matchesLengthDictionary: { [numberOfTurns: string]: number } = {};

    for (const match of matchesWithLengths) {
        if (match.numberOfTurns) {
            if (matchesLengthDictionary[match.numberOfTurns] === undefined) {
                matchesLengthDictionary[match.numberOfTurns] = 1;
            } else {
                matchesLengthDictionary[match.numberOfTurns] += 1;
            }
        }
    }

    const matchesWithLengthsData = Object.keys(matchesLengthDictionary).map((numberOfTurns: string) => {
        return { x: Number(numberOfTurns), y: matchesLengthDictionary[numberOfTurns] };
    });

    const matchLengthsMaxY = Math.max(...matchesWithLengthsData.map(height => height.y)); // Finds the tallest column

    const tooltipTitleCallback = (item: TooltipItem<"bar">[]) => {
        return `Games with ${matchesWithLengthsData[item[0].dataIndex].x} turns: ${
            matchesWithLengthsData[item[0].dataIndex].y
        }`;
    };
    const tooltipLabelCallback = (_item: TooltipItem<"bar">) => {
        return ``;
    };

    return (
        <>
            <Heading size="md">Match Lengths</Heading>
            <BarGraph
                dataLabel={"Match Lengths"}
                data={matchesWithLengthsData}
                tooltipTitleCallback={tooltipTitleCallback}
                tooltipLabelCallback={tooltipLabelCallback}
                maxY={matchLengthsMaxY + 5}
            />
        </>
    );
});
