export default function hamming(a,b){

  const alen = a.length
  const blen = b.length

  if(alen > 100 || blen > 100) return Infinity

  let dist = 0;
  function calculate(a,b){
    for (let i = 0; i < a.length; i += 1) {
       if (a[i] !== b[i]) {
          dist += 1;
       };
    };
  }

  if(alen == blen || alen > blen ) calculate(b,a);
  else calculate(a,b);

 return dist;
}
