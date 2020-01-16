'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xgplayerTransmuxerConstantEvents = require('xgplayer-transmuxer-constant-events');

var _xgplayerTransmuxerConstantEvents2 = _interopRequireDefault(_xgplayerTransmuxerConstantEvents);

var _xgplayerUtilsMse = require('xgplayer-utils-mse');

var _xgplayerUtilsMse2 = _interopRequireDefault(_xgplayerUtilsMse);

var _xgplayerTransmuxerBufferTrack = require('xgplayer-transmuxer-buffer-track');

var _xgplayerTransmuxerBufferTrack2 = _interopRequireDefault(_xgplayerTransmuxerBufferTrack);

var _xgplayerTransmuxerBufferPresource = require('xgplayer-transmuxer-buffer-presource');

var _xgplayerTransmuxerBufferPresource2 = _interopRequireDefault(_xgplayerTransmuxerBufferPresource);

var _xgplayerTransmuxerBufferXgbuffer = require('xgplayer-transmuxer-buffer-xgbuffer');

var _xgplayerTransmuxerBufferXgbuffer2 = _interopRequireDefault(_xgplayerTransmuxerBufferXgbuffer);

var _xgplayerTransmuxerLoaderFetch = require('xgplayer-transmuxer-loader-fetch');

var _xgplayerTransmuxerLoaderFetch2 = _interopRequireDefault(_xgplayerTransmuxerLoaderFetch);

var _xgplayerTransmuxerCodecCompatibility = require('xgplayer-transmuxer-codec-compatibility');

var _xgplayerTransmuxerCodecCompatibility2 = _interopRequireDefault(_xgplayerTransmuxerCodecCompatibility);

var _xgplayerTransmuxerRemuxMp = require('xgplayer-transmuxer-remux-mp4');

var _xgplayerTransmuxerRemuxMp2 = _interopRequireDefault(_xgplayerTransmuxerRemuxMp);

var _xgplayerUtilsCrypto = require('xgplayer-utils-crypto');

var _xgplayerUtilsCrypto2 = _interopRequireDefault(_xgplayerUtilsCrypto);

var _xgplayerTransmuxerDemuxM3u = require('xgplayer-transmuxer-demux-m3u8');

var _xgplayerTransmuxerDemuxM3u2 = _interopRequireDefault(_xgplayerTransmuxerDemuxM3u);

var _xgplayerTransmuxerDemuxTs = require('xgplayer-transmuxer-demux-ts');

var _xgplayerTransmuxerDemuxTs2 = _interopRequireDefault(_xgplayerTransmuxerDemuxTs);

var _xgplayerTransmuxerBufferPlaylist = require('xgplayer-transmuxer-buffer-playlist');

var _xgplayerTransmuxerBufferPlaylist2 = _interopRequireDefault(_xgplayerTransmuxerBufferPlaylist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LOADER_EVENTS = _xgplayerTransmuxerConstantEvents2.default.LOADER_EVENTS;
var REMUX_EVENTS = _xgplayerTransmuxerConstantEvents2.default.REMUX_EVENTS;
var DEMUX_EVENTS = _xgplayerTransmuxerConstantEvents2.default.DEMUX_EVENTS;
var HLS_EVENTS = _xgplayerTransmuxerConstantEvents2.default.HLS_EVENTS;
var CRYTO_EVENTS = _xgplayerTransmuxerConstantEvents2.default.CRYTO_EVENTS;
var HLS_ERROR = 'HLS_ERROR';

var HlsLiveController = function () {
  function HlsLiveController(configs) {
    _classCallCheck(this, HlsLiveController);

    this.configs = Object.assign({}, configs);
    this.url = '';
    this.baseurl = '';
    this.sequence = 0;
    this._playlist = null;
    this.retrytimes = this.configs.retrytimes || 3;
    this.preloadTime = this.configs.preloadTime;
    this.container = this.configs.container;
    this._m3u8lasttime = 0;
    this._timmer = setInterval(this._checkStatus.bind(this), 50);
    this._lastCheck = 0;
    this._player = this.configs.player;
    this.m3u8Text = null;
  }

  _createClass(HlsLiveController, [{
    key: 'init',
    value: function init() {
      // 初始化Buffer （M3U8/TS/Playlist);
      this._context.registry('M3U8_BUFFER', _xgplayerTransmuxerBufferXgbuffer2.default);
      this._context.registry('TS_BUFFER', _xgplayerTransmuxerBufferXgbuffer2.default);
      this._context.registry('TRACKS', _xgplayerTransmuxerBufferTrack2.default);

      this._playlist = this._context.registry('PLAYLIST', _xgplayerTransmuxerBufferPlaylist2.default)({ autoclear: true });
      this._context.registry('PRE_SOURCE_BUFFER', _xgplayerTransmuxerBufferPresource2.default);

      this._context.registry('COMPATIBILITY', _xgplayerTransmuxerCodecCompatibility2.default);

      // 初始化M3U8Loader;
      this._m3u8loader = this._context.registry('M3U8_LOADER', _xgplayerTransmuxerLoaderFetch2.default)({ buffer: 'M3U8_BUFFER', readtype: 1 });
      this._tsloader = this._context.registry('TS_LOADER', _xgplayerTransmuxerLoaderFetch2.default)({ buffer: 'TS_BUFFER', readtype: 3 });

      // 初始化TS Demuxer
      this._context.registry('TS_DEMUXER', _xgplayerTransmuxerDemuxTs2.default)({ inputbuffer: 'TS_BUFFER' });

      // 初始化MP4 Remuxer
      this._context.registry('MP4_REMUXER', _xgplayerTransmuxerRemuxMp2.default);

      // 初始化MSE
      this.mse = this._context.registry('MSE', _xgplayerUtilsMse2.default)({ container: this.container });
      this.initEvents();
    }
  }, {
    key: 'initEvents',
    value: function initEvents() {
      this.on(LOADER_EVENTS.LOADER_COMPLETE, this._onLoadComplete.bind(this));

      this.on(REMUX_EVENTS.INIT_SEGMENT, this.mse.addSourceBuffers.bind(this.mse));

      this.on(REMUX_EVENTS.MEDIA_SEGMENT, this.mse.doAppend.bind(this.mse));

      this.on(DEMUX_EVENTS.METADATA_PARSED, this._onMetadataParsed.bind(this));

      this.on(DEMUX_EVENTS.SEI_PARSED, this._handleSEIParsed.bind(this));

      this.on(DEMUX_EVENTS.DEMUX_COMPLETE, this._onDemuxComplete.bind(this));

      this.on(LOADER_EVENTS.LOADER_ERROR, this._onLoadError.bind(this));

      this.on(DEMUX_EVENTS.DEMUX_ERROR, this._onDemuxError.bind(this));

      this.on(REMUX_EVENTS.REMUX_ERROR, this._onRemuxError.bind(this));
    }
  }, {
    key: '_onError',
    value: function _onError(type, mod, err, fatal) {
      var error = {
        errorType: type,
        errorDetails: '[' + mod + ']: ' + err.message,
        errorFatal: fatal
      };
      this._player.emit(HLS_ERROR, error);
    }
  }, {
    key: '_onDemuxComplete',
    value: function _onDemuxComplete() {
      this.emit(REMUX_EVENTS.REMUX_MEDIA);
    }
  }, {
    key: '_onMetadataParsed',
    value: function _onMetadataParsed(type) {
      this.emit(REMUX_EVENTS.REMUX_METADATA, type);
    }
  }, {
    key: '_onLoadError',
    value: function _onLoadError(loader, error) {
      if (!this._tsloader.loading && !this._m3u8loader.loading && this.retrytimes > 1) {
        this.retrytimes--;
        this._onError(LOADER_EVENTS.LOADER_ERROR, loader, error, false);
      } else if (this.retrytimes <= 1) {
        this._onError(LOADER_EVENTS.LOADER_ERROR, loader, error, true);
        this.emit(HLS_EVENTS.RETRY_TIME_EXCEEDED);
        this.mse.endOfStream();
      }
    }
  }, {
    key: '_onDemuxError',
    value: function _onDemuxError(mod, error, fatal) {
      if (fatal === undefined) {
        fatal = true;
      }
      this._onError(LOADER_EVENTS.LOADER_ERROR, mod, error, fatal);
    }
  }, {
    key: '_onRemuxError',
    value: function _onRemuxError(mod, error, fatal) {
      if (fatal === undefined) {
        fatal = true;
      }
      this._onError(REMUX_EVENTS.REMUX_ERROR, mod, error, fatal);
    }
  }, {
    key: '_handleSEIParsed',
    value: function _handleSEIParsed(sei) {
      this._player.emit('SEI_PARSED', sei);
    }
  }, {
    key: '_onLoadComplete',
    value: function _onLoadComplete(buffer) {
      if (buffer.TAG === 'M3U8_BUFFER') {
        var mdata = void 0;
        try {
          this.m3u8Text = buffer.shift();
          mdata = _xgplayerTransmuxerDemuxM3u2.default.parse(this.m3u8Text, this.baseurl);
        } catch (error) {
          this._onError('M3U8_PARSER_ERROR', 'M3U8_PARSER', error, false);
        }

        if (!mdata) {
          if (this.retrytimes > 0) {
            this.retrytimes--;
            this._preload();
          } else {
            this.emit(HLS_EVENTS.RETRY_TIME_EXCEEDED);
            this.mse.endOfStream();
          }
          return;
        }

        try {
          this._playlist.pushM3U8(mdata, true);
        } catch (error) {
          this._onError('M3U8_PARSER_ERROR', 'PLAYLIST', error, false);
        }

        if (this._playlist.encrypt && this._playlist.encrypt.uri && !this._playlist.encrypt.key) {
          this._context.registry('DECRYPT_BUFFER', _xgplayerTransmuxerBufferXgbuffer2.default)();
          this._context.registry('KEY_BUFFER', _xgplayerTransmuxerBufferXgbuffer2.default)();
          this._tsloader.buffer = 'DECRYPT_BUFFER';
          this._keyLoader = this._context.registry('KEY_LOADER', _xgplayerTransmuxerLoaderFetch2.default)({ buffer: 'KEY_BUFFER', readtype: 3 });
          this.emitTo('KEY_LOADER', LOADER_EVENTS.LADER_START, this._playlist.encrypt.uri);
        } else {
          this._m3u8Loaded(mdata);
        }
      } else if (buffer.TAG === 'TS_BUFFER') {
        this.retrytimes = this.configs.retrytimes || 3;
        this._playlist.downloaded(this._tsloader.url, true);
        this.emit(DEMUX_EVENTS.DEMUX_START);
      } else if (buffer.TAG === 'DECRYPT_BUFFER') {
        this.retrytimes = this.configs.retrytimes || 3;
        this._playlist.downloaded(this._tsloader.url, true);
        this.emitTo('CRYPTO', CRYTO_EVENTS.START_DECRYPT);
      } else if (buffer.TAG === 'KEY_BUFFER') {
        this.retrytimes = this.configs.retrytimes || 3;
        this._playlist.encrypt.key = buffer.shift();
        this._crypto = this._context.registry('CRYPTO', _xgplayerUtilsCrypto2.default)({
          key: this._playlist.encrypt.key,
          iv: this._playlist.encrypt.ivb,
          method: this._playlist.encrypt.method,
          inputbuffer: 'DECRYPT_BUFFER',
          outputbuffer: 'TS_BUFFER'
        });
        this._crypto.on(CRYTO_EVENTS.DECRYPTED, this._onDcripted.bind(this));
      }
    }
  }, {
    key: '_onDcripted',
    value: function _onDcripted() {
      this.emit(DEMUX_EVENTS.DEMUX_START);
    }
  }, {
    key: '_m3u8Loaded',
    value: function _m3u8Loaded(mdata) {
      if (!this.preloadTime) {
        this.preloadTime = this._playlist.targetduration ? this._playlist.targetduration : 5;
      }
      if (this._playlist.fragLength > 0 && this._playlist.sequence < mdata.sequence) {
        this.retrytimes = this.configs.retrytimes || 3;
      } else {
        if (this.retrytimes > 0) {
          this.retrytimes--;
          this._preload();
        } else {
          this.emit(HLS_EVENTS.RETRY_TIME_EXCEEDED);
          this.mse.endOfStream();
        }
      }
    }
  }, {
    key: '_checkStatus',
    value: function _checkStatus() {
      if (this.retrytimes < 1 && new Date().getTime() - this._lastCheck < 10000) {
        return;
      }
      this._lastCheck = new Date().getTime();
      if (this.container.buffered.length < 1) {
        this._preload();
      } else {
        // Check for load.
        var currentTime = this.container.currentTime;
        var bufferstart = this.container.buffered.start(this.container.buffered.length - 1);
        if (this.container.readyState <= 2) {
          if (currentTime < bufferstart) {
            this.container.currentTime = bufferstart;
            currentTime = bufferstart;
          } else {
            this._preload();
          }
        }
        var bufferend = this.container.buffered.end(this.container.buffered.length - 1);
        if (currentTime < bufferend - this.preloadTime * 2) {
          this.container.currentTime = bufferend - this.preloadTime * 2;
        }
        if (bufferend > this.preloadTime * 2) {
          this.mse.remove(bufferend - this.preloadTime * 2);
        }
        if (currentTime > bufferend - this.preloadTime) {
          this._preload();
        }
      }
    }
  }, {
    key: '_preload',
    value: function _preload() {
      if (this._tsloader.loading || this._m3u8loader.loading) {
        return;
      }
      var frag = this._playlist.getTs();

      if (frag && !frag.downloaded && !frag.downloading) {
        this._playlist.downloading(frag.url, true);
        this.emitTo('TS_LOADER', LOADER_EVENTS.LADER_START, frag.url);
      } else {
        var preloadTime = this.preloadTime ? this.preloadTime : 0;
        var current = new Date().getTime();
        if ((!frag || frag.downloaded) && (current - this._m3u8lasttime) / 1000 > preloadTime) {
          this._m3u8lasttime = current;
          this.emitTo('M3U8_LOADER', LOADER_EVENTS.LADER_START, this.url);
        }
      }
    }
  }, {
    key: 'load',
    value: function load(url) {
      this.baseurl = _xgplayerTransmuxerDemuxM3u2.default.parseURL(url);
      this.url = url;
      this._preload();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      clearInterval(this._timmer);
      this.off(LOADER_EVENTS.LOADER_COMPLETE, this._onLoadComplete);
      this.off(REMUX_EVENTS.INIT_SEGMENT, this.mse.addSourceBuffers);
      this.off(REMUX_EVENTS.MEDIA_SEGMENT, this.mse.doAppend);
      // this.off(REMUX_EVENTS.REMUX_ERROR);
      this.off(DEMUX_EVENTS.METADATA_PARSED, this._onMetadataParsed);
      this.off(DEMUX_EVENTS.DEMUX_COMPLETE, this._onDemuxComplete);

      this.mse = null;
      this.m3u8Text = null;
    }
  }]);

  return HlsLiveController;
}();

exports.default = HlsLiveController;