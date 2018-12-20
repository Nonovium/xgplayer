/* eslint-disable */
import Player from '../player'
import sniffer from '../utils/sniffer'
import Collector from './collect'

let logger = function () {
  let player = this
  let util = Player.util
  if (player.config.noLog !== true) {
    const tracker = new Collector('tracker');

    tracker.init({
      app_id: 1300,
      channel: 'cn',
      log: false,
    })

    tracker.start()

    tracker('config', {
      evtParams: {
        log_type: 'logger',
        page_url: document.URL,
        domain: window.location.host,
        pver: player.version,
        ua: navigator.userAgent.toLowerCase()
      }
    })

    if(player.config.uid) {
      tracker('config', {
        user_unique_id: player.config.uid
      })
    }

    tracker('enter_page', {
      'from': 'index'
    })

    let computeWatchDur = function (played = []) {
      let minBegin = 0
      let end = 0
      let arr = []
      for (let i = 0; i < played.length; i++) {
        if(!played[i].end || played[i].begin < 0 || played[i].end < 0 || played[i].end < played[i].begin) {
          continue
        }
        if(arr.length < 1) {
          arr.push({begin: played[i].begin, end: played[i].end})
        } else {
          for (let j = 0; j < arr.length; j++) {
            let begin = played[i].begin
            let end = played[i].end
            if(end < arr[j].begin) {
              arr.splice(j, 0, {begin, end})
              break
            } else if(begin > arr[j].end) {
              if(j > arr.length - 2) {
                arr.push({begin, end})
                break
              }
            } else {
              let b = arr[j].begin
              let e = arr[j].end
              arr[j].begin = Math.min(begin, b)
              arr[j].end = Math.max(end, e)
              break
            }
          }
        }
      }
      let watch_dur = 0
      for (let i = 0; i < arr.length; i++) {
        watch_dur += arr[i].end - arr[i].begin
      }
      return watch_dur
    }

    let userLeave = function (event) {
      if (util.hasClass(player.root, 'xgplayer-is-enter')) {
        let lt = new Date().getTime()
        let obj = {
          url: player.logParams.pluginSrc ? player.logParams.pluginSrc : player.logParams.playSrc,
          vid: player.config.vid,
          pt: player.logParams.pt,
          lt
        }
        tracker('b', obj)
      } else if (util.hasClass(player.root, 'xgplayer-playing')) {
        let watch_dur = computeWatchDur(player.logParams.played)
        let lt = new Date().getTime()
        let obj = {
          url: player.logParams.pluginSrc ? player.logParams.pluginSrc : player.logParams.playSrc,
          vid: player.config.vid,
          bc: player.logParams.bc - 1 > 0 ? player.logParams.bc - 1 : 0,
          bb: player.logParams.bc - 1 > 0 ? 1 : 0,
          bu_acu_t: player.logParams.bu_acu_t,
          pt: player.logParams.vt < player.logParams.pt ? player.logParams.vt : player.logParams.pt,
          vt: player.logParams.vt,
          vd: player.logParams.vd * 1000,
          watch_dur: parseFloat((watch_dur * 1000).toFixed(3)),
          cur_play_pos: parseFloat((player.currentTime * 1000).toFixed(3)),
          lt
        }
        tracker('d', obj)
      }
    }
    if (sniffer.device === 'pc') {
      window.addEventListener('beforeunload', userLeave, false)
    } else if (sniffer.device === 'mobile') {
      window.addEventListener('pagehide', userLeave, false)
    }
    player.on('routechange', userLeave)

    player.on('ended', function () {
      let played = player.video.played
      let watch_dur = computeWatchDur(player.logParams.played)
      let et = new Date().getTime()
      let obj = {
        url: player.logParams.pluginSrc ? player.logParams.pluginSrc : player.logParams.playSrc,
        vid: player.config.vid,
        bc: player.logParams.bc - 1 > 0 ? player.logParams.bc - 1 : 0,
        bb: player.logParams.bc - 1 > 0 ? 1 : 0,
        bu_acu_t: player.logParams.bu_acu_t,
        pt: player.logParams.vt < player.logParams.pt ? player.logParams.vt : player.logParams.pt,
        vt: player.logParams.vt,
        vd: player.logParams.vd * 1000,
        watch_dur: parseFloat((watch_dur * 1000).toFixed(3)),
        cur_play_pos: parseFloat((player.currentTime * 1000).toFixed(3)),
        et
      }
      tracker('c', obj)
    })
    player.on('urlchange', function () {
      let played = player.video.played
      let watch_dur = computeWatchDur(player.logParams.played)
      let lt = new Date().getTime()
      let obj = {
        url: player.logParams.pluginSrc ? player.logParams.pluginSrc : player.logParams.playSrc,
        vid: player.config.vid,
        bc: player.logParams.bc - 1 > 0 ? player.logParams.bc - 1 : 0,
        bb: player.logParams.bc - 1 > 0 ? 1 : 0,
        bu_acu_t: player.logParams.bu_acu_t,
        pt: player.logParams.vt < player.logParams.pt ? player.logParams.vt : player.logParams.pt,
        vt: player.logParams.vt,
        vd: player.logParams.vd * 1000,
        watch_dur: parseFloat((watch_dur * 1000).toFixed(3)),
        cur_play_pos: parseFloat((player.currentTime * 1000).toFixed(3)),
        lt
      }
      tracker('d', obj)
    })
    player.on('error', function (err) {
      let played = player.video.played
      let watch_dur = computeWatchDur(player.logParams.played)
      let et = new Date().getTime()
      let obj = {
        url: player.logParams.pluginSrc ? player.logParams.pluginSrc : player.logParams.playSrc,
        vid: player.config.vid,
        bc: player.logParams.bc - 1 > 0 ? player.logParams.bc - 1 : 0,
        bb: player.logParams.bc - 1 > 0 ? 1 : 0,
        bu_acu_t: player.logParams.bu_acu_t,
        pt: player.logParams.vt < player.logParams.pt ? player.logParams.vt : player.logParams.pt,
        vt: player.logParams.vt,
        vd: player.logParams.vd * 1000,
        watch_dur: parseFloat((watch_dur * 1000).toFixed(3)),
        err_msg: err.errd.msg,
        line: err.errd.line,
        et,
        cur_play_pos: parseFloat((player.currentTime * 1000).toFixed(3))
      }
      tracker('e', obj)
    })
  }
}

Player.install('logger', logger)
