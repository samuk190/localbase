function sonStrings(valor1, valor2) {
  return (typeof valor1 === 'string' && typeof valor2 === 'string');
}

function cumple(objeto, criterio) {
  for (const [clave, valor ] of Object.entries(criterio)) {
    //const [clave, valor] = Object.entries(criterio)[0]; // Extraer la clave y el valor del criterio

    switch (true) {
      case clave.endsWith('_eq') || !clave.includes('_'):
        if (objeto[clave.replace('_eq', '')] !== valor) {
          return false;
        }
        break;

      case clave.endsWith('_lt'):
        if (!(objeto[clave.replace('_lt', '')] < valor)) {
          return false;
        }
        break;

      case clave.endsWith('_gt'):
        if (!(objeto[clave.replace('_gt', '')] > valor)) {
          return false;
        }
        break;

      case clave.endsWith('_lte'):
        if (!(objeto[clave.replace('_lte', '')] <= valor)) {
          return false;
        }
        break;

      case clave.endsWith('_gte'):
        if (!(objeto[clave.replace('_gte', '')] >= valor)) {
          return false;
        }
        break;

      case clave.endsWith('_contains'):
        if(sonStrings(objeto[clave.replace('_contains', '')], valor)){
          const valorObjeto = String(objeto[clave.replace('_contains', '')]).toLowerCase();
          if (!(valorObjeto.includes(valor.toLowerCase()))) {
            return false;
          }
        }else if (!(objeto[clave.replace('_contains', '')].includes(valor))) {
          return false;
        }
        break;

      case clave.endsWith('_startsWith'):
        if (
          !objeto[clave.replace('_startsWith', '')].startsWith(valor)
        ) {
          return false;
        }
        break;

      case clave.endsWith('_endsWith'):
        if (!objeto[clave.replace('_endsWith', '')].endsWith(valor)) {
          return false;
        }
        break;

      case clave.endsWith('_in'):
        if (!valor.includes(objeto[clave.replace('_in', '')])) {
          return false;
        }
        break;

      case clave.endsWith('_nin'):
        if (valor.includes(objeto[clave.replace('_nin', '')])) {
          return false;
        }
        break;

      case clave.endsWith('_neq'):
        if (objeto[clave.replace('_neq', '')] === valor) {
          return false;
        }
        break;

      case clave.endsWith('_null'):
        if (objeto[clave.replace('_null', '')] !== null) {
          return false;
        }
        break;

      case clave.endsWith('_notNull'):
        if (objeto[clave.replace('_notNull', '')] === null) {
          return false;
        }
        break;

      case clave.endsWith('_between'):
        const [min, max] = valor;
        const valorObjeto = objeto[clave.replace('_between', '')];
        if (valorObjeto < min || valorObjeto > max) {
          return false;
        }
        break;

      default:
        // Manejar criterios desconocidos
        break;
    }
  }

  return true; // Si pasa todos los criterios, retorna true
}

export default function cumpleCriterios(objeto){
  for (const criterio of this.whereArguments) {
    if(cumple(objeto, criterio)) return true;
  }
}