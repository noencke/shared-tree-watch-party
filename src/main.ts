import "./style.css";

/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { AppState, PlayerState, arePlayerStatesEqual } from "./schema";
import { ISharedTree } from "@fluid-experimental/tree2";
import youtubeApi from "./youtubeApi";
import connect from "./connection";

async function main() {
  await youtubeApi;
  const { tree } = await connect();
  new WatchPartyPlayer(tree, "player");
}

class WatchPartyPlayer {
  public get state(): AppState {
    return this.tree.root as unknown as AppState;
  }
  public readonly player: YT.Player;
  private playerStateCache: PlayerState | undefined;

  public constructor(
    public readonly tree: ISharedTree,
    public readonly playerElementId: string
  ) {
    this.player = new YT.Player(playerElementId, {
      height: "640",
      width: "480",
      videoId: "I5NHjU0Tj7c",
      events: {
        onReady: (ev) => {
          this.update(ev.target);
          tree.events.on("afterBatch", () => this.update(this.player));
        },
        onStateChange: (ev) => this.onPlayerStateChange(ev),
      },
    });
  }

  private update(player: YT.Player): void {
    if (arePlayerStatesEqual(this.state.playerState, this.playerStateCache)) {
      return;
    }

    if (this.state.playerState !== undefined) {
      const elapsed = Date.now() - this.state.playerState.timeStarted;
      const time = elapsed + this.state.playerState.videoProgress;
      player.seekTo(time / 1000, true);
      player.playVideo();
    } else {
      player.pauseVideo();
    }
    this.playerStateCache = this.state.playerState;
  }

  private onPlayerStateChange(ev: YT.OnStateChangeEvent): void {
    switch (ev.data) {
      case YT.PlayerState.UNSTARTED:
        break;
      case YT.PlayerState.ENDED:
        break;
      case YT.PlayerState.PLAYING:
        (this.state as any)["playerState"] = {
          timeStarted: Date.now(),
          videoProgress: this.player.getCurrentTime() * 1000,
        };
        break;
      case YT.PlayerState.PAUSED:
        this.state.playerState = undefined;
        break;
      case YT.PlayerState.BUFFERING:
        break;
      case YT.PlayerState.CUED:
        break;
    }
  }
}

export default main();
