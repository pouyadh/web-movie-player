function srt2webvtt(data) {
  // remove dos newlines
  var srt = data.replace(/\r+/g, "");
  // trim white space start and end
  srt = srt.replace(/^\s+|\s+$/g, "");

  // get cues
  var cuelist = srt.split("\n\n");
  var result = "";

  if (cuelist.length > 0) {
    result += "WEBVTT\n\n";
    for (var i = 0; i < cuelist.length; i = i + 1) {
      result += convertSrtCue(cuelist[i]);
    }
  }

  return result;
}

function convertSrtCue(caption) {
  // remove all html tags for security reasons
  //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');

  var cue = "";
  var s = caption.split(/\n/);

  // concatenate muilt-line string separated in array into one
  while (s.length > 3) {
    for (var i = 3; i < s.length; i++) {
      s[2] += "\n" + s[i];
    }
    s.splice(3, s.length - 3);
  }

  var line = 0;

  // detect identifier
  if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
    cue += s[0].match(/\w+/) + "\n";
    line += 1;
  }

  // get time strings
  if (s[line].match(/\d+:\d+:\d+/)) {
    // convert time string
    var m = s[1].match(
      /(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/
    );
    if (m) {
      cue +=
        m[1] +
        ":" +
        m[2] +
        ":" +
        m[3] +
        "." +
        m[4] +
        " --> " +
        m[5] +
        ":" +
        m[6] +
        ":" +
        m[7] +
        "." +
        m[8] +
        "\n";
      line += 1;
    } else {
      // Unrecognized timestring
      return "";
    }
  } else {
    // file format error or comment lines
    return "";
  }

  // get cue text
  if (s[line]) {
    cue += s[line] + "\n\n";
  }

  return cue;
}

function srt2vvt(a) {
  for (
    var b = new RegExp(
        /(\d\d:\d\d:\d\d)[,](\d\d\d) --> (\d\d:\d\d:\d\d)[,](\d\d\d)/,
        "g"
      ),
      d = (new RegExp(", --> ,", "g"), new Array()),
      e = new Array(),
      f = 0;
    f < a.match(b).length;
    f++
  )
    (e[f] = a.match(b)), (d[f] = b.exec(e[0][f]));
  for (var g = new Array(), h = new Array(), i = 0; i < d.length; i++)
    (g[i] = d[i][1] + "." + d[i][2] + " --> " + d[i][3] + "." + d[i][4]),
      (h[i] = d[i][1] + "," + d[i][2] + " --> " + d[i][3] + "," + d[i][4]);
  for (var j = 0; j < g.length; j++) a = a.replace(h[j], g[j]);
  return (a = "WEBVTT FILE\n\n" + a);
}

module.exports = srt2vvt;
