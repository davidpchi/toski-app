import axios from "axios";

import { useQuery } from "@tanstack/react-query";
import { Match } from "../types/domain/Match";
import { sheetRowToMatch } from "../types/service/MatchHistory/dataMappers";
import { sendDataToGoogleSheets } from "./GoogleFormsService";

const matchHistoryDataEndpoint =
    "https://docs.google.com/spreadsheets/d/1FsjnGp3JPsqAEmlyWlxmYK5pSwGASqfIcDl9HvD-fuk/gviz/tq?gid=1885300192";
const matchHistorySubmitEndpoint =
    "https://docs.google.com/forms/d/e/1FAIpQLScguPsS2TOxaABYLtbCDZ5zPXec2av9AI2kPI2JFwYqmghBYQ/formResponse";

const fetchMatchHistory = async () => {
    return await axios.get<string>(matchHistoryDataEndpoint, {})
        .then((res) => {
            // strip out the setResponse text from the data
            let raw: string = res.data;
            const startText = ".setResponse(";
            raw = raw.substring(raw.indexOf(startText) + startText.length);
            raw = raw.substring(0, raw.length - 2);
            const resultObj = JSON.parse(raw);
            return mapObjectToMatches(resultObj);
        })
};

const useMatchHistory = <TData = Match[]>(select?: (data: Match[]) => TData) => {
    return useQuery({
        queryKey: ['matches'],
        queryFn: fetchMatchHistory,
        select: select,
    })
};

function mapObjectToMatches(resultObj: any): Match[] {
    const matches: Match[] = [];

    for (let i = 0; i < resultObj.table.rows.length; i++) {
        const cell = resultObj.table.rows[i];
        const match = sheetRowToMatch(cell, i.toString());
        matches.push(match);
    }

    return matches;
};

export type MatchSubmissionPlayer = {
    name: string;
    commander: string;
    turnOrder: number;
    rank: number;
};

export const submitMatch = async (
    date: Date,
    player1?: MatchSubmissionPlayer,
    player2?: MatchSubmissionPlayer,
    player3?: MatchSubmissionPlayer,
    player4?: MatchSubmissionPlayer,
    turnCount?: number,
    extraNotes?: string,
    firstKOTurn?: number,
    timeLength?: number
) => {
    const formData: { [fieldName: string]: string } = {};
    formData["1178471159"] = date.toISOString().split("T")[0];

    if (player1) {
        formData["2132042053"] = player1.name;
        formData["961836116"] = player1.commander;
        formData["1252336227"] = player1.turnOrder.toString();
        formData["147625596"] = player1.rank.toString();
    }

    if (player2) {
        formData["840407098"] = player2.name;
        formData["493870522"] = player2.commander;
        formData["898724110"] = player2.turnOrder.toString();
        formData["531480374"] = player2.rank.toString();
    }

    if (player3) {
        formData["2099339267"] = player3.name;
        formData["1961193649"] = player3.commander;
        formData["87571757"] = player3.turnOrder.toString();
        formData["807216034"] = player3.rank.toString();
    }

    if (player4) {
        formData["575868019"] = player4.name;
        formData["270994715"] = player4.commander;
        formData["153957972"] = player4.turnOrder.toString();
        formData["652184592"] = player4.rank.toString();
    }

    formData["676929187"] = turnCount !== undefined ? turnCount.toString() : "";

    formData["2043626966"] = extraNotes !== undefined ? extraNotes : "";

    formData["1755577221"] = firstKOTurn !== undefined ? firstKOTurn.toString() : "";

    formData["861944794"] = timeLength !== undefined ? timeLength.toString() : "";

    // This is all super hacky to begin so bear with me here...
    // We are able to directly submit to the google form via a URL and POST. No auth needed since this a public form.
    // This is pretty fragile because if any of the above fields have their IDs change or are deleted
    // this will result in a 400.

    // TODO: need to figure out why we are running into CORs on local host.
    return sendDataToGoogleSheets({ formData, submitEndpoint: matchHistorySubmitEndpoint });
};

export const MatchHistoryService = {
    useMatchHistory,
    submitMatch
};
