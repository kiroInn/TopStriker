import {FIELD_NUMBER, IMAGER} from './const'
import {CLIENT_HEIGHT, CLIENT_WIDTH} from './map'

export class Renderer {
  constructor (game) {
    this.game = game
    this.bgCanvas = document.querySelector('#background')
    this.bgContext = this.bgCanvas.getContext('2d')
    this.canvas = document.querySelector('#game')
    this.context = this.canvas.getContext('2d')
    this.canvas.width = this.bgCanvas.width = CLIENT_WIDTH
    this.canvas.height = this.bgCanvas.height = CLIENT_HEIGHT
    this.lastTime = 0
  }

  run () {
    this.drawBackground()
  }

  render () {
    this.clear()
    this.drawEntities()
    this.drawFps()
  }

  drawBackground () {
    let bgW = this.canvas.width / 10
    let bgH = this.canvas.height / 10
    let img = this.game.imager[IMAGER.BACKGROUND]
    this.drawPattern(img, bgW, bgH, this.bgContext)
  }

  drawEntities () {
    _.each(this.game.strikers, striker => {
      this.drawEntity(striker)
    })
    this.drawEntity(this.game.ball)
  }

  drawEntity (value) {
    if (_.get(value, 'sprite.cells.length') && _.isFunction(value.animation)) value.animation()
    if (!_.has(value, 'sprite.cells') || !_.get(value, 'sprite.cells').length) return false
    let cell = value.sprite.getCurrentCell()
    this.drawImage(value.sprite.image, cell.left, cell.top, cell.width, cell.height, value.x, value.y, this.canvas.width * cell.width / FIELD_NUMBER.WIDTH, this.canvas.height * cell.height / FIELD_NUMBER.HEIGHT)
    this.drawText(value.name, (value.x + value.nameOffsetX), (value.y + value.nameOffsetY), true, '#fcda5c', '#fcda5c')
  }

  drawPattern (img, w, h, context) {
    let tempCanvas = document.createElement('canvas'),
      tCtx = tempCanvas.getContext('2d')
    tempCanvas.width = w
    tempCanvas.height = h
    tCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h)

    // use getContext to use the canvas for drawing
    context.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height)
    context.fillStyle = context.createPattern(tempCanvas, 'repeat')

    context.beginPath()
    context.rect(0, 0, this.bgCanvas.width, this.bgCanvas.height)
    context.fill()
  }

  drawImage (image, sx, sy, sw, sh, dx, dy, dw, dh) {
    this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  }

  drawText (text, x, y, centered, color, strokeColor) {
    let ctx = this.context
    if (text && x && y) {
      ctx.save()
      if (centered) {
        ctx.textAlign = 'center'
      }
      ctx.strokeStyle = strokeColor || '#373737'
      ctx.lineWidth = 1
      ctx.strokeText(text, x, y)
      ctx.fillStyle = color || 'white'
      ctx.fillText(text, x, y)
      ctx.restore()
    }
  }

  drawFps () {
    let now = (+new Date())
    let fps = 1000 / (now - this.lastTime)
    this.lastTime = now
    this.context.fillStyle = 'pink'
    this.context.textAlign = 'end'
    this.context.fillText(fps.toFixed() + ' fps', this.canvas.clientWidth, 10)
  }

  clear () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}