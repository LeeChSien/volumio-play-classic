#! /usr/bin/env node
const VALID_HOSTNAME_REGEX = "^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])\(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$"
const VOLUMIO_HOST = process.argv[process.argv.length - 1]

if (!VOLUMIO_HOST.match(VALID_HOSTNAME_REGEX)) {
  console.error('[error] it\'s not a valid Volumio HOST')
  return
}

const req = new Request("https://www.e-classical.com.tw/index.html", {
  headers: {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"
  },
})

const PLAYLIST_REGX = /'https:\/\/eclassicalradiow-hichannel.cdn.hinet.net\/live\/RA000018\/playlist.m3u8\?token=(.*)&expires=\d+'/g

const res = fetch(req)
  .then((data) => data.text())
  .then((body) => {
    const fetchedPlaylist = body.match(PLAYLIST_REGX)[0]

    if (!fetchedPlaylist) {
      console.error('[error] cannot fetch playlist correctly')
      return
    }

    fetch(`http://${VOLUMIO_HOST}/api/v1/replaceAndPlay`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service: 'webradio',
        type: 'webradio',
        title: '愛樂電台',
        artist: 'FM 99.7',
        albumart: 'https://www.e-classical.com.tw/img/logo_big2.png',
        uri: fetchedPlaylist.replace(/'/g, '')
      })
    })
      .then((res) => (res.json()))
      .then((data) => {
        if (data.response === 'success') {
          console.log('[success] play radio now')
        } else {
          throw Error(data)
        }
      })
      .catch((error) => {
        console.error(`[error] unknow exception: ${JSON.stringify(error)}`)
      })
  });
  