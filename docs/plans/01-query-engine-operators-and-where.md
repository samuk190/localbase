# Plano de Implementação 01: Query Engine Overhaul & Operadores de Comparação

**Issues Relacionadas:**
- [#86: Support Comparison Operators in Queries](https://github.com/samuk190/localbase/issues/86)
- [#28: can i use other operators like "<", ">", "!=" in my queries?](https://github.com/samuk190/localbase/issues/28)
- [#15: Orderby Two Values](https://github.com/samuk190/localbase/issues/15)
- [#25: Retrieve all results from DB where object value matches something?](https://github.com/samuk190/localbase/issues/25)

---

## 1. Diagnóstico do Problema & Causa-Raiz

### A. Limitação dos Filtros Atuais
No estado atual, o Localbase só suporta filtragem através de `db.collection('nome').doc(criteria)` ou `db.collection('nome').get({ filter: criteria })`.
Internamente, essa checagem é feita por `isSubset(superObj, subObj)` em `localbase/utils/isSubset.js`:
```javascript
export default function isSubset(superObj, subObj) {
  return Object.keys(subObj).every(ele => {
      if (typeof subObj[ele] == 'object') {
          return isSubset(superObj[ele], subObj[ele]);
      }
      return subObj[ele] === superObj[ele] // Apenas igualdade estrita ===
  });
}
```
Não há mecanismo para `>`, `>=`, `<`, `<=`, `!=`, `in`, `array-contains`, etc.

### B. O Problema de `orderBy` Monocampo e Ordenação Alfabética Incorreta
Em `localbase/api/actions/get.js`:
```javascript
collection.sort((a, b) => {
  if (!a.hasOwnProperty(orderByProperty) || !b.hasOwnProperty(orderByProperty)) return 0
  return a[orderByProperty].toString().localeCompare(b[orderByProperty].toString())
})
```
- Converte tudo para string (`toString().localeCompare`), fazendo com que números como `[2, 10, 1]` sejam ordenados alfabeticamente como `[1, 10, 2]`.
- Aceita apenas uma propriedade única, impedindo ordenações compostas (ex: `orderBy('lastName', 'asc').orderBy('firstName', 'asc')`).

### C. Confusão entre `.doc(criteria)` e Consultas de Coleção (Issue #25)
Quando o usuário executa `db.collection('skus').doc({ type: 'LONGBOARD' }).get()`, a engine trata como busca de *um único documento*, retornando `collection[0]`, ao invés de todos os documentos que atendem ao critério. Falta um método de consulta explícito como `.where()`.

---

## 2. Especificação da Solução Técnica

### A. Nova Sintaxe Fluente estilo Firestore: `.where()`
Permitir encadeamento de múltiplos critérios de busca:
```javascript
db.collection('users')
  .where('age', '>=', 18)
  .where('status', 'in', ['active', 'pending'])
  .orderBy('age', 'desc')
  .orderBy('name', 'asc')
  .get()
```

Operadores suportados:
- `==` ou `===`: Igualdade.
- `!=` ou `<>`: Desigualdade.
- `>` / `gt`: Maior que (compara tipos primitivos e datas).
- `>=` / `gte`: Maior ou igual.
- `<` / `lt`: Menor que.
- `<=` / `lte`: Menor ou igual.
- `in`: O valor da propriedade está contido no array fornecido.
- `not-in`: O valor da propriedade não está contido no array.
- `array-contains`: A propriedade é um array e contém o elemento.
- `array-contains-any`: A propriedade é um array e contém ao menos um dos elementos.
- `between`: Valor está entre `[min, max]` (inclusivo).

### B. Reformulação de `orderBy`
1. Permitir chamadas encadeadas (`.orderBy(prop, dir).orderBy(prop2, dir2)`) ou passagem de array de critérios.
2. Comparador com inferência de tipos:
   - Se ambos forem `number`, ordenar numericamente: `a - b`.
   - Se forem `Date` ou instâncias válidas de data, ordenar por timestamp: `a.getTime() - b.getTime()`.
   - Se forem `boolean`, ordenar booleano (`false < true`).
   - Se forem `string`, usar `localeCompare`.
   - Tratar `null` e `undefined` de forma previsível (colocá-los no início ou no fim).

---

## 3. Arquivos Afetados & Mudanças de Código

1. **`localbase/localbase.js`**:
   - Adicionar `this.queryFilters = []` e `this.orderByClauses = []`.
   - Importar e vincular `this.where = where.bind(this)`.

2. **`localbase/api/filters/where.js` (Novo Arquivo)**:
   ```javascript
   export default function where(field, operator, value) {
     if (!field || typeof field !== 'string') {
       this.userErrors.push('Field in .where() must be a valid string.')
       return this
     }
     if (value === undefined && operator !== undefined) {
       // Suporte à sintaxe abreviada where('field', value) -> default ==
       value = operator
       operator = '=='
     }
     const validOperators = ['==', '===', '!=', '<>', '>', '>=', '<', '<=', 'in', 'not-in', 'array-contains', 'array-contains-any', 'between']
     if (!validOperators.includes(operator)) {
       this.userErrors.push(`Invalid operator "${operator}" in .where(). Valid operators: ${validOperators.join(', ')}`)
       return this
     }
     this.queryFilters.push({ field, operator, value })
     return this
   }
   ```

3. **`localbase/utils/matcher.js` (Novo Arquivo)**:
   - Função utilitária pura `matchesFilter(record, filter)` com suporte a campos aninhados usando dot-notation (ex: `'profile.age'`).

4. **`localbase/api/filters/orderBy.js`**:
   - Modificar para acumular em `this.orderByClauses.push({ property, direction: direction || 'asc' })`.

5. **`localbase/api/actions/get.js`**:
   - Aplicar `queryFilters` durante a iteração do `localForage`.
   - Aplicar o comparator multi-chave ao invés de um único `.sort()`.

6. **`localbase/api-utils/reset.js`**:
   - Limpar `this.queryFilters = []` e `this.orderByClauses = []`.

---

## 4. Plano de Testes & Validação

- [ ] Testar `.where('age', '>', 20).get()` com números inteiros e decimais.
- [ ] Testar `.where('status', 'in', ['A', 'B']).get()`.
- [ ] Testar `.orderBy('priority', 'desc').orderBy('name', 'asc')`.
- [ ] Testar ordenação numérica: garantir que `[2, 10, 1]` vire `[1, 2, 10]`, e não `[1, 10, 2]`.
- [ ] Testar compatibilidade regressiva com `doc({ type: 'LONGBOARD' })`.
