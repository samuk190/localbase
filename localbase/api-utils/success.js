import logger from '../utils/logger'
import reset from '../api-utils/reset'

export default function success(message, data) {
  reset.call(this)
  logger.log.call(this, message, data)
  return  {
    success: true,
    message: message,
    data: data
  }
}
