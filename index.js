// import CallingExtensions, { Constants } from "@hubspot/calling-extensions-sdk";

import CallingExtensions from "./CallingExtensions.js";
import { errorType } from "./Constants.js";

/*const request = require('request');

var headers = {
    'Accept': 'application/json',
    'Content-type': 'application/x-www-form-urlencoded',
	'Authorization' : 'Basic eW1INnJKR3RmWE42bGZYVDp3SGU1Y0VwT2pGVVVUM1ZyektBVU9vYlVWdmtJU2prQQ==',
};

var dataString = '{"grant_type":"client_credentials"}';

var options = {
    url: 'https://auth.streams.us/auth/token',
    method: 'POST',
    headers: headers,
    body: dataString
};
console.log();
function callback2(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback2);*/

const axios = require('axios');
const qs = require('querystring');
const  data = {grant_type:"client_credentials"};
const config  = {
	headers: {
    'Accept': 'application/json',
    'Content-type': 'application/x-www-form-urlencoded',
	'Authorization' : 'Basic eW1INnJKR3RmWE42bGZYVDp3SGU1Y0VwT2pGVVVUM1ZyektBVU9vYlVWdmtJU2prQQ==',
	}
};

axios.post('https://auth.streams.us/auth/token', qs.stringify(data), config)
    .then((res) => {
        console.log(`Status: ${res.status}`);
        console.log('Body: ', res.data);
    }).catch((err) => {
        console.error(err);
    });

var header2 = {
    'Content-type': 'application/x-www-form-urlencoded',
	'Authorization' : 'Bearer eW1INnJKR3RmWE42bGZYVDp3SGU1Y0VwT2pGVVVUM1ZyektBVU9vYlVWdmtJU2prQQ==',
};



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
            })
			/*Make CTC call streams*/
			,
          500
        );
      },
      onEngagementCreated: (data, rawEvent) => {
        const { engagementId } = data;
        state.engagementId = engagementId;
        appendMsg(data, rawEvent);
		/*Get recording files and upload to the server*/
		
      },
      onEndCall: () => {
        window.setTimeout(() => {
          cti.callEnded();
		  /* create engagement */
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
