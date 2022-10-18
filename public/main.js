"use strict";

function logEvent(e) {
  console.log(e);
  var result = {
    type: e.type,
    target: e.target.constructor.name
  };

  switch (result.target) {
    case "XMLHttpRequest":
      result.status = e.target.status;
      result.response = e.target.response;
      result.readyState = e.target.readyState;
      result.loaded = e.loaded;
      break;

    case "HTMLVideoElement":
      result.readyState = e.target.readyState;
      result.currentSrc = e.target.currentSrc;
      result.textTracks = e.target.textTracks;
  }

  log(result);
  log("--------------------------------------------------------");
}

function log(any) {
  var logElem = document.getElementById("log");

  try {
    logElem.value += JSON.stringify(any, null, 2) + "\n";
  } catch (err) {
    logElem.value += "!!LOG_PROBLEM!!";
  }
} // if (window.location) {
//   log(window.location);
// } else {
//   log("no locations");
// }
// window.addEventListener("error", logEvent);


var vidLoadButtonElem = document.getElementById("vid-load-btn");
var subLoadButtonElem = document.getElementById("sub-load-btn");
var subApplyButtonElem = document.getElementById("sub-apply-btn");
var vidElem = document.getElementById("vid");
var vidURLInputElem = document.getElementById("vid-url-input");
var vidLoadStateElem = document.getElementById("vid-load-state");
var subURLInputElem = document.getElementById("sub-url-input");
var subSelectElem = document.getElementById("sub-select");
var encSelectElem = document.getElementById("enc-select"); // vidElem.addEventListener("error", logEvent);
// vidElem.addEventListener("canplay", logEvent);
// vidElem.addEventListener("change", logEvent);
// vidElem.addEventListener("cuechange", logEvent);
// vidElem.addEventListener("emptied", logEvent);
// vidElem.addEventListener("ended", logEvent);
// vidElem.addEventListener("invalid", logEvent);
// vidElem.addEventListener("loadeddata", logEvent);
// vidElem.addEventListener("loadedmetadata", logEvent);
// vidElem.addEventListener("loadstart", logEvent);
// vidElem.addEventListener("playing", logEvent);
// vidElem.addEventListener("progress", logEvent);
// vidElem.addEventListener("reset", logEvent);
// vidElem.addEventListener("securitypolicyviolation", logEvent);

document.getElementById("vid-url-input").value = "https://cdn.film2serial.ir/film2serial/film/doble/95/2/Limitless_2011_720p_Farsi_Dubbed_%28Film2serial.ir%29.mkv";
document.getElementById("sub-url-input").value = "https://dl.subtitlestar.com/dlsub/limitless-2011-All.zip";

function changeVideoSource(src) {
  while (vidElem.firstChild) {
    vidElem.removeChild(vidElem.firstChild);
  }

  vidElem.load();
  var source = document.createElement("source"); // source.addEventListener("error", logEvent);
  // source.addEventListener("canplay", logEvent);
  // source.addEventListener("change", logEvent);
  // source.addEventListener("cuechange", logEvent);
  // source.addEventListener("emptied", logEvent);
  // source.addEventListener("ended", logEvent);
  // source.addEventListener("invalid", logEvent);
  // source.addEventListener("loadeddata", logEvent);
  // source.addEventListener("loadedmetadata", logEvent);
  // source.addEventListener("loadstart", logEvent);
  // source.addEventListener("playing", logEvent);
  // source.addEventListener("progress", logEvent);
  // source.addEventListener("reset", logEvent);
  // source.addEventListener("securitypolicyviolation", logEvent);

  source.setAttribute("src", src);
  vidElem.appendChild(source);
}

function loadMovie() {
  var url = vidURLInputElem.value;

  function applySrc(e) {
    //logEvent(e);
    if (e.target.status !== 200) {
      vidLoadButtonElem.style.background = "#f00";
      return;
    }

    vidLoadButtonElem.style.background = "#0f0";
    var src = e.target.responseText.replace("https://", "http://");
    changeVideoSource(src);
  }

  var req = new XMLHttpRequest();
  req.open("GET", "https://film.iran.liara.run/redirect/" + url);
  req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
  req.addEventListener("loadend", applySrc); // req.addEventListener("abort", logEvent);
  // req.addEventListener("error", logEvent);
  // req.addEventListener("load", logEvent);
  // req.addEventListener("loadstart", logEvent);
  // req.addEventListener("progress", logEvent);
  // req.addEventListener("readystatechange", logEvent);

  req.send(null);
  vidLoadButtonElem.style.background = "#ff0";
}

function loadSubtitleList(list) {
  var subSelectElem = document.getElementById("sub-select");
  subSelectElem.innerHTML = list.map(function (s) {
    return "<option value=\"".concat(s, "\">").concat(s, "</option>");
  });
}

function loadSub() {
  function loadfiles(e) {
    //logEvent(e);
    if (e.target.status !== 200) {
      subLoadButtonElem.style.background = "#f00";
      return;
    }

    subLoadButtonElem.style.background = "#0f0";
    loadSubtitleList(e.target.response.files);
  }

  var req = new XMLHttpRequest();
  req.open("POST", "https://film.iran.liara.run/zip-list");
  req.responseType = "json";
  req.setRequestHeader("Content-type", "application/json; charset=utf-8");
  req.addEventListener("loadend", loadfiles);
  req.send(JSON.stringify({
    url: subURLInputElem.value
  }));
  subLoadButtonElem.style.background = "#ff0";
}

function changeVideoTrack(name, src) {
  while (vidElem.querySelector("track")) {
    vidElem.removeChild(vidElem.querySelector("track"));
  }

  var vidTrack = document.createElement("track");
  vidElem.appendChild(vidTrack);
  vidTrack.setAttribute("src", src);
  vidTrack.setAttribute("default", true);
  vidTrack.setAttribute("srclang", "en");
  vidElem.textTracks[0].mode = "showing";
}

function applySub() {
  function loadfiles(e) {
    //logEvent(e);
    if (e.target.status !== 200) {
      subApplyButtonElem.style.background = "#f00";
      return;
    }

    subApplyButtonElem.style.background = "#0f0";
    var text = e.target.response;
    var url = URL.createObjectURL(new Blob([text], {
      type: "text/vtt"
    }));
    changeVideoTrack("sub", url);
  }

  var req = new XMLHttpRequest();
  req.open("POST", "https://film.iran.liara.run/zip-file");
  req.responseType = "text";
  req.setRequestHeader("Content-type", "application/json; charset=utf-8");
  req.addEventListener("loadend", loadfiles);
  req.send(JSON.stringify({
    url: subURLInputElem.value,
    fileKey: subSelectElem.value,
    encoding: encSelectElem.value
  }));
  subApplyButtonElem.style.background = "#ff0";
}

vidLoadButtonElem.addEventListener("click", loadMovie);
subLoadButtonElem.addEventListener("click", loadSub);
subApplyButtonElem.addEventListener("click", applySub);