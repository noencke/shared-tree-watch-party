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

export default async function connect(): Promise<{
  container: IFluidContainer;
  tree: ISharedTree;
}> {
  if (connectedState === undefined) {
    const client = new AzureClient({
      connection: localConfig,
    });
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
