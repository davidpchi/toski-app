import { Flex } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { MatchHistoryService } from "../../services/MatchHistoryService";
import { Error } from "../Error";
import { Loading } from "../Loading";
import { SortableTable } from "../dataVisualizations/SortableTable";
import { matchHistoryColumns } from "../dataVisualizations/columnHelpers/matchHistoryColumnHelper";

export const MatchHistory = React.memo(function MatchHistory() {
    const navigate = useNavigate();
    const { data, isPending, isError } = MatchHistoryService.useMatchHistory();

    if (isPending) {
        return <Loading text="" />;
    } else if (isError) {
        return <Error error="" />
    }

    return (
        <Flex direction="column" justify="center" align="center">
            <SortableTable
                columns={matchHistoryColumns}
                data={data}
                defaultSort={[{ id: "id", desc: true }]}
                getRowProps={(row: any) => {
                    return {
                        onClick: () => {
                            navigate(`/matchHistory/${row.original.id}`);
                            window.scrollTo(0, 0);
                        }
                    };
                }}
            />
        </Flex>
    );
});
