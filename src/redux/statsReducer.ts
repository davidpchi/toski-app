import { createReducer } from "@reduxjs/toolkit";
import { Match } from "../types/domain/Match";
import { StatsAction } from "./statsActions";
import { Commander } from "../types/domain/Commander";
import { commanderList } from "../services/commanderList";

/**
 * State containing all game history data
 */
export type StatsState = Readonly<{
    matches: Match[] | undefined;
    commanders: { [id: string]: Commander } | undefined;
}>;

const initialState: StatsState = {
    matches: undefined,
    commanders: undefined,
};

export const statsReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(
            StatsAction.HydrateMatchHistoryComplete,
            (state, action) => {
                const matchesCollection = action.payload;
                state.matches = matchesCollection;
                state.commanders = matchesToCommanders(matchesCollection);
            }
        );
});

// given a collection of matches, return all of the commanders in those matches
function matchesToCommanders(matches: Match[]): { [id: string]: Commander } {
    const commanderDictionary: { [id: string]: Commander } = {};
    for (const currentMatch of matches) {
        // iterate through each player, and add those commanders to our commander dictionary
        for (const player of currentMatch.players) {
            // Variable to call commander name
            const currentCommanderName = player.commander;
            const potentialCommanderObj = commanderDictionary[currentCommanderName];
            // if the entry doesn't exist, maybe add it to our dictionary
            if  (potentialCommanderObj === undefined) {
                // validate that it is a real commander
                const commanderId = commanderList[currentCommanderName];
                if (commanderId !== undefined) {
                    // commander is valid-- add it
                     commanderDictionary[currentCommanderName] = {
                        id: commanderList[currentCommanderName].id,
                        name: currentCommanderName,
                        matches: [currentMatch],
                        wins: (player.rank === "1") ? 1 : 0,
                    };
                } else {
                    // log the invalid commander
                    console.log(`Invalid commander found in currentMatch <$ currentMatch.id}> : ${currentCommanderName}`);
                }
            } else {
                // since this commander exists, update the currentMatch count
                commanderDictionary[currentCommanderName].matches.push(currentMatch);
                if (player.rank === "1") { 
                    commanderDictionary[currentCommanderName].wins++; 
                }
            }
        }
    }
    return commanderDictionary;
}