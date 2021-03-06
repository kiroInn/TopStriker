import {Entity} from './entity'
import {Sprite} from './sprite'
import {IMAGE_MANAGER} from './const'
import * as TYPES from '../../../shared/message'

const DISTANCE = 500

export class Ball extends Entity {
  constructor ({id, x, y}) {
    super(id, TYPES.ENTITIES.BALL)
    this.cellIndex = 0
    this.kickDistance = 0
    this.speed = 1
    this.moveSpeed = 0
    this.status = TYPES.STATUS.BALL.IDLE
    this.kickAngle = 90
    this.lastTime = new Date()
    this.setPosition(x, y)
    this.setSprite(new Sprite(IMAGE_MANAGER.BALL))
  }

  kick (angle) {
    if (this.status === TYPES.STATUS.BALL.DRIBBLED) {
      this.status = TYPES.STATUS.BALL.FLIGHT
      this.moveSpeed = 0
      this.kickDistance = DISTANCE
      this.kickAngle = angle
    }
  }

  canMove () {
    return this.kickDistance > 0
  }

  move () {
    if (this.canMove()) {
      if (this.kickDistance > DISTANCE / 2) {
        this.moveSpeed += this.speed * Math.cos(this.kickAngle * (Math.PI / 180));
        this.x += this.moveSpeed
        this.kickDistance -= Math.abs(this.moveSpeed)
      } else {
        this.moveSpeed -= this.speed
        if (this.moveSpeed < 0) this.moveSpeed = 1
        this.x += this.moveSpeed
        this.kickDistance -= Math.abs(this.moveSpeed)
      }
      this.updateStatus()
    }
  }

  updateStatus () {
    if (this.kickDistance <= 0) this.status = TYPES.STATUS.BALL.IDLE
  }
}