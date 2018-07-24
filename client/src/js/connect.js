import io from 'socket.io-client'
import TYPES from '../../../shared/gametypes'

export class Connect {
  constructor () {
    this.socket = null
  }

  connect (striker) {
    this.socket = io('ws://localhost:3000')
    this.socket.on('connect', () => {
      console.log('connected ...')
      this.socket.emit(TYPES.EVENTS.INIT, {...striker})
    })
  }

  sendMove (striker) {
    this.socket.emit(TYPES.EVENTS.MOVE, striker)
  }

}