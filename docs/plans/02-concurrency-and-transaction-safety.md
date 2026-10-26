# Plano de Implementação 02: Concorrência & Segurança Transacional em `update()`, `set()` e `delete()`

**Issues Relacionadas:**
- [#47: Update method overwrites variables it's not supposed to overwrite](https://github.com/samuk190/localbase/issues/47)
- [#24: My delete isn't working / Out of sync state](https://github.com/samuk190/localbase/issues/24)

---

## 1. Diagnóstico do Problema & Causa-Raiz

### A. Condição de Corrida (Race Condition) no `update()`
Na Issue #47, o usuário relata que ao disparar dois updates consecutivos no mesmo documento:
```javascript
db.collection('hey_yo').doc({ id: "human" }).update({ age: 16 });
db.collection('hey_yo').doc({ id: "human" }).update({ gender: "female" });
```
O segundo update sobrescreve e reverte o valor de `age` para o estado antigo (14)!

**Por que isso acontece?**
Em `localbase/api/actions/update.js`:
```javascript
this.updateDocumentByKey = () => {
  let newDocument = {}
  this.lf[collectionName].getItem(docSelectionCriteria).then(value => {
    newDocument = updateObject(value, docUpdates)
    this.lf[collectionName].setItem(docSelectionCriteria, newDocument)
    resolve(...)
  })
}
```
1. `getItem` e `setItem` no IndexedDB são assíncronos.
2. Quando a 2ª chamada executa, ela inicia um novo `getItem` antes que a 1ª chamada tenha gravado com `setItem`.
3. Ambas as chamadas leem o mesmo documento original `{ age: 14, gender: "male" }`.
4. A 1ª chamada grava `{ age: 16, gender: "male" }`.
5. A 2ª chamada grava `{ age: 14, gender: "female" }`, atropelando o `age: 16`!

### B. Mutabilidade Global de Estado da Instância (`this.collectionName`, `this.docSelectionCriteria`)
A classe `Localbase` armazena o contexto da query na própria instância (`this`). Se duas operações assíncronas acontecem em coleções ou documentos diferentes quase ao mesmo tempo, uma chamada sobrescreve `this.collectionName` da outra antes da conclusão da Promise!

### C. Deleção Não Atômica com `forEach` Assíncrono (Issue #24)
Em `localbase/api/actions/delete.js`:
```javascript
keysForDeletion.forEach((key, index) => {
  this.lf[collectionName].removeItem(key).then(() => {
    if (index === (keysForDeletion.length - 1)) {
      resolve(...)
    }
  })
})
```
O array de deleção usa `forEach` assíncrono. Como Promises não garantem ordem de término, se o último item terminar antes dos anteriores, o método resolve precocemente, enquanto itens ainda estão sendo apagados. Se ocorrer erro em um item, `reject` é invocado enquanto outros continuam executando.

---

## 2. Especificação da Solução Técnica

### A. Fila Sequencial de Operações por Chave de Documento (Mutex / Lock Assíncrono)
Implementar um gerenciador de fila assíncrona por documento (`DocumentLock`):
- Chave de lock: `${dbName}:${collectionName}:${documentKey}`.
- Cada operação de escrita (`update`, `set`, `delete`) no mesmo documento entra em uma Promise Chain exclusiva daquela chave, garantindo que `getItem -> modify -> setItem` seja estritamente atômico.

Exemplo de fila leve:
```javascript
class AsyncLock {
  constructor() {
    this.queues = new Map()
  }

  acquire(key, task) {
    const current = this.queues.get(key) || Promise.resolve()
    const next = current.then(() => task()).catch(err => {
      // Propaga o erro mas não trava a fila para tarefas futuras
      throw err
    }).finally(() => {
      if (this.queues.get(key) === next) {
        this.queues.delete(key)
      }
    })
    this.queues.set(key, next)
    return next
  }
}
```

### B. Contextos de Execução Imutáveis (Scoped Call Context)
Ao invés de mutar propriedades compartilhadas em `this` (`this.collectionName`, `this.docSelectionCriteria`), cada chamada a `.collection()` ou `.doc()` deve instanciar ou clonar uma referência com escopo isolado (`QueryReference` ou capturar variáveis no closure da ação), evitando que queries simultâneas colidam entre si.

### C. Uso de `Promise.all` em Lote
Substituir os laços com `forEach` e índice final por `Promise.all(keysForDeletion.map(key => ...))` ou transações em lote.

### D. Deep Merge Seguro para Objetos Aninhados
Em `updateObject.js`, suportar mesclagem recursiva profunda ou dot-notation (ex: `{ "user.profile.bio": "novo" }`), impedindo que a atualização de uma propriedade aninhada apague outras propriedades irmãs do mesmo objeto.

---

## 3. Arquivos Afetados & Mudanças de Código

1. **`localbase/utils/asyncLock.js` (Novo Arquivo)**:
   - Gerenciador de locks para serialização de transações no mesmo documento.

2. **`localbase/localbase.js`**:
   - Inicializar `this.lock = new AsyncLock()`.

3. **`localbase/api/actions/update.js`**:
   - Encapsular a leitura, atualização e escrita dentro de `this.lock.acquire(lockKey, async () => { ... })`.
   - Clonar os parâmetros da seleção de documentos no escopo local imediato.

4. **`localbase/api/actions/delete.js`**:
   - Substituir laço manual por `Promise.all(keys.map(k => this.lf[collectionName].removeItem(k)))`.

5. **`localbase/utils/updateObject.js`**:
   - Implementar deep-merge para objetos recursivos sem sobrescrever estruturas irmãs.

---

## 4. Plano de Testes & Validação

- [ ] Testar 5 chamadas simultâneas de `.update()` com campos diferentes no mesmo documento e validar se todos os campos persistem sem perda.
- [ ] Testar duas chamadas simultâneas em coleções distintas para assegurar ausência de colisão de `collectionName`.
- [ ] Testar deleção de múltiplos documentos e garantir que o `.then()` só resolva quando 100% dos registros foram removidos do storage.
