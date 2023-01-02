export default function (value){
  let keys = []
  Object.keys(value).forEach(async k => {
    if (typeof value[k] === 'string' && value[k].length < 200) {
      if (isNaN(Number(value[k]))) {
        keys.push(k)
      }
    }
  });
  let str = ''
  keys.forEach(k2 => str += `${value[k2]} `);
  return str.trimEnd();
}