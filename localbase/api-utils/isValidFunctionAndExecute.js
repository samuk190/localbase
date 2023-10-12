          
const incrementFormater = `function(valor){if(typeofvalor!=='number')returnvalor;returnvalor+cuanto;}`;
const arrayUnionFormater = `function(array){if(!Array.isArray(array))returnarray;varindex=array.findIndex(function(element){returnBun.deepEquals(element,data,true);});if(index===-1){array.push(data);}returnarray;}`;
const arrayRemoveFormater = 'function(array){if(!Array.isArray(array)){returnarray;}varindex=array.findIndex(function(element){returnBun.deepEquals(element,data,true);});if(index!==-1){array.splice(index,1);}returnarray;}';

const incrementExecute = ( key,increment, docOldData) => {
  const old = JSON.parse(JSON.stringify(docOldData));
  if (old[key] === undefined) {
    old[key] = 0;
  }

  const cuanto = old[key];
  return increment(cuanto);
}

const arrayExecute = ( key, arrayFuntion, docOldData) => {
  const old = JSON.parse(JSON.stringify(docOldData));
  if (old[key] === undefined) {
    old[key] = [];
  }

  const data = old[key];
  return arrayFuntion(data);
}


export default (docNewData, docOldData) => {

  try {
    for (const key in docNewData) {
      if (docNewData.hasOwnProperty(key) && typeof docNewData[key] === 'function') {
        const formattedFunction = docNewData[key].toString().replace(/\s/g, '');
        if (formattedFunction === incrementFormater || formattedFunction === arrayUnionFormater || formattedFunction === arrayRemoveFormater) {

          if (formattedFunction === incrementFormater) {
            docNewData[key] = incrementExecute(key, docNewData[key], docOldData);
          } else if (formattedFunction === arrayUnionFormater) {
            docNewData[key] = arrayExecute(key, docNewData[key], docOldData);
          } else if (formattedFunction === arrayRemoveFormater) {
            docNewData[key] = arrayExecute(key, docNewData[key], docOldData);
          }
        } else {
          throw new Error(`La propiedad ${key} es una función pero no es Rebase.increment o Rebase.arrayUnion o Rebase.arrayRemove`)
        }
      }
    }
    return docNewData
  } catch (error) {
    throw new Error(`Error en la función isValidFuntion: ${error.message}`)
  }
}