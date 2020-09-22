export default function updateObject(obj/*, …*/) {
  for (var i=1; i<arguments.length; i++) {
      for (var prop in arguments[i]) {
          var val = arguments[i][prop];
          // if (typeof val == "object") // this also applies to arrays or null!
          //   updateObject(obj[prop], val);
          // else
          //    obj[prop] = val;
          obj[prop] = val;
      }
  }
  return obj;
}