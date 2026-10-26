# Plano de Implementação 06: Agregações, Paginação & Tamanho da Coleção (`.count()`, `.offset()`, `.paginate()`)

**Issues Relacionadas:**
- [#50: how do I get collection length?](https://github.com/samuk190/localbase/issues/50)

---

## 1. Diagnóstico do Problema & Causa-Raiz

### A. Ausência de Método de Contagem (`.count()`)
Atualmente, para saber o total de documentos em uma coleção, o usuário é forçado a:
```javascript
const docs = await db.collection('customers').get()
const count = docs.length
```
**Problema Grave de Performance e Memória:**
Se a coleção tiver 50.000 registros, o Localbase carrega todos os 50.000 documentos em memória RAM, desserializando cada objeto JSON no IndexedDB, apenas para ler `.length`! Isso congela a interface do usuário e pode estourar o limite de memória do navegador.

### B. Falta de Offset / Skip para Paginação
O Localbase possui apenas `.limit(10)`, mas **não possui `.offset(n)` ou `.skip(n)`**. O usuário consegue pegar os primeiros 10 itens da Página 1, mas não consegue consultar a Página 2 (itens 11 a 20) sem carregar todos os dados até ali.

---

## 2. Especificação da Solução Técnica

### A. Novo Método Fluente: `.count()`
Implementar método de alta performance para contagem:
```javascript
// Contagem total de uma coleção (O(1) no IndexedDB):
const total = await db.collection('customers').count()

// Contagem filtrada (sem carregar payloads completos):
const activeTotal = await db.collection('customers')
  .where('status', '==', 'active')
  .count()
```

**Otimização:**
1. Quando não há filtros (`.where` ou critérios), delegar diretamente para `this.lf[collectionName].length()`. O IndexedDB possui contador interno nativo (`IDBIndex.count()` / `IDBObjectStore.count()`), executando em tempo constante $O(1)$ sem transferir dados para a thread JavaScript.
2. Quando há filtros, utilizar `iterate` contando apenas as ocorrências onde o filtro é satisfeito, sem alocar o array de resultados em memória.

### B. Novo Método Fluente: `.offset(skipCount)` / `.skip(skipCount)`
Permitir pular $N$ registros:
```javascript
db.collection('customers')
  .where('status', '==', 'active')
  .orderBy('name', 'asc')
  .offset(20)
  .limit(10)
  .get()
```

### C. Helper Integrado de Paginação: `.paginate({ page, limit })`
Atender diretamente ao formato exato solicitado pelo usuário na Issue #50:
```javascript
const result = await db.collection('customers')
  .where('status', '==', 'active')
  .paginate({ page: 2, limit: 10 })

/*
Retorno padronizado:
{
  total_rows: 100,
  row_limit: 10,
  total_page: 10,
  current_page: 2,
  rows: [ ... 10 itens da página 2 ... ]
}
*/
```

---

## 3. Arquivos Afetados & Mudanças de Código

1. **`localbase/api/filters/offset.js` (Novo Arquivo)**:
   - Registra `this.offsetBy = skipCount`.

2. **`localbase/api/actions/count.js` (Novo Arquivo)**:
   - Implementa a contagem via `localForage.length()` ou cursor leve.

3. **`localbase/api/actions/paginate.js` (Novo Arquivo)**:
   - Orquestra `.count()`, `.offset()` e `.limit()` e formata a resposta agregada.

4. **`localbase/localbase.js`**:
   - Inicializar `this.offsetBy = null`.
   - Vincular `this.count = count.bind(this)`.
   - Vincular `this.offset = offset.bind(this)`.
   - Vincular `this.skip = offset.bind(this)`.
   - Vincular `this.paginate = paginate.bind(this)`.

5. **`localbase/api/actions/get.js`**:
   - No fatiamento da coleção:
     ```javascript
     if (offsetBy) {
       collection = collection.slice(offsetBy)
     }
     if (limitBy) {
       collection = collection.slice(0, limitBy)
     }
     ```

6. **`localbase/api-utils/reset.js`**:
   - Resetar `this.offsetBy = null`.

---

## 4. Plano de Testes & Validação

- [ ] Testar `.count()` em coleção vazia -> deve retornar 0.
- [ ] Testar `.count()` em coleção com 100 registros sem filtros -> verificar uso de `localForage.length()`.
- [ ] Testar `.where(...).count()` e validar correspondência exata.
- [ ] Testar paginação: Página 1 (`page: 1, limit: 5`) e Página 2 (`page: 2, limit: 5`) com dados ordenados, conferindo ausência de duplicatas entre páginas.
