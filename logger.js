let logger = {
  baseStyle: `
    padding: 2px 5px;
    background-color: #124F5C;
    border-radius: 4px;
    color: white; 
  `,
  colors: {
    log: '#124F5C',
    error: '#ed2939'
  },
  log(message, secondary) {
    let style = this.baseStyle + `background-color: ${ this.colors.log }`
    if (secondary) {
      console.log('%clocalbase', style, message, secondary)
    }
    else {
      console.log('%clocalbase', style, message)
    }
  },
  error(message, secondary) {
    let style = this.baseStyle + `background-color: ${ this.colors.error }`
    console.error('%clocalbase', style, message)
  }
}

export default logger