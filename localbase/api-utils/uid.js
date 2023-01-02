import { v1 } from 'uuid'

export default function (){
  const unordered = v1();
  return unordered.substring(14,18) + unordered.substring(9,13) + unordered.substring(0,8) + unordered.substring(19,23) + unordered.substring(24, unordered.length);
}