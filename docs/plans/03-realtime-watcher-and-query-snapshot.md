# Plano de Implementação 03: Watcher Reativo em Tempo Real & `querySnapshot` / `.onSnapshot()`

**Issues Relacionadas:**
- [#71: Needs querySnapshot](https://github.com/samuk190/localbase/issues/71)
- [#48: Watch for changes](https://github.com/samuk190/localbase/issues/48)
- [#62: Add support for reactivity](https://github.com/samuk190/localbase/issues/62)

---

## 1. Diagnóstico do Problema & Causa-Raiz

Localbase é amplamente adotado em PWAs, Electron e SPAs offline que buscam a experiência do Firebase Firestore no navegador.
No entanto, no Firebase o desenvolvedor utiliza:
```javascript
db.collection('messages').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach(change => { ... })
  // UI atualiza instantaneamente sem reload
})
```
No Localbase atual:
- **Zero reatividade**: Toda leitura exige polling ou invocação manual de `get()` após cada escrita.
- **Isolamento de abas/janelas**: Se o usuário abre o app em duas abas ou janelas do Electron, uma alteração feita em uma janela não é propagada para a outra.

---

## 2. Especificação da Solução Técnica

### A. Mecanismo de Eventos Local (In-Memory EventEmitter)
Criar um EventEmitter nativo leve dentro da instância do Localbase:
- Eventos de coleção: `${collectionName}:change` com payload: `{ action: 'add'|'update'|'set'|'delete', key, data, oldData }`.
- Eventos de documento: `${collectionName}:${docKey}:change`.

### B. Sincronização Cross-Tab / Cross-Window via `BroadcastChannel`
No ambiente do navegador e Electron, o padrão moderno [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) permite comunicação inter-processos com latência próxima de zero:
- Canal padrão: `localbase_sync_${this.dbName}`.
- Ao realizar qualquer mutação bem-sucedida (`add`, `update`, `set`, `delete`), publicar uma mensagem no canal:
  ```json
  {
    "type": "LOCALBASE_MUTATION",
    "db": "myDb",
    "collection": "messages",
    "key": "msg-123",
    "action": "add",
    "timestamp": 1729900000000
  }
  ```
- Outras abas ou instâncias escutam o canal e re-disparam os eventos do EventEmitter local.
- Fallback para ambientes sem `BroadcastChannel`: escuta do evento `storage` via `localStorage`.

### C. API Pública Fluente: `.onSnapshot(callback)`
Permitir a sintaxe clássica do Firebase em nível de coleção ou documento:

```javascript
// Exemplo em Coleção:
const unsubscribe = db.collection('todos')
  .where('completed', '==', false)
  .orderBy('createdAt', 'desc')
  .onSnapshot((todos, metadata) => {
    console.log('Lista atualizada:', todos)
    console.log('Tipo de alteração:', metadata.action)
  })

// Cancelar escuta:
unsubscribe()
```

```javascript
// Exemplo em Documento Específico:
const unsubscribe = db.collection('settings').doc('theme').onSnapshot((themeDoc) => {
  applyTheme(themeDoc.mode)
})
```

---

## 3. Arquivos Afetados & Mudanças de Código

1. **`localbase/utils/eventEmitter.js` (Novo Arquivo)**:
   - Implementação enxuta de emissor de eventos pub/sub.

2. **`localbase/utils/syncChannel.js` (Novo Arquivo)**:
   - Gerenciador de `BroadcastChannel` com reconexão automática e despacho para o EventEmitter.

3. **`localbase/localbase.js`**:
   - Inicializar `this.events = new EventEmitter()`.
   - Inicializar `this.channel = new SyncChannel(this.dbName, this.events)`.
   - Registrar `this.onSnapshot = onSnapshot.bind(this)`.

4. **`localbase/api/actions/onSnapshot.js` (Novo Arquivo)**:
   - Executa a leitura inicial (`get()`), invoca o callback com o estado inicial.
   - Registra o listener no EventEmitter para atualizações subsequentes.
   - Retorna a função `unsubscribe`.

5. **`localbase/api/actions/add.js`, `update.js`, `set.js`, `delete.js`**:
   - Disparar `this.events.emit(...)` e `this.channel.broadcast(...)` nos callbacks de sucesso.

---

## 4. Plano de Testes & Validação

- [ ] Testar disparo imediato de dados no primeiro registro de `.onSnapshot()`.
- [ ] Testar recebimento automático de novo item adicionado via `.add()` sem chamar `.get()`.
- [ ] Testar sincronização em tempo real entre duas abas ou contextos de teste simulando `BroadcastChannel`.
- [ ] Testar função de desinscrição (`unsubscribe()`) garantindo que nenhum callback adicional seja chamado.
