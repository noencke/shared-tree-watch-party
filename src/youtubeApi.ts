/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

let resolveYoutubeAPIPromise: () => void;
const youtubeAPIPromise = new Promise<void>((resolve) => {
  resolveYoutubeAPIPromise = resolve;
});

(window as any).onYouTubeIframeAPIReady = () => resolveYoutubeAPIPromise();

export default youtubeAPIPromise;
