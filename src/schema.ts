/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  SchemaAware,
  SchemaBuilder,
  ValueSchema,
} from "@fluid-experimental/tree2";

const builder = new SchemaBuilder("07b15947-9700-4e8f-8ad3-532dc4395040");
export const timeSchema = builder.primitive("time", ValueSchema.Number);

export const playerStateSchema = builder.struct("playerState", {
  timeStarted: SchemaBuilder.fieldValue(timeSchema),
  videoProgress: SchemaBuilder.fieldValue(timeSchema),
});

export const appSchema = builder.struct("app", {
  playerState: SchemaBuilder.fieldOptional(playerStateSchema),
});

export const rootField = SchemaBuilder.fieldOptional(appSchema);
export const schema = builder.intoDocumentSchema(rootField);
export type Root = (typeof schema)["root"];
export type AppState = SchemaAware.TypedNode<typeof appSchema>;
export type PlayerState = SchemaAware.TypedNode<typeof playerStateSchema>;

export function arePlayerStatesEqual(
  playerStateA: PlayerState | undefined,
  playerStateB: PlayerState | undefined
): boolean {
  if (playerStateA === undefined || playerStateB === undefined) {
    return playerStateA === playerStateB;
  }

  return (
    playerStateA.timeStarted === playerStateB.timeStarted &&
    playerStateA.videoProgress === playerStateB.videoProgress
  );
}
