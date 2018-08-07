import _ from 'lodash'
import {Striker} from './striker'
import {Renderer} from './renderer'
import {requestAnimationFrame, Util} from './util'
import {Connect} from './connect'
import {Ball} from './ball'
import {Updater} from './updater'
import * as TYPES from '../../../shared/message'
import {IMAGES, KEY_MAP} from './const'
import {Map} from './map'

export class Game {
  constructor () {
    this.keysDown = {}
    this.imager = {}
    this.striker = null
    this.strikers = []
    this.ball = {}
    this.connecter = null
    this.updater = new Updater(this)
    this.renderer = new Renderer(this)
  }

  setPlayer ({id, name}) {
    this.player = {id, name}
  }

  run () {
    this.renderer.run()
    this.initListener()
    this.connect()
    this.tick()
  }

  connect () {
    this.connecter = new Connect()
    this.connecter.connect()
    this.connecter.onConnect(() => {
      this.connecter.init(this.player)
      this.receiveData()
    })
  }

  receiveData () {
    this.connecter.onInit(({strikers, ball}) => {
      let values = []
      _.each(strikers, value => {
        let striker = new Striker(value)
        if (_.get(value, 'id') === this.player.id) this.striker = striker
        values.push(striker)
      })
      this.strikers = values
      this.ball = new Ball({...ball, id: Util.guid()})
    })

    this.connecter.onMove(data => {
      let {id, x, y, type, orientation} = data
      const value = Map.getAbsolutePosition(x, y)
      if (type === TYPES.ENTITIES.STRIKER) {
        if (id === this.striker.id) return true
        _.each(this.strikers, item => {
          if (item.id === id) {
            item.orientation = orientation
            item.status = TYPES.STATUS.STRIKER.RUNNING
            item.setPosition(value.x, value.y)
          }
        })
      } else if (type === TYPES.ENTITIES.BALL) {
        if (id === this.ball.id) return true
        this.ball.setPosition(value.x, value.y)
      }
    })
  }

  tick () {
    this.updater.update()
    this.renderer.render()
    requestAnimationFrame(() => this.tick())
  }

  canDribbling () {
    if (this.ball.status === TYPES.STATUS.BALL.IDLE) {
      let isOnRight = this.striker.x + Map.getAbsoluteWidth(this.striker.sprite.width) >= this.ball.x &&
        this.striker.x <= this.ball.x &&
        this.striker.y <= this.ball.y &&
        this.striker.y + Map.getAbsoluteWidth(this.striker.sprite.height) >= this.ball.y
      let isOnLeft = this.striker.x <= this.ball.x + Map.getAbsoluteWidth(this.ball.sprite.width) &&
        this.striker.x + Map.getAbsoluteWidth(this.striker.sprite.width) >= this.ball.x + Map.getAbsoluteWidth(this.ball.sprite.width) &&
        this.ball.y + Map.getAbsoluteWidth(this.ball.sprite.height) >= this.striker.y &&
        this.ball.y + Map.getAbsoluteWidth(this.ball.sprite.height) <= this.striker.y + Map.getAbsoluteWidth(this.striker.sprite.height)
      return isOnLeft || isOnRight
    }
    return this.ball.status === TYPES.STATUS.BALL.DRIBBLED
  }


  setImage (k, v) {
    this.imager[k] = v
  }

  initListener () {
    window.addEventListener('keydown', e => {
      this.keysDown[e.keyCode] = true
      this.striker.status = TYPES.STATUS.STRIKER.RUNNING
      if (KEY_MAP.KICK === e.keyCode) this.ball.kick()
    }, false)

    window.addEventListener('keyup', (e) => {
      delete this.keysDown[e.keyCode]
      this.striker.status = TYPES.STATUS.STRIKER.IDLE
    }, false)
  }

  loadAssets () {
    return new Promise(resolve => {
      IMAGES.forEach((key, i) => {
        import(`../img/common/${key}.png`).then(value => {
          let img = new Image()
          img.src = value.default
          img.onload = () => {
            this.setImage(key, img)
            if (i === IMAGES.length - 1) resolve()
          }
        })
      })
    })
  }
}