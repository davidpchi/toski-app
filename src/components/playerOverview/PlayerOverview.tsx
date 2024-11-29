import { Box, Checkbox, Flex, Input, Tooltip } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { matchesToPlayersHelper } from "../../logic/dictionaryUtils";
import { useTableFilters } from "../../logic/hooks/tableHooks";
import { MatchHistoryService } from "../../services/MatchHistoryService";
import { Match } from "../../types/domain/Match";
import { Player } from "../../types/domain/Player";
import { Error } from "../Error";
import { Loading } from "../Loading";
import { DatePicker } from "../common/DatePicker";
import { PLAYER_MINIMUM_GAMES_REQUIRED } from "../constants";
import { SortableTable } from "../dataVisualizations/SortableTable";
import { playerOverviewColumns } from "../dataVisualizations/columnHelpers/playerOverviewColumnHelper";

/**
 * Component showing all the players in a big list
 */
export const PlayerOverview = React.memo(function MatchHistory() {
    const navigate = useNavigate();

    const { dateFilter, showOnlyQualfied, searchInput, onDatePickerChange, onShowOnlyQualifiedChange, onSearchChange } =
        useTableFilters();

    const selectPlayersByDate = useCallback(
        (matches: Match[]) => Object.values(matchesToPlayersHelper(matches, undefined, dateFilter)),
        []
    );
    const {data, isPending, isError} = MatchHistoryService.useMatchHistory(selectPlayersByDate);

    const filterPlayers = (players: Player[]) => {
        return players?.filter(p => showOnlyQualfied ? p.validMatchesCount >= PLAYER_MINIMUM_GAMES_REQUIRED : true)
            .filter(p => searchInput ? p.name.toLowerCase().includes(searchInput.toLowerCase()) : true)
    }
    
    if (isPending) {
        return <Loading text="" />;
    } else if (isError) {
        return <Error error="" />
    }

    return (
        <Flex direction="column" justify="center" align="center">
            <Flex
                alignSelf={"center"}
                marginBottom={"16px"}
                alignItems={"center"}
                flexWrap={"wrap"}
                justifyContent={"center"}
            >
                <DatePicker onChange={onDatePickerChange} value={dateFilter} />
                <Tooltip
                    label={<p style={{ textAlign: "center" }}>Players play 10 games to be qualified.</p>}
                    hasArrow
                    arrowSize={15}
                >
                    <Box padding={"8px"}>
                        <Checkbox isChecked={showOnlyQualfied} onChange={onShowOnlyQualifiedChange}>
                            {"Show only qualified"}
                        </Checkbox>
                    </Box>
                </Tooltip>
                <Box padding={"8px"}>
                    <Input placeholder="Filter by..." onChange={onSearchChange} value={searchInput} />
                </Box>
            </Flex>
            <SortableTable
                columns={playerOverviewColumns}
                data={filterPlayers(data)}
                defaultSort={[{id: 'name', desc: false}]}
                getRowProps={(row: any) => {
                    return {
                        onClick: () => {
                            navigate(`/playerOverview/${row.original.name}`);
                            window.scrollTo(0, 0);
                        }
                    };
                }}
            />
        </Flex>
    );
});
