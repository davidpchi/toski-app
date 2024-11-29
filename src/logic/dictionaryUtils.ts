import { NUMBER_OF_PLAYERS_FOR_VALID_MATCH } from "../components/constants";
import { commanderList } from "../services/commanderList";
import { Commander } from "../types/domain/Commander";
import { Match } from "../types/domain/Match";
import { Player } from "../types/domain/Player";
import { getColorIdentity } from "./utils";

/**
 * Given a collection of Matches, filter out games that don't have the desired number of players.
 * @param matches
 * @param playerCount The number of players in the match that matches will be filtered by.
 * @returns
 */
export function filterMatchesByPlayerCount(matches: Match[], playerCount: number): Match[] {
    const result = [];

    for (const match of matches) {
        if (match.players.length < playerCount) {
            continue;
        }

        result.push(match);
    }

    return result;
}

/**
 * Given a collection of Matches, filters them to matches after a certain date.
 * Optionally, provide an end date as well.
 * No other checks than provided dates. Does not consider the validness of a game, for instance.
 * @param matches Matches to consider
 * @param startDate
 * @param endDate
 * @returns
 */
export function filterMatchesByDate(matches: Match[], startDate?: Date, endDate?: Date): Match[] {
    const result = [];

    for (const match of matches) {
        if (startDate !== undefined && match.date < startDate) {
            continue;
        }

        if (endDate !== undefined && match.date > endDate) {
            continue;
        }

        result.push(match);
    }

    return result;
}

/**
 * Given a collection of matches, create a dictionary of players with optional filters
 * where the stats of those players are computed only using valid matches
 * (as determined by the required number of players in the match).
 * @param matches The collection of matches to build the dictionary from
 * @param playerId An optional player name to filter the commanders by (will only return commanders the player has played)
 * @returns A dictionary of commanders keyed by commanderId
 */
export function matchesToCommanderHelper(
    matches: Match[],
    playerNameFilter?: string,
    startDate?: Date
): { [id: string]: Commander } {
    const filteredMatches = filterMatchesByDate(matches, startDate);

    const playedCommanderDictionary: { [id: string]: Commander } = {};
    for (const currentMatch of filteredMatches) {
        // iterate through each player, and add those commanders to our commander dictionary
        for (const player of currentMatch.players) {
            // apply our filters
            if (playerNameFilter !== undefined && player.name !== playerNameFilter) {
                // we have an active playerName filter -- if the player name is not a match, then we skip it
                continue;
            }

            // there is a chance the commander is actually multiple commanders.
            // the current separator for commanders is " && "
            const currentCommanderNames: string[] = player.commanders;

            // loop through all commanders and update our commanders dictionary
            for (const currentCommanderName of currentCommanderNames) {
                const commander = commanderList[currentCommanderName];

                // check to see if the commander name is valid
                if (commander === undefined) {
                    // log the invalid commander
                    console.log(
                        `Invalid commander found in currentMatch <${currentMatch.id}> : ${currentCommanderName}`
                    );
                    continue;
                }

                // commander name is valid. let's check to see if we already added it to our dictionary
                const potentialCommanderObj = playedCommanderDictionary[commander.id];
                if (potentialCommanderObj === undefined) {
                    // the entry doesn't exist, add it to our dictionary
                    playedCommanderDictionary[commander.id] = {
                        id: commander.id,
                        name: currentCommanderName,
                        colorIdentity: commander.colorIdentity,
                        colorIdentityName: getColorIdentity(commander.colorIdentity) ?? "",
                        matches: [currentMatch.id],
                        validMatchesCount: currentMatch.players.length === NUMBER_OF_PLAYERS_FOR_VALID_MATCH ? 1 : 0,
                        wins:
                            player.rank === "1" && currentMatch.players.length === NUMBER_OF_PLAYERS_FOR_VALID_MATCH
                                ? 1
                                : 0
                    };
                } else {
                    // since this commander exists, update the currentMatch count
                    playedCommanderDictionary[potentialCommanderObj.id].matches.push(currentMatch.id);
                    if (currentMatch.players.length === NUMBER_OF_PLAYERS_FOR_VALID_MATCH) {
                        if (player.rank === "1") {
                            playedCommanderDictionary[potentialCommanderObj.id].wins++;
                        }
                        playedCommanderDictionary[potentialCommanderObj.id].validMatchesCount++;
                    }
                }
            }
        }
    }
    return playedCommanderDictionary;
}

/**
 * Given a collection of matches, create a dictionary of players with optional filters
 * @param matches The collection of matches to build the dictionary from. For stats it filters out matches with incorrect player counts
 * @param commanderName An optional commander name to filter the users by (the user must have played this commander)
 * @returns A dictionary of player keyed by playerId
 */
export function matchesToPlayersHelper(
    matches: Match[],
    commanderNameFilter?: string,
    startDate?: Date
): { [id: string]: Player } {
    const filteredMatches = filterMatchesByDate(matches, startDate);

    const playerDictionary: { [id: string]: Player } = {};
    for (const currentMatch of filteredMatches) {
        // iterate through each player, and add those commanders to our commander dictionary
        for (const player of currentMatch.players) {
            // if any of the filters have a value, then we assume the player has failed the filter to start
            let passedFilter = commanderNameFilter === undefined;

            // loop through all commanders and apply our filter
            for (const currentCommanderName of player.commanders) {
                if (currentCommanderName === commanderNameFilter) {
                    passedFilter = true;
                    break;
                }
            }

            if (passedFilter) {
                // passed filters so we want to add this player.
                // let's check to see if player is already in our dictionary.
                const potentialPlayerObj: Player | undefined = playerDictionary[player.name];
                if (potentialPlayerObj === undefined) {
                    // initialize the color profile dictionaries
                    const colorProfileColors: { [color: string]: number } = {};
                    const colorProfileIdentities: { [color: string]: number } = {};

                    // compute the players color profile
                    for (const commanderName of player.commanders) {
                        const potentialCommander = commanderList[commanderName];
                        const colors = potentialCommander ? potentialCommander.colorIdentity : [];

                        for (const color of colors) {
                            // add or increment this in our colorProfile dictionary
                            if (color) {
                                colorProfileColors[color] =
                                    colorProfileColors[color] === undefined ? 1 : colorProfileColors[color] + 1;
                            }
                        }

                        //also determine the color identity save that too
                        const colorIdentity = getColorIdentity(colors);
                        if (colorIdentity !== undefined) {
                            colorProfileIdentities[colorIdentity] =
                                colorProfileIdentities[colorIdentity] === undefined
                                    ? 1
                                    : colorProfileIdentities[colorIdentity] + 1;
                        }
                    }

                    // the entry doesn't exist, add it to our dictionary
                    playerDictionary[player.name] = {
                        name: player.name,
                        matches: [currentMatch],
                        validMatchesCount: currentMatch.players.length === NUMBER_OF_PLAYERS_FOR_VALID_MATCH ? 1 : 0,
                        wins:
                            player.rank === "1" && currentMatch.players.length === NUMBER_OF_PLAYERS_FOR_VALID_MATCH
                                ? 1
                                : 0,
                        colorProfile: {
                            colors: colorProfileColors,
                            colorIdentities: colorProfileIdentities
                        }
                    };
                } else {
                    // since this player exists, update the currentMatch count
                    playerDictionary[player.name].matches.push(currentMatch);
                    if (currentMatch.players.length === NUMBER_OF_PLAYERS_FOR_VALID_MATCH) {
                        if (player.rank === "1") {
                            playerDictionary[player.name].wins++;
                        }
                        playerDictionary[player.name].validMatchesCount++;
                    }

                    // compute the players color profile
                    for (const commanderName of player.commanders) {
                        const potentialCommander = commanderList[commanderName];
                        const colors = potentialCommander ? potentialCommander.colorIdentity : [];

                        for (const color of colors) {
                            // add or increment this in our colorProfile dictionary
                            if (color) {
                                playerDictionary[player.name].colorProfile.colors[color] =
                                    playerDictionary[player.name].colorProfile.colors[color] === undefined
                                        ? 1
                                        : playerDictionary[player.name].colorProfile.colors[color] + 1;
                            }
                        }

                        //also determine the color identity save that too
                        const colorIdentity = getColorIdentity(colors);
                        if (colorIdentity !== undefined) {
                            playerDictionary[player.name].colorProfile.colorIdentities[colorIdentity] =
                                playerDictionary[player.name].colorProfile.colorIdentities[colorIdentity] === undefined
                                    ? 1
                                    : playerDictionary[player.name].colorProfile.colorIdentities[colorIdentity] + 1;
                        }
                    }
                }
            }
        }
    }
    return playerDictionary;
}
