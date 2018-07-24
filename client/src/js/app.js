import {Util} from './util'
import {DOM} from './dom'
import {Game} from './game'
import {IMAGES} from './const'

export class App {
  constructor () {
    this.userContainer = document.querySelector('#user')
    this.userNameInput = document.querySelector('#user input')
    this.userNameBtn = document.querySelector('#user button')
    this.roomContainer = document.querySelector('#room')
    this.roomNumberInput = document.querySelector('#room input')
    this.roomNumberBtn = document.querySelector('#room button')
    this.game = new Game()
    this.init()
  }

  init () {
    DOM.hide(this.roomContainer)
    DOM.hide(this.userContainer)
    document.addEventListener('DOMContentLoaded', () => {
      this.userNameBtn.addEventListener('click', () => this.selectUser())
      this.roomNumberBtn.addEventListener('click', () => this.selectRoom())
    })
    window.matchMedia("(orientation:portrait)").addListener(function () {
      location.reload()
    })

    this.loadImages().then(() => {
      let striker = {id: Util.guid(), name: 'KIRO'}
      this.game.connect(striker)
    })
  }

  selectUser () {
    let userName = this.userNameInput.value
    if (!userName) {
      this.userNameInput.focus()
      return false
    }
    DOM.hide(this.userContainer)
    DOM.show(this.roomContainer)
  }

  selectRoom () {
    let number = this.roomNumberInput.value
    if (!number) {
      this.roomNumberInput.focus()
      return false
    }
    DOM.hide(this.roomContainer)
    this.game.setUp({id: Util.guid(), name: 'Kiro'})
    this.game.run()
  }

  loadImages () {
    return new Promise(resolve => {
      IMAGES.forEach((key, i) => {
        import(`../img/common/${key}.png`).then(value => {
          let img = new Image()
          img.src = value.default
          img.onload = () => {
            this.game.setImage(key, img)
            if (i === IMAGES.length - 1) resolve()
          }
        })
      })
    })
  }

}

new App()