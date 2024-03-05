import React from "preact";
import { useState } from "preact/hooks";

import type { TransformedTable } from "../../types/TransformedTable";

import type { TableId } from "../../types/bga/Table";

import { PlayerList } from "../PlayerList";
import { Player } from "../Player";
import { Button } from "../base/Button";
import { Table } from "../Table";
import { CardList } from "../base/CardList";
import { cn } from "../utils/cn";
import { Loading } from "../Loading";

type Props = {
  className?: string,
  getFriendsTables: () => Promise<TransformedTable[]>
};

export const FriendsView = ({ className, getFriendsTables }: Props) => {
  const [tables, setTables] = useState<TransformedTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const handleAcceptOrDeclineInvite = (tableId: TableId) => { };

  const search = () => {
    setLoading(true);
    setRequested(true);
    getFriendsTables().then(tables => {
      setTables(tables);
      setLoading(false);
    });
  }

  if (loading) {
    return (
      <div className={cn(["flex justify-center flex-row", className || ''])}>
        <div className="max-result flex justify-center flex-col">
          <Loading />
        </div>
      </div>
    );
  }

  const noGame = () => {
    const msg = requested ? chrome.i18n.getMessage("no_games_friends") : chrome.i18n.getMessage("search_games_friends");
    return (
      <div className="flex justify-center flex-col grow">
        <span class="text-black dark:text-white text-center text-xl">
          {msg}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(["flex justify-between flex-col gap-2", className || ''])}>
      {tables.length === 0 && noGame()}

      {(tables.length === 0 && !requested) && (
        <span></span>
      )}

      {tables.length > 0 && (
        <div className="max-result">
          <CardList>
            {tables.map(
              ({
                nbMaxPlayers,
                players,
                hasArenaMode,
                isOpenForPlayers,
                tableId,
                gameStart,
                ...restTable
              }) => {
                const nbMissingPlayers = isOpenForPlayers
                  ? nbMaxPlayers - players.length
                  : 0;
                const isWaitingCurrentPlayer = players.some(
                  ({ isCurrentPlayer, isActivePlayer }) =>
                    isCurrentPlayer && isActivePlayer,
                );
                const isInvitePendingForCurrentPlayer =
                  players.some(
                    ({ isCurrentPlayer, isInvitePending }) =>
                      isCurrentPlayer && isInvitePending,
                  );

                return (
                  <Table
                    key={String(tableId)}
                    {...{
                      onAcceptInvite: handleAcceptOrDeclineInvite,
                      onDeclineInvite: handleAcceptOrDeclineInvite,
                      tableId,
                      hasArenaMode,
                      isInvitePendingForCurrentPlayer,
                      isOpenForPlayers,
                      isWaitingCurrentPlayer,
                      ...restTable,
                    }}
                  >
                    <PlayerList>
                      {[
                        ...players.map(
                          ({
                            playerId,
                            playerName,
                            isActivePlayer,
                            isInvitePending,
                          }) => (
                            <Player
                              key={String(playerId)}
                              playerName={playerName}
                              isActivePlayer={
                                isActivePlayer
                              }
                              isInvitePending={
                                isInvitePending
                              }
                            />
                          ),
                        ),
                        ...Array.from(
                          Array(nbMissingPlayers),
                        ).map(() => (
                          <Player playerName="🪑 ..." />
                        )),
                      ]}
                    </PlayerList>
                  </Table>
                );
              },
            )}
          </CardList>
        </div>
      )}
      <Button
        {...{
          text: chrome.i18n.getMessage("search"),
          className: "",
          onClick: search,
        }}
      />
    </div>
  );
}
