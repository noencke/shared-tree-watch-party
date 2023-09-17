/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  AllowedUpdateType,
  ISharedTree,
  SharedTreeFactory,
} from "@fluid-experimental/tree2";
import {
  AzureClient,
  AzureLocalConnectionConfig,
  AzureRemoteConnectionConfig,
} from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-runtime-utils";
import { ContainerSchema, IFluidContainer } from "fluid-framework";
import { schema } from "./schema";

const containerSchema: ContainerSchema = {
  initialObjects: {
    tree: class {
      public static getFactory(): SharedTreeFactory {
        return new SharedTreeFactory();
      }
    },
  },
};

const user = { id: "watchPartyId", name: "watchPartyName" };
let connectedState:
  | { container: IFluidContainer; tree: ISharedTree }
  | undefined;

const localConfig: AzureLocalConnectionConfig = {
  tokenProvider: new InsecureTokenProvider("", user),
  type: "local",
  endpoint: "http://localhost:7070",
};

function remoteConfig(key: string): AzureRemoteConnectionConfig {
  return {
    tenantId: "68dd0a5c-960b-45b0-ae9a-c37059f92754",
    tokenProvider: new InsecureTokenProvider(key, user),
    type: "remote",
    endpoint: "https://us.fluidrelay.azure.com",
  };
}

export default async function connect(): Promise<{
  container: IFluidContainer;
  tree: ISharedTree;
}> {
  if (connectedState === undefined) {
    const key = import.meta.env.VITE_KEY;
    const connection = key !== undefined ? remoteConfig(key) : localConfig;
    const client = new AzureClient({ connection });
    let container: IFluidContainer;
    let tree: ISharedTree;
    if (location.hash.length === 0) {
      ({ container } = await client.createContainer(containerSchema));
      const id = await container.attach();
      location.hash = id;
      tree = container.initialObjects.tree as ISharedTree;
      tree.schematize({
        schema,
        initialTree: { playerState: undefined },
        allowedSchemaModifications: AllowedUpdateType.SchemaCompatible,
      });
    } else {
      ({ container } = await client.getContainer(
        location.hash.substring(1),
        containerSchema
      ));
      tree = container.initialObjects.tree as ISharedTree;
    }
    connectedState = { container, tree };
  }

  return connectedState;
}
