export default function Levenshtein(a, b) {
  var n = a.length;
  var m = b.length;

  // matriz de cambios mínimos
  var d = [];

  // si una de las dos está vacía, la distancia
  // es insertar todas las otras
  if(n == 0)
      return m;
  if(m == 0)
      return n;

  // inicializamos el peor caso (insertar todas)
  for(var i = 0; i <= n; i++)
      (d[i] = [])[0] = i;
  for(var j = 0; j <= m; j++)
      d[0][j] = j;

  // cada elemento de la matriz será la transición con menor coste
  for(var i = 1, I = 0; i <= n; i++, I++)
    for(var j = 1, J = 0; j <= m; j++, J++)
        if(b[J] == a[I])
            d[i][j] = d[I][J];
        else
            d[i][j] = Math.min(d[I][j], d[i][J], d[I][J]) + 1;
  // el menor número de operaciones
  return d[n][m];
}