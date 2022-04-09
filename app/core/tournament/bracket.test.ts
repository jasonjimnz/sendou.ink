import { TeamOrder } from ".prisma/client";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { mapPoolForTest } from "~/utils/testUtils";
import { eliminationBracket } from "./algorithms";
import {
  countRounds,
  getRoundNames,
  getRoundsDefaultBestOf,
  tournamentRoundsForDB,
} from "./bracket";
import { generateMapListForRounds } from "./mapList";

const CountBracketRounds = suite("countRounds()");
const RoundNames = suite("getRoundNames()");
const TournamentRoundsForDB = suite("tournamentRoundsForDB()");

CountBracketRounds("Counts bracket (DE - 38)", () => {
  const bracket = eliminationBracket(38, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 8, losers: 9 });
});

CountBracketRounds("Counts bracket (DE - 10)", () => {
  const bracket = eliminationBracket(10, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 6, losers: 5 });
});

CountBracketRounds("Counts bracket (DE - 16)", () => {
  const bracket = eliminationBracket(16, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 6, losers: 6 });
});

CountBracketRounds("Counts bracket (SE - 16)", () => {
  const bracket = eliminationBracket(16, "SE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 4, losers: 0 });
});

RoundNames("No bracket reset round for SE", () => {
  const bracketSE = getRoundNames(eliminationBracket(16, "SE"));
  const bracketDE = getRoundNames(eliminationBracket(16, "DE"));

  let hasBR = false;
  for (const round of bracketDE.winners) {
    if (round === "Bracket Reset") hasBR = true;
  }
  assert.ok(hasBR);

  hasBR = false;
  for (const round of bracketSE.winners) {
    if (round === "Bracket Reset") hasBR = true;
  }
  assert.not.ok(hasBR);
});

const testTournamentData = (type: "SE" | "DE", participantsCount: number) => {
  const mapPool = mapPoolForTest();
  const bracket = eliminationBracket(participantsCount, type);
  const rounds = getRoundsDefaultBestOf(bracket);
  const mapList = generateMapListForRounds({ mapPool, rounds });

  return {
    mapPool,
    bracket,
    rounds,
    mapList,
  };
};

TournamentRoundsForDB("Generates rounds correctly", () => {
  const TEAM_COUNT = 24;

  const { bracket, mapList } = testTournamentData("DE", TEAM_COUNT);
  const bracketForDb = tournamentRoundsForDB({
    mapList,
    bracketType: "DE",
    participantsSeeded: new Array(TEAM_COUNT)
      .fill(null)
      .map((_, i) => i + 1)
      .map(String)
      .map((id) => ({ id })),
  });
  const roundsCounted = countRounds(bracket);
  let max = -Infinity;
  let min = Infinity;
  const uniqueParticipants = new Set<string>();

  for (const round of bracketForDb) {
    max = Math.max(max, round.position);
    min = Math.min(min, round.position);

    for (const match of round.matches) {
      for (const participant of match.participants) {
        if (round.position !== 1 && round.position !== 2) {
          throw new Error("Participant found not first two rounds");
        }
        if (typeof participant.team === "string") {
          uniqueParticipants.add(participant.team);
          continue;
        }
        uniqueParticipants.add(participant.team.id);
      }
    }
  }

  assert.equal(max, roundsCounted.winners);
  assert.equal(min, -roundsCounted.losers);
  assert.equal(uniqueParticipants.size, TEAM_COUNT + 1); // + BYE
});

TournamentRoundsForDB(
  "Generates rounds correctly (many byes, correct amount of teams round 2)",
  () => {
    const TEAM_COUNT = 18;

    const { mapList } = testTournamentData("SE", TEAM_COUNT);

    const bracketForDb = tournamentRoundsForDB({
      mapList,
      bracketType: "SE",
      participantsSeeded: new Array(TEAM_COUNT)
        .fill(null)
        .map((_, i) => i + 1)
        .map(String)
        .map((id) => ({ id })),
    });

    const participantsInRoundTwo = bracketForDb[1].matches.reduce(
      (acc, cur) => {
        const participants = cur.participants.reduce(
          (acc, cur) => acc + (cur.team === "BYE" ? 0 : 1),
          0
        );

        return acc + participants;
      },
      0
    );

    assert.equal(participantsInRoundTwo, 14);
  }
);

TournamentRoundsForDB("Advances bye to right spot", () => {
  const { mapList } = testTournamentData("DE", 24);

  const TEAM_COUNT = 7;
  const bracketForDb = tournamentRoundsForDB({
    mapList,
    bracketType: "SE",
    participantsSeeded: new Array(TEAM_COUNT)
      .fill(null)
      .map((_, i) => i + 1)
      .map(String)
      .map((id) => ({ id })),
  });

  let roundTwoParticipants = 0;
  let teamOrder: TeamOrder | null = null;
  for (const round of bracketForDb) {
    if (round.position !== 2) continue;
    for (const match of round.matches) {
      for (const participant of match.participants) {
        roundTwoParticipants++;
        teamOrder = participant.order;
      }
    }
  }

  assert.equal(roundTwoParticipants, 1);
  assert.equal(teamOrder, "UPPER");
});

CountBracketRounds.run();
RoundNames.run();
TournamentRoundsForDB.run();