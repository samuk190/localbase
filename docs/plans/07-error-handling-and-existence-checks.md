# Plano de Implementação 07: Tratamento Robusto de Erros, Checagem de Existência & Chaves em Filtros

**Issues Relacionadas:**
- [#16: While making a invalid query error is not handle in catch block](https://github.com/samuk190/localbase/issues/16)
- [#73: Check Item Does Not Exist?](https://github.com/samuk190/localbase/issues/73)
- [#14: Unable to fetch a collection key along with doc filter](https://github.com/samuk190/localbase/issues/14)
- [#20: Get collection failed when using own key](https://github.com/samuk190/localbase/issues/20)

---

## 1. Diagnóstico do Problema & Causa-Raiz

### A. Falhas Silenciosas e Inconsistência no Bloco `catch` (Issues #16 e #73)
Em `localbase/api/actions/get.js`:
```javascript
// Trecho em getDocumentByCriteria:
if (!collection.length) {
  logger.error.call(this, `Could not find Document in "${ collectionName }" collection with criteria: ${ JSON.stringify(docSelectionCriteria)}`)
  // A função termina sem retornar ou rejeitar! A Promise é resolvida com undefined!
}
```
E em `getDocumentByKey`:
```javascript
this.lf[collectionName].getItem(docSelectionCriteria).then((value) => {
  document = value
  if (document) {
    logger.log.call(...)
  } else {
    logger.error.call(...)
  }
  reset.call(this)
  return document // Retorna null ou undefined em uma Promise RESOLVIDA!
})
```
**Consequências:**
1. O desenvolvedor escreve `db.collection('users').doc('id_inexistente').get().catch(...)`, mas o `.catch()` **NUNCA é chamado**!
2. O console do navegador fica poluído com mensagens de erro vermelhas (`logger.error`) mesmo quando o app queria apenas verificar se um item já existia ou não.
3. Não há como o desenvolvedor distinguir facilmente entre um documento que não existe e uma falha de conexão/storage.

### B. Omissão de Chaves no Modo `{ keys: true }` com Filtro (Issue #14)
Na documentação do Localbase, `get({ keys: true })` promete retornar `{ key, data }`.
Porém, quando o usuário chama `.doc({ status: 'active' }).get({ keys: true })`, o método `getDocumentByCriteria()` só guarda `value`, descartando a `key`:
```javascript
this.lf[collectionName].iterate((value, key) => {
  if (isSubset(value, docSelectionCriteria)) {
    collection.push(value) // A chave é ignorada!
  }
})
```

---

## 2. Especificação da Solução Técnica

### A. Novo Método Fluente: `.exists()`
Oferecer uma API limpa, elegante e idiomática para responder à pergunta da Issue #73:
```javascript
const exists = await db.collection('user_data').doc(user.id).exists()
if (!exists) {
  // Executa lógica de primeiro acesso
}
```
**Implementação:**
- Para chave: verifica se `getItem(key) !== null` e retorna booleano `true`/`false`.
- Para critério: itera até o primeiro match e interrompe a busca imediatamente, retornando `true` (ou `false` se não encontrar nenhum). Não emite erro no console.

### B. Configuração de Estratégia de Erro: `rejectOnNotFound`
Permitir que a aplicação escolha o comportamento desejado:
```javascript
// Opção 1 (Padrão amigável): Retorna null limpo sem poluir o console com erro
db.config.debug = false // Silencia logs de erro para buscas esperadas

// Opção 2 (Modo RDBMS / Strict): Rejeita a Promise com erro específico
db.config.rejectOnNotFound = true

db.collection('users').doc('inexistente').get()
  .then(...)
  .catch(err => {
    // Agora o catch captura o DocumentNotFoundError!
  })
```

### C. Correção de Retorno de Chave em Documentos Filtrados
Em `getDocumentByCriteria()`:
```javascript
this.lf[collectionName].iterate((value, key) => {
  if (isSubset(value, docSelectionCriteria)) {
    collection.push(options.keys ? { key, data: value } : value)
  }
})
```
Garantir paridade entre coleções e documentos quando `{ keys: true }` for solicitado.

---

## 3. Arquivos Afetados & Mudanças de Código

1. **`localbase/api/actions/exists.js` (Novo Arquivo)**:
   - Implementação do método `.exists()`.

2. **`localbase/localbase.js`**:
   - Adicionar propriedade `this.config.rejectOnNotFound = false`.
   - Vincular `this.exists = exists.bind(this)`.

3. **`localbase/api/actions/get.js`**:
   - Ajustar `getDocumentByCriteria` e `getDocumentByKey` para:
     1. Retornar `null` limpo (quando `rejectOnNotFound == false`).
     2. Rejeitar com `new Error(...)` (quando `rejectOnNotFound == true`).
     3. Incluir `{ key, data }` se `options.keys === true`.

---

## 4. Plano de Testes & Validação

- [ ] Chamar `.doc('chave_inexistente').exists()` e validar retorno `false`.
- [ ] Chamar `.doc('chave_existente').exists()` e validar retorno `true`.
- [ ] Testar `.doc({ id: 999 }).get({ keys: true })` e verificar presença do campo `key` no objeto retornado.
- [ ] Habilitar `rejectOnNotFound = true` e validar que `.get()` aciona o bloco `.catch()`.
