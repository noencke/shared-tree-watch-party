/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

// When the YouTube API finishes loading, it will call a special `onYouTubeIframeAPIReady` function in the global scope.
const youtubeAPIPromise = new Promise<void>((resolve) => {
  (window as any).onYouTubeIframeAPIReady = () => resolve();
});

// Load the YouTube API by adding a script tag to the document that points to the YouTube API URL.
const youtubeApiScript = document.createElement("script");
youtubeApiScript.src = "https://www.youtube.com/iframe_api";
document.body.appendChild(youtubeApiScript);

/** This promise will complete when the global YouTube API has finished loading. */
export default youtubeAPIPromise;
