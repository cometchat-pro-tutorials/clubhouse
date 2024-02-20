# How to build an audioroom app - Podium with React Native

## Technology

This demo uses:

- @cometchat/calls-sdk-react-native,
- @cometchat/chat-sdk-react-native,
- @ethersproject/shims,
- @particle-network/rn-auth,
- @react-native-async-storage/async-storage,
- @react-native-community/cli,
- @react-native-picker/picker,
- @react-navigation/bottom-tabs,
- @react-navigation/native-stack,
- @react-navigation/native,
- @react-navigation/stack,
- emoji-mart-nativebeta,
- ethers,
- firebase,
- react-native-autolink,
- react-native-document-picker,
- react-native-elements,
- react-native-fast-image,
- react-native-gesture-handler,
- react-native-get-random-values,
- react-native-image-picker,
- react-native-keep-awake,
- react-native-reanimated,
- react-native-safe-area-context,
- react-native-screens,
- react-native-sound,
- react-native-svg
- react-native-svg-transformer
- react-native-swipe-list-view,
- react-native-vector-icons,
- react-native-video-controls,
- react-native-video,
- react-native-webview,
- react-native,
- react,
- reanimated-bottom-sheet,
- rn-fetch-blob,
- uuid,
- validator

## Running the demo

To run the demo follow these steps:

1. [Head to CometChat Pro and create an account](https://app.cometchat.com/signup)
2. From the [dashboard](https://app.cometchat.com/apps), add a new app called **"club-house"**
3. Select this newly added app from the list.
4. From the Quick Start copy the **APP_ID, APP_REGION and AUTH_KEY**. These will be used later.
5. Also copy the **REST_API_KEY** from the API & Auth Key tab.
6. Navigate to the Users tab, and delete all the default users and groups leaving it clean **(very important)**.
7. Download the repository by running `https://github.com/jomarip/podium.git` and open it in a code editor.
8. [Head to Firebase and create a new project](https://console.firebase.google.com)
9. Create a file called **env.js** in the root folder of your project.
10. Import and inject your secret keys in the **env.js** file containing your CometChat and Firebase in this manner.

```js
export const fbConfig = {
  apiKey: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
  authDomain: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
  databaseURL: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
  projectId: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
  storageBucket: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
  messagingSenderId: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
  appId: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
  measurementId: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
};

export const cometChatConfig = {
  cometChatAppId: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
  cometChatRegion: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
  cometChatAuthKey: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
  cometChatRestApiKey: xxx - xxx - xxx - xxx - xxx - xxx - xxx - xxx,
};


  export const particleInfoConfig = {
    particleId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
    clientKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  };
  
```

11. cd to your root folder and hit npm i --force to install the packages.
12. Use node.js version14.17 or greater
For running on android you will need an android device or emulator
13. adb reverse tcp:8081 tcp:8081 (command to connect device)
14. npx react-native run-android (to build the project - helps to have the adb running with attached device)
15. npm start 


