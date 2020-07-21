import logger from '../utils/logger'

export default function success(message, data) {
  this.reset()
  logger.log(message, data)
  return (`Success: ${ message } ${ JSON.stringify(data) }`)
}