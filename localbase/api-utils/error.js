import logger from '../utils/logger'

export default function error(message) {
  this.reset()
  logger.error(message)
  return (`Error: ${ message }`)
}