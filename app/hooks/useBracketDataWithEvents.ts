import { useLoaderData } from "remix";
import type { BracketModified } from "~/services/bracket";
import { Unpacked } from "~/utils";
import * as React from "react";
import { useSocketEvent } from "./useSocketEvent";

export type BracketData = {
  number: Unpacked<Unpacked<BracketModified["rounds"]>["matches"]>["number"];
  participants:
    | Unpacked<Unpacked<BracketModified["rounds"]>["matches"]>["participants"]
    | null;
  score:
    | Unpacked<Unpacked<BracketModified["rounds"]>["matches"]>["score"]
    | null;
}[];

export function useBracketDataWithEvents(): BracketModified {
  const data = useLoaderData<BracketModified>();
  const [dataWithEvents, setDataWithEvents] = React.useState(data);

  const eventHandler = React.useCallback(
    (data: unknown) => {
      const dataMap = (data as BracketData).reduce(
        (map, bracketData) => map.set(bracketData.number, bracketData),
        new Map<number, Unpacked<BracketData>>()
      );
      setDataWithEvents({
        ...dataWithEvents,
        rounds: dataWithEvents.rounds.map((round) => ({
          ...round,
          matches: round.matches.map((match) => {
            const bracketData = dataMap.get(match.number);
            if (match.number !== bracketData?.number) return match;
            // with null we overwrite
            // with undefined we use the previous value
            const getParticipants = () => {
              if (bracketData.participants === null) return undefined;
              if (bracketData.participants) return bracketData.participants;
              return match.participants;
            };
            const getScore = () => {
              if (bracketData.score === null) return undefined;
              if (bracketData.score) return bracketData.score;
              return match.score;
            };
            return {
              id: match.id,
              loserDestinationMatchId: match.loserDestinationMatchId,
              winnerDestinationMatchId: match.winnerDestinationMatchId,
              number: match.number,
              participantSourceMatches: match.participantSourceMatches,
              participants: getParticipants(),
              score: getScore(),
            };
          }),
        })),
      });
    },
    [dataWithEvents, setDataWithEvents]
  );

  useSocketEvent(`bracket-${data.id}`, eventHandler);

  return dataWithEvents;
}