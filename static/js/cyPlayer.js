let songsList = [ {
  songName: 'You Are My Everything',
  singerName: 'Lexington Bridge',
  src: 'You Are My Everything.m4a',
  img: 'lexington-bridge-15.jpeg',
},{
  songName: 'Wildest Dreams',
  singerName: 'Taylor Swift',
  src: 'Wildest Dreams.m4a',
  img: 'taylor-swift-1989-album-cover-and-promo-pictures-2014-_2.jpg',
}, {
  songName: 'Clean',
  singerName: 'Taylor Swift',
  src: 'Clean.m4a',
  img: 'taylor-swift-1989-album-cover-and-promo-pictures-2014-_2.jpg',
}, {
  songName: 'Look What You Made Me Do',
  singerName: 'Taylor Swift',
  src: 'Taylor+Swift+-+Look+What+You+Made+Me+Do.mp3',
  img: 'taylor-swift-look-what-you-made-me-do-screenshot-2017-billboard-1548.jpg',
}, {
  songName: 'Buring',
  singerName: 'Maria Arredondo',
  src: 'MariaArredondo.m4a',
  img: 'Maria-Arredondo.jpeg'
}]

function cyPlayer(domEl) {
  let $el = $(domEl)
  let _this = this
  // 设置实体参数
  this.songsList = songsList
  // ------------------- create DOMs --------------------- //
  this.player = $el.find('audio')[0]
  // info
  this.infoPanel = $el.find('.infoPanel')
  // controllers
  this.controller = $el.find('.controllerPanel')
  // 播放Btn
  this.playBtn = this.controller.children('i.play')
  // 暂停Btn
  this.pauseBtn = this.controller.children('i.pause')
  // 切换Btn
  this.nextBtn = this.controller.children('i.next')
  this.prevBtn = this.controller.children('i.prev')
  // 播放列表Btn
  this.menuBtn = this.controller.children('i.menu')
  // 音量控制
  this.soundBtn = this.controller.find('i.sound')
  this.muteBtn = this.controller.find('i.mute')
  this.volumeBox = this.controller.children('.volumeBox')
  // songProgress
  this.songProgress = new ProgressBar($el.find('.progress'), (value) => {
    _this.currentTime(Math.floor(value))
  }, this.player.duration)
  this.currentTimeText = $el.find('.time.current')
  this.durationTimeText = $el.find('.time.duration')
  // playList
  this.playListWrap = $el.find('.playListWrap')
  this.playList = $el.find('.playList')
  // playList Index
  this.songsIndexList = []
  for (let i = 0; i < this.songsList.length; i++) {
    this.songsIndexList.push(i)
  }
  // console.log(this.songsIndexList)
  // the song for now
  this.indexNow = 0

  // ------------------- DOM行为 --------------------- //
  // 播放列表
  this.menuBtn.on('click', () => {
    this.playListWrap.slideToggle()
  })
  // 静音
  this.soundBtn.on('click', () => {
    this.volumeBox.addClass('mute')
    this.savedVolume = this.volume()
    this.volume(0)
    this.volumeProgress.moveProgressBar(0)
    this.volumeProgress.setValue(0)
  })
  this.muteBtn.on('click', () => {
    this.volumeBox.removeClass('mute')
    this.volume(this.savedVolume)
    this.volumeProgress.moveProgressBar(this.savedVolume)
    this.volumeProgress.setValue(0)
  })
  // ------------------- 基本方法 --------------------- //
  this.player.onloadedmetadata = () => {
    this.currentTimeText.text(formatTime(0))
    this.durationTimeText.text(formatTime(this.player.duration))
    this.songProgress.changeMax(this.player.duration)
  }
  // 改变音量
  this.volume = (value) => {
    if (value >= 0 && value <= 1) {
      this.player.volume = value
    }
    return this.player.volume
  }
  // volumeProgress
  this.volumeProgress = new ProgressBar(this.controller.find('.volume'), (value) => {
    _this.volume(value)
    if (window.localStorage) {
      localStorage.cyVolume = _this.volume()
    }
  })
  // volume init
  let initVolume = window.localStorage && localStorage.cyVolume ? localStorage.cyVolume : 0.5
  this.volumeProgress.setProgressValue(initVolume)
  // 媒体进度
  this.currentTime = (value) => {
    if (typeof value === 'number') {
      // 输入一个小数：
      if (value > 0 && value < 1) {
        this.player.currentTime = Math.floor(this.player.duration * value)
      }
      // 输入一个整数：
      else if (value <= this.player.duration) {
        this.player.currentTime = Math.floor(value)
      }
    }
    return this.player.currentTime
  }
  // 进度条计时器
  this._playTimer = {
    playingTimer: { a: 1 },
    start: () => {
      let _this = this
      // 改变进度条
      function todo() {
        let d = _this.player.duration
        _this.songProgress._setProgressValue(_this.player.currentTime + 1)
        _this.currentTimeText.text(formatTime(_this.player.currentTime))
      }
      todo()
      this._playTimer.playingTimer = setInterval(todo, 1000)
    },
    clear: () => {
      clearInterval(this._playTimer.playingTimer)
    }
  }
  // 播放
  this._play = () => {
    this.player.play()
  }
  this.player.onplay = () => {
    if (this.playBtn.is(':visible')) {
      this.playBtn.hide()
      this.pauseBtn.show()
    }
    this._playTimer.start()
  }
  this.playBtn.on('click', this._play)
  // 暂停
  this._pause = () => {
    this.player.pause()
  }
  this.player.onpause = () => {
    if (this.playBtn.is(':hidden')) {
      this.pauseBtn.hide()
      this.playBtn.show()
    }
    this._playTimer.clear()
  }
  this.pauseBtn.on('click', this._pause)
  // 停止
  this._stop = () => {
    this.player.pause();
    this.player.currentTime = 0;
    this.songProgress.setProgressValue(0), false
  }
  // 上一下一
  this._prev = () => {
    this.indexNow = this.indexNow - 1 >= 0 ? this.indexNow - 1 : this.songsList.length - 1
    this._changeSong()
  }
  this.prevBtn.on('click', this._prev)
  this._next = () => {
    this.indexNow = this.indexNow + 1 < this.songsList.length ? this.indexNow + 1 : 0
    this._changeSong()
  }
  this.nextBtn.on('click', this._next)
  this.player.onended = () => {
    this._next()
  }
  // 切换歌曲
  this._changeSong = (i) => {
    if (i || i === 0) { this.indexNow = i }
    let song = this.songsList[this.songsIndexList[this.indexNow]]
    if (!song) return false
    this._stop()
    // info
    this.infoPanel.find('.songImage img').attr('src', './asset/images/' + song.img)
    this.infoPanel.find('.song').text(song.songName)
    this.infoPanel.find('.singer').text(song.singerName)
    // audio
    $(this.player).find('source').attr('src', './asset/songs/' + song.src)
    this.player.load()
  }
  this.playList.on('click', 'li', (e) => {
    this._changeSong($(e.currentTarget).index())
  })
  // ------------------- keyboard actions ------------------- //
  $('body').on('keyup', (e) => {
    // console.log(e.keyCode)
    const VOLUMEDIFF = 0.05
    // space
    if (e.keyCode === 32) {
      this.playBtn.is(':hidden') ? this._pause() : this._play()
    }
    // left
    if (e.keyCode === 37) {
      this._prev()
    }
    // up
    if (e.keyCode === 38) {
      let vol = this.volume() + VOLUMEDIFF <= 1 ? this.volume() + VOLUMEDIFF : 1
      this.volume(vol)
      this.volumeProgress.setProgressValue(vol, false)
    }
    // right
    if (e.keyCode === 39) {
      this._next()
    }
    // down
    if (e.keyCode === 40) {
      let vol = this.volume() - VOLUMEDIFF >= 0 ? this.volume() - VOLUMEDIFF : 0
      this.volume(vol)
      this.volumeProgress.setProgressValue(vol, false)
    }
  })
  // ------------------- init ------------------- // 
  addSongsToList(this.playList)
  this._changeSong(0)
  // ------------------- library ------------------- //
  // 生成播放列表
  function addSongsToList(playList) {
    var listStr = ''
    for (var i in songsList) {
      let song = songsList[i]
      listStr += `<li>
  <span class="songName">${song.songName.toUpperCase()}</span>
  <span class="singerName">--${song.singerName}</span>
</li>`
    }
    playList.append(listStr)
  }
  // 进度条类
  function ProgressBar($target, onValueChange, max, min) {
    // init
    this.box = $target
    this.bar = $target.find('.bar')
    this.boxW = this.box.width()
    this.min = min || 0
    this.max = max || 1
    this.value = Math.round(this.bar.width() / this.boxW * 100) / 100
    this.PIECE = this.boxW / (this.max - this.min)
    this.changeMax = (num) => {
      if (typeof num !== 'number') return false
      this.max = num
      this.PIECE = this.boxW / (this.max - this.min)
    }
    // UI
    this._moveProgressBar = (value, animate) => {
      this.temp = value
      let finalWidth = this.PIECE * (value - this.min)
      // 动画
      if (!animate || animate === '') {
        this.bar.width(finalWidth + 2)
      } else if (!!animate || animate == undefined) {
        this.bar.stop(true, true)
        this.bar.animate({ 'width': finalWidth + 2 }, 1000)
      }
      return true
    }
    // 设置数值
    this._setProgressValue = (value, animate) => {
      if (this.value === value) return false
      value = value < this.min ? this.min : value
      value = value > this.max ? this.max : value
      this.oldValue = this.value
      this.value = value
      this._moveProgressBar(value, animate)
      return value
    }
    // 外部设置：
    this.setProgressValue = (value, animate) => {
      this._setProgressValue(value, animate)
      this.onValueChange(this.value, this.oldValue)
    }
    // 点击行为
    this.onValueChange = onValueChange
    this.box.on('mousedown', e => {
      $(document).on('mousemove', e => {
        let len = e.clientX - this.box.offset().left
        let value = len / this.boxW * (this.max - this.min)
        this._moveProgressBar(value, false)
      })
      $(document).on('mouseup', e => {
        $(document).off('mousemove')
        $(document).off('mouseup')
        let len = e.clientX - this.box.offset().left
        let value = len / this.boxW * (this.max - this.min)
        this.setProgressValue(value, false)
      })
    })
    return this
  }

  function formatTime(seconds) {
    return Math.floor(seconds / 60) + ':' + ((seconds % 60) >= 10 ? '' : '0') + Math.floor(seconds % 60)
  }
  return this
}