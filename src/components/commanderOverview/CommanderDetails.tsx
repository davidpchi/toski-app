import { TooltipItem } from "chart.js";
import React from "react";
import { useSelector } from "react-redux";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
	Flex,
	Heading,
	Image,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
} from "@chakra-ui/react";

import { AppState } from "../../redux/rootReducer";
import {
	getCommander,
	getMatchesByCommanderName,
} from "../../redux/statsSelectors";
import { Loading } from "../Loading";
import { commanderList } from "../../services/commanderList";
import { SortableTable } from "../SortableTable";
import { matchHistoryColumns } from "../matchHistory/matchHistoryColumnHelper";
import { Match } from "../../types/domain/Match";
import { MatchPlayer } from "../../types/domain/MatchPlayer";
import { LineGraph } from "../LineGraph";

export async function loader(data: { params: any }) {
	return data.params.commanderId;
}

export const CommanderDetails = React.memo(function CommanderDetails() {
	const navigate = useNavigate();
	const commanderId = useLoaderData() as string;
	const commander = useSelector((state: AppState) =>
		getCommander(state, commanderId),
	);
	const matches = useSelector((state: AppState) =>
		getMatchesByCommanderName(state, commander ? commander.name : ""),
	);

	if (commander === undefined) {
		return <Loading text="" />;
	}

	const title = commander.name.toUpperCase();

	let numberOfWins = 0;

	const winratePerMatch = matches.map((match: Match, index: number) => {
		const winningPlayer = match.players.find(
			(player: MatchPlayer) => player.rank === "1",
		);

		let currentWinRate = 0;

		// this should always be true
		if (winningPlayer !== undefined) {
			for (const winningCommander of winningPlayer.commanders) {
				const isWinner = winningCommander === commander.name;

				if (isWinner) {
					numberOfWins += 1;
				}

				currentWinRate = numberOfWins / (index + 1);
			}
		}

		return { x: index + 1, y: Math.round(currentWinRate * 100) };
	});

	const tooltipTitleCallback = (item: TooltipItem<"line">[]) => {
		return `Match Id: ${matches[item[0].dataIndex].id}`;
	};
	const tooltipLabelCallback = (item: TooltipItem<"line">) => {
		return `Winrate: ${item.formattedValue}%`;
	};

	return (
		<Flex direction="column" justify="center" align="center">
			<Heading>{title}</Heading>
			<Flex
				direction="row"
				maxWidth={"1024px"}
				alignSelf={"center"}
				justify="center"
				align="start"
				flexWrap="wrap"
				marginBottom="32px"
			>
				{commanderList[commander.name] ? (
					<Image width={300} src={commanderList[commander.name].image} />
				) : null}
				<Flex direction="column" padding="16px">
					<Text>{`Total Number of Games: ${commander.matches.length}`}</Text>
					<Text>{`Wins: ${commander.wins}`}</Text>
					<Text>
						{`Winrate: ${
							commander.matches.length > 0
								? Math.round((commander.wins / commander.matches.length) * 100)
								: 0
						}%`}
					</Text>
					<Text>{`Qualified: ${matches.length >= 5 ? "Yes" : "No"}`}</Text>
				</Flex>
			</Flex>
			<Tabs
				isFitted={true}
				width={"100%"}
				paddingRight={"10%"}
				paddingLeft={"10%"}
			>
				<TabList>
					<Tab>
						<Text>Match History</Text>
					</Tab>
					<Tab>
						<Text>Historical Winrate</Text>
					</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<SortableTable
							columns={matchHistoryColumns}
							data={matches}
							getRowProps={(row: any) => {
								return {
									onClick: () => {
										navigate("/matchHistory/" + row.original.id);
										window.scrollTo(0, 0);
									},
								};
							}}
						/>
					</TabPanel>
					<TabPanel>
						<Flex
							flexDirection={"column"}
							justifyContent={"center"}
							alignItems={"center"}
							padding="8px"
						>
							{matches.length >= 5 ? (
								<>
									<LineGraph
										dataLabel={"Winrate"}
										data={winratePerMatch}
										allowTogglableDataPoints={true}
										tooltipTitleCallback={tooltipTitleCallback}
										tooltipLabelCallback={tooltipLabelCallback}
										minX={1}
										maxX={winratePerMatch.length}
									/>
								</>
							) : (
								<Text>Not enough matches</Text>
							)}
						</Flex>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Flex>
	);
});
