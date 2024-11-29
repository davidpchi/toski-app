import { Box, Checkbox, Flex, Input, Tooltip } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { matchesToCommanderHelper } from "../../logic/dictionaryUtils";
import { useTableFilters } from "../../logic/hooks/tableHooks";
import { MatchHistoryService } from "../../services/MatchHistoryService";
import { Commander } from "../../types/domain/Commander";
import { Match } from "../../types/domain/Match";
import { Error } from "../Error";
import { Loading } from "../Loading";
import { DatePicker } from "../common/DatePicker";
import { COMMANDER_MINIMUM_GAMES_REQUIRED } from "../constants";
import { SortableTable } from "../dataVisualizations/SortableTable";
import { commanderOverviewColumns } from "../dataVisualizations/columnHelpers/commanderOverviewColumnHelper";

export const CommanderOverview = React.memo(function MatchHistory() {
    const navigate = useNavigate();

    const { dateFilter, showOnlyQualfied, searchInput, onDatePickerChange, onShowOnlyQualifiedChange, onSearchChange } =
        useTableFilters();

    const selectCommandersByDate = React.useCallback(
        (matches: Match[]) => Object.values(matchesToCommanderHelper(matches, undefined, dateFilter)),
        []);
    const { data, isPending, isError } = MatchHistoryService.useMatchHistory(selectCommandersByDate);

    const filterCommanders = (commanders: Commander[]) => {
        return commanders?.filter(c => showOnlyQualfied ? c.validMatchesCount >= COMMANDER_MINIMUM_GAMES_REQUIRED : true)
            .filter(c => searchInput ? c.name.toLowerCase().includes(searchInput.toLowerCase()) : true)
    };

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
                    label={<p style={{ textAlign: "center" }}>Commanders play 5 games to be qualified.</p>}
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
                columns={commanderOverviewColumns}
                data={filterCommanders(data)}
                defaultSort={[{ id: "name", desc: false }]}
                getRowProps={(row: any) => {
                    return {
                        onClick: () => {
                            navigate(`/commanderOverview/${row.original.id}`);
                            window.scrollTo(0, 0);
                        }
                    };
                }}
            />
        </Flex>
    );
});
