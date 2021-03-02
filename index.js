// import CallingExtensions, { Constants } from "@hubspot/calling-extensions-sdk";

import CallingExtensions from "./CallingExtensions.js";
import { errorType } from "./Constants.js";
const https = require('https');
const querystring = require('querystring');
const data = JSON.stringify({
  grant_type: "client_credentials",
})
const options = {
  hostname: 'auth.streams.us/auth/token',
  //port: 80,
  path: '/',
  method: 'POST',
  headers: {
    'Accept': 'application/json',
	'Content-Type': 'application/x-www-form-urlencoded',
	'Authorization': 'Basic eW1INnJKR3RmWE42bGZYVDp3SGU1Y0VwT2pGVVVUM1ZyektBVU9vYlVWdmtJU2prQQ==',
    'Content-Length': data.length,
  },
}
const req = https.request(options, (res) => {
  console.log(res)

  res.on('data', (d) => {
    //process.stdout.write(d)
  })
})

req.on('error', (error) => {
  console.error(error)
})

req.write(data)
req.end()
const callback = () => {
  let rowId = 0;
  const incomingMsgContainer = document.querySelector("#incomingMsgs");
  function appendMsg(data, event) {
    const div = document.createElement("div");
    rowId += 1;
    div.innerHTML = `<span>${rowId}: </span><span>${
      event.type
    }, ${JSON.stringify(data)}</span>`;
    incomingMsgContainer.append(div);
  }

  const defaultSize = {
    width: 400,
    height: 600
  };

  const state = {};

  const cti = new CallingExtensions({
    debugMode: true,
    eventHandlers: {
      onReady: () => {
        cti.initialized({
          isLoggedIn: true,
          sizeInfo: defaultSize
        });
      },
      onDialNumber: (data, rawEvent) => {
        appendMsg(data, rawEvent);
        const { phoneNumber } = data;
        state.phoneNumber = phoneNumber;
        window.setTimeout(
          () =>
            cti.outgoingCall({
              createEngagement: true,
              phoneNumber
            }),
          500
        );
      },
      onEngagementCreated: (data, rawEvent) => {
        const { engagementId } = data;
        state.engagementId = engagementId;
        appendMsg(data, rawEvent);
      },
      onEndCall: () => {
        window.setTimeout(() => {
          cti.callEnded();
        }, 500);
      },
      onVisibilityChanged: (data, rawEvent) => {
        appendMsg(data, rawEvent);
      }
    }
  });

  const element = document.querySelector(".controls");
  element.addEventListener("click", event => {
    const clickedButtonValue = event.target.value;
    switch (clickedButtonValue) {
      case "initialized":
        cti.initialized({
          isLoggedIn: true
        });
        break;
      case "log in":
        cti.userLoggedIn();
        break;
      case "log out":
        cti.userLoggedOut();
        break;
      // Calls
      case "incoming call":
        window.setTimeout(() => {
          cti.incomingCall();
        }, 500);
        break;
      case "outgoing call started":
        window.setTimeout(() => {
          cti.outgoingCall({
            createEngagement: "true",
            phoneNumber: state.phoneNumber
          });
        }, 500);
        break;
      case "call answered":
        cti.callAnswered();
        break;
      case "call ended":
        cti.callEnded();
        break;
      case "call completed":
        cti.callCompleted({
          engagementId: state.engagementId
        });
        break;
      case "send error":
        cti.sendError({
          type: errorType.GENERIC,
          message: "This is a message shown in Hubspot UI"
        });
        break;
      case "change size":
        defaultSize.width += 20;
        defaultSize.height += 20;
        cti.resizeWidget({
          width: defaultSize.width,
          height: defaultSize.height
        });
        break;
      default:
        break;
    }
  });
};

if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  window.setTimeout(() => callback(), 1000);
} else {
  document.addEventListener("DOMContentLoaded", callback);
}
