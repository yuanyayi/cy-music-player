var pro, vol;
let songsList = [{
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
  let _this = this
  this.songsList = songsList
  // ------------------- init --------------------- //
  this.player = $(domEl)
  this.audio = this.player.find('audio')[0]
  // info
  this.infoPanel = this.player.find('.infoPanel')
  // controllers
  this.controller = this.player.find('.controllerPanel')
  // 播放Btn
  this.playBtn = this.controller.children('i.play')
  // 暂停Btn
  this.pauseBtn = this.controller.children('i.pause')
  // 切换Btn
  this.nextBtn = this.controller.children('i.next')
  this.prevBtn = this.controller.children('i.prev')
  // 播放列表Btn
  this.controller.children('i.menu').on('click', () => {
    this.playListWrap.toggle()
  })
  // 声音和静音Btn
  this.soundBtn = this.controller.children('i.sound')
  this.muteBtn = this.controller.children('i.mute')
  // volumeProgress
  this.volumeProgress = new ProgressBar(this.controller.find('.volume'), (value) => {
    _this.volume(value)
  })
  // songProgress
  this.songProgress = new ProgressBar(this.player.find('.progress'), (value) => {
    _this.currentTime(Math.floor(value * this.audio.duration))
  })
  this.nowText = this.player.find('.time.now')
  // playList
  this.playListWrap = this.player.find('.playListWrap')
  this.playList = this.player.find('.playList')
  addSongsToList(this.playList)
  // playing now
  this.playingSongIndex = 0
  // ------------------- 基本方法 --------------------- //
  // 改变音量
  this.volume = (value) => {
    if (value >= 0 && value <= 1) {
      this.audio.volume = value
    }
    return this.audio.volume
  }
  this.volume(0.5)
  // 媒体进度
  this.currentTime = (value) => {
    if (typeof value === 'number') {
      // 输入一个小数：
      if (value > 0 && value < 1) {
        this.audio.currentTime = Math.floor(this.audio.duration * value)
      }
      // 输入一个整数：
      else if (value <= this.audio.duration) {
        this.audio.currentTime = Math.floor(value)
      }
    }
    return this.audio.currentTime
  }
  // 进度条计时器
  this._playTimer = {
    playingTimer: { a: 1 },
    start: () => {
      this._playTimer.playingTimer = setInterval(() => {
        let d = this.audio.duration
        // 改变进度条的长度
        this.songProgress.moveProgressBarByRate(Math.round(this.audio.currentTime / d * 100) / 100)
        this.nowText.text(Math.round(this.audio.currentTime))
      }, 1000)
    },
    clear: () => {
      clearInterval(this._playTimer.playingTimer)
    }
  }
  // 播放
  this._play = () => {
    this.playBtn.hide()
    this.pauseBtn.show()
    this.audio.play()
    this._playTimer.start()
  }
  this.playBtn.on('click', this._play)
  // 暂停
  this._pause = () => {
    this.pauseBtn.hide()
    this.playBtn.show()
    this.audio.pause()
    this._playTimer.clear()
  }
  this.pauseBtn.on('click', this._pause)
  // 停止
  this._stop = () => {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.pauseBtn.hide()
    this.playBtn.show()
    this._playTimer.clear()
    this.songProgress.moveProgressBarByLength(0)
  }
  // 上一下一
  this._prev = () => {
    this.playingSongIndex = this.playingSongIndex - 1 >= 0 ? this.playingSongIndex - 1 : this.songsList.length - 1
    this._changeSong()
  }
  this.prevBtn.on('click', this._prev)
  this._next = () => {
    this.playingSongIndex = this.playingSongIndex + 1 < this.songsList.length ? this.playingSongIndex + 1 : 0
    this._changeSong()
  }
  this.nextBtn.on('click', this._next)
  // 切换歌曲
  this._changeSong = (i) => {
    if (i || i === 0) { this.playingSongIndex = i }
    let song = this.songsList[this.playingSongIndex]
    // info
    this.infoPanel.find('.songImage img').attr('src', './asset/images/' + song.img)
    this.infoPanel.find('.song').text(song.songName)
    this.infoPanel.find('.singer').text(song.singerName)
    // audio
    this._stop()
    $(this.audio).find('source').attr('src', './asset/songs/' + song.src)
    this.audio.load()
    this._stop()
  }
  this.playList.on('click', 'li', (e) => {
    this._changeSong($(e.currentTarget).index())
  })
  // ------------------- keyboard actions --------------------- //
  $('body').on('keyup', (e) => {
    if (e.keyCode === 32) {
      this.playBtn.is(':hidden') ? this._pause() : this._play()
    }
  })
  // -------------------------------- library ---------------------------------- //
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

  function ProgressBar($target, onValueChange) {
    // init
    this.box = $target
    this.bar = $target.find('.bar')
    this.boxW = this.box.width()
    this.value = Math.round(this.bar.width() / this.boxW * 100) / 100
    // changeValue
    this.moveProgressBarByLength = (len) => {
      if (len < 0) {
        len = 0
      } else if (len > this.boxW) {
        len = this.boxW - 5
      }
      this.bar.width(len + 5)
      this.temp = Math.round(len / this.boxW * 100) / 100
    }
    this.moveProgressBarByRate = (rate) => {
      if (rate < 0 || rate > 1) return false
      this.bar.width(this.boxW * rate)
      this.temp = rate
    }
    this.setProgress = () => {
      if(this.temp == this.value) return false
      this.oldValue = this.value
      this.value = this.temp
      this.onValueChange(this.value)
    }
    this.onValueChange = onValueChange
    this.box.on('click', e => {
      let len = (e.clientX - this.box.offset().left)
      this.moveProgressBarByLength(len)
      this.setProgress()
    })
    this.box.on('mousedown', e => {
      $(document).on('mousemove', e => {
        let len = (e.clientX - this.box.offset().left)
        this.moveProgressBarByLength(len)
      })
      $(document).on('mouseup', e => {
        $(document).off('mousemove')
        $(document).off('mouseup')
        this.setProgress()
      })
    })
    return this
  }
  return this
}