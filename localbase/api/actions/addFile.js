import UUID from 'ordered-uuid'
import success from '../../api-utils/success'
import error from '../../api-utils/error'
import showUserErrors from '../../api-utils/showUserErrors'

export default function addFile(data, filename, extension, keyProvided) {
  return new Promise((resolve, reject) => {
    // Validate user input
    if (!data) {
      this.userErrors.push('No data specified in addFile() method. You must pass a file or an object.')
    } else if (!(data instanceof File || data instanceof Blob)) {
      this.userErrors.push('The data parameter must be a valid File or Blob.')
    }

    if (!filename || typeof filename !== 'string') {
      this.userErrors.push('You must provide a valid filename (string).')
    }

    if (!extension || typeof extension !== 'string') {
      this.userErrors.push('You must provide a valid file extension (string).')
    }

    // Show errors if any exist
    if (this.userErrors.length) {
      showUserErrors.call(this)
      return reject(error.call(this, 'Failed to add the file due to invalid input.'))
    }

    let collectionName = this.collectionName
    let key = keyProvided || UUID.generate()

    // Convert file to Base64
    const reader = new FileReader()
    reader.readAsDataURL(data)

    reader.onload = () => {
      let fileData = {
        base64: reader.result,
        name: filename,
        extension: extension.startsWith('.') ? extension : `.${extension}`,
        type: data.type || 'application/octet-stream',
        size: data.size || 0,
      }

      // Save in IndexedDB
      this.lf[collectionName].setItem(key, fileData)
        .then(() => {
          resolve(success.call(this, `File "${filename}${fileData.extension}" added to the "${collectionName}" collection.`, { key, fileData }))
        })
        .catch(() => {
          reject(error.call(this, `Failed to add file "${filename}${fileData.extension}" to the "${collectionName}" collection.`))
        })
    }

    reader.onerror = () => {
      reject(error.call(this, 'Error converting the file to Base64.'))
    }
  })
}
