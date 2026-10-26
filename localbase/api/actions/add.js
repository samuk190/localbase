import UUID from '../../utils/uuid'
import success from '../../api-utils/success'
import error from '../../api-utils/error'
import showUserErrors from '../../api-utils/showUserErrors'
import reset from '../../api-utils/reset'

export default function add(data, keyProvided) {
  // check for user errors
  if (!data) {
    this.userErrors.push('No data specified in add() method. You must use an object, e.g { id: 1, name: "Bill", age: 47 }')
  } else if (!(typeof data === 'object' && !(data instanceof Array))) {
    this.userErrors.push('Data passed to .add() must be an object. Not an array, string, number or boolean.')
  }

  // no user errors, do the add
  if (!this.userErrors.length) {
    const collectionName = this.collectionName
    const isAutoIncrement =
      (this.collectionOptions && this.collectionOptions[collectionName] && this.collectionOptions[collectionName].autoIncrement) ||
      (this.config && this.config.autoIncrement)

    const perform = async () => {
      let key = null

      if (keyProvided) {
        key = keyProvided
      } else if (isAutoIncrement) {
        const metaStore = this.lf['__localbase_metadata__']
        const seqKey = `seq:${collectionName}`
        let currentSeq = (await metaStore.getItem(seqKey)) || 0
        currentSeq += 1
        await metaStore.setItem(seqKey, currentSeq)
        key = currentSeq
      } else {
        key = UUID.generate()
      }

      await this.lf[collectionName].setItem(key, data)
      reset.call(this)
      return success.call(
        this,
        `Document added to "${collectionName}" collection.`,
        { key, data }
      )
    }

    const lockKey = `${collectionName}:add`
    return this.lock ? this.lock.acquire(lockKey, perform) : perform()
  } else {
    showUserErrors.call(this)
    return Promise.reject(error.call(this, 'Invalid arguments passed to .add()'))
  }
}
