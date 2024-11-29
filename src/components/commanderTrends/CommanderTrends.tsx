import { Checkbox, Flex, Heading } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { matchesToCommanderHelper } from "../../logic/dictionaryUtils";
import { MatchHistoryService } from "../../services/MatchHistoryService";
import { Match } from "../../types/domain/Match";
import { MTG_COLORS, MTG_COLOR_IDENTITIES } from "../constants";
import { PieGraph } from "../dataVisualizations/PieGraph";
import { Error } from "../Error";
import { Loading } from "../Loading";
import { CommandersPlayedChart } from "./CommandersPlayedChart";

export const CommanderTrends = React.memo(function CommanderTrends() {
    const [showAdvancedColorChart, setShowAdvancedColorChart] = useState(false);
    const toggleAdvancedColorChart = () => {
        setShowAdvancedColorChart(!showAdvancedColorChart);
    };

    const selectCommanderTrends = useCallback((matches: Match[]) => {
        const commanders = Object.values(matchesToCommanderHelper(matches));
        const colorsPlayedDictionary: Record<string, number> = MTG_COLORS.reduce<Record<string, number>>((acc, color) => {
            acc[color.id] = 0;
            return acc;
        }, {});
        const colorIdentitiesPlayedDictionary: Record<string, number> = MTG_COLOR_IDENTITIES.reduce<Record<string, number>>(
            (acc, color) => {
                acc[color.id] = 0;
                return acc;
            }, {});
        for (const commander of commanders) {
            for (const colorID of commander.colorIdentity) {
                colorsPlayedDictionary[colorID]++;
            }

            colorIdentitiesPlayedDictionary[commander.colorIdentityName]++;
        }

        // Create colors played array
        let colorsPlayedArray: { name: string; value: number; color: string }[] = [];
        for (const colorObj of MTG_COLORS) {
            const count = colorsPlayedDictionary[colorObj.id];

            if (count > 0) {
                colorsPlayedArray.push({
                    name: colorObj.name,
                    value: colorsPlayedDictionary[colorObj.id],
                    color: colorObj.rgb
                });
            }
        }

        colorsPlayedArray = colorsPlayedArray.sort((a, b) => b.value - a.value);

        // Create color identities played array
        let colorIdentitiesPlayedArray: { name: string; value: number; color: string }[] = [];
        for (const colorObj of MTG_COLOR_IDENTITIES) {
            const count = colorIdentitiesPlayedDictionary[colorObj.id];
            if (count > 0) {
                colorIdentitiesPlayedArray.push({
                    name: colorObj.name,
                    value: colorIdentitiesPlayedDictionary[colorObj.id],
                    color: colorObj.rgb
                });
            }
        }
        return {
            colorsPlayedArray,
            colorIdentitiesPlayedArray
        }
    }, []);

    const { data, isPending, isError } = MatchHistoryService.useMatchHistory(selectCommanderTrends);

    if (isPending) {
        return <Loading text="" />;
    } else if (isError) {
        return <Error error="" />
    }

    return (
        <Flex direction="column" justify="center" align="center">
            <Heading size="md">Commander Colors Played</Heading>
            <Flex maxWidth={"750px"} justifyContent={"center"} alignItems={"center"}>
                {!showAdvancedColorChart ? (
                    <PieGraph
                        dataLabel={"Commanders played"}
                        data={data.colorsPlayedArray}
                        backgroundColors={data.colorsPlayedArray.map((item) => item.color)}
                        showLegend={true}
                        maxDimension={350}
                    />
                ) : (
                    <PieGraph
                        dataLabel={"Commanders played"}
                        data={data.colorIdentitiesPlayedArray}
                        backgroundColors={data.colorIdentitiesPlayedArray.map((item) => item.color)}
                        showLegend={true}
                        maxDimension={350}
                    />
                )}
            </Flex>
            <Checkbox isChecked={showAdvancedColorChart} onChange={toggleAdvancedColorChart} marginTop={"16px"}>
                {"Show Advanced Color Chart"}
            </Checkbox>
            <CommandersPlayedChart />
        </Flex>
    );
});
