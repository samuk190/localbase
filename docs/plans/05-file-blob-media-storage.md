# Plano de Implementação 05: Suporte a Armazenamento de Arquivos, Blobs e Mídia no IndexedDB

**Issues Relacionadas:**
- [#36: Feature request ... Can you add a feature to handle file storage as part of localbase?](https://github.com/samuk190/localbase/issues/36)
- [#88: Allow file inside indexed DB](https://github.com/samuk190/localbase/issues/88)

---

## 1. Diagnóstico do Problema & Causa-Raiz

### A. Validação Rígida que Rejeita Tipos Binários
O IndexedDB suporta nativamente o armazenamento de instâncias de `Blob`, `File`, `ArrayBuffer` e tipos tipados (`Uint8Array`). O `localforage` (utilizado pelo Localbase) também suporta perfeitamente esses tipos de dados binários.
Contudo, o Localbase bloqueia ativamente esses tipos em `add.js`, `set.js` e `update.js`:
```javascript
// Trecho em add.js / update.js:
else if (!(typeof data == 'object' && data instanceof Array == false)) {
  this.userErrors.push('Data passed to .add() must be an object. Not an array, string, number or boolean.')
}
```
Além disso, se um objeto contém propriedades do tipo `File` ou `Blob`, chamadas a `JSON.stringify(docSelectionCriteria)` ou logger lançam erros de serialização ou convertem os arquivos em objetos vazios `{}`.

---

## 2. Especificação da Solução Técnica

### A. Atualização da Camada de Validação
Permitir que os dados passados para `add()`, `set()`, `update()` e `upsert()` sejam:
- Instâncias diretas de `Blob`, `File` ou `ArrayBuffer`.
- Objetos que contenham propriedades do tipo `Blob`, `File`, `ArrayBuffer` em qualquer nível de aninhamento.

### B. Serialização Segura no Logger
No arquivo `localbase/utils/logger.js`, implementar uma rotina de sanitização prévia antes de passar estruturas para o console ou para formatação:
- Detectar se uma propriedade é instância de `Blob` ou `File` e formatar como:
  `"[File: name=avatar.png, size=1048576, type=image/png]"`
- Impedir que chamadas internas de `JSON.stringify` quebrem a execução.

### C. Métodos Auxiliares de Storage de Mídia
Disponibilizar helpers convenientes de upload e recuperação de arquivos:
```javascript
// Upload de um Blob ou File direto:
const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]

// Armazenar na coleção 'files':
await db.collection('files').doc('meu_documento.pdf').set({
  name: file.name,
  size: file.size,
  mimeType: file.type,
  data: file, // Objeto Blob/File nativo
  uploadedAt: new Date()
})

// Recuperação:
const doc = await db.collection('files').doc('meu_documento.pdf').get()
const blobUrl = URL.createObjectURL(doc.data)
// Pronto para exibir em <img src="..."> ou disparar download
```

---

## 3. Arquivos Afetados & Mudanças de Código

1. **`localbase/utils/isBinary.js` (Novo Arquivo)**:
   - Helper para detectar `Blob`, `File`, `ArrayBuffer`, `Uint8Array`.

2. **`localbase/api/actions/add.js`, `set.js`, `update.js`**:
   - Ajustar validações de entrada para aceitar instâncias binárias.

3. **`localbase/utils/logger.js`**:
   - Sanitizar saída visual sem invocar `JSON.stringify` cego em objetos que contenham binários.

4. **`localbase/utils/isSubset.js`**:
   - Adicionar tratamento para comparação de `Blob`/`File` (comparar tamanho e tipo MIME).

---

## 4. Plano de Testes & Validação

- [ ] Inserir e recuperar um arquivo de imagem (`image/png`) como `Blob` e verificar integridade de bytes.
- [ ] Inserir um objeto complexo contendo campos de texto e um `File` anexado.
- [ ] Validar que `get()` retorna a referência intacta do `Blob` utilizável com `URL.createObjectURL()`.
- [ ] Testar deleção de documentos contendo Blobs pesados e verificar liberação de cota de armazenamento no navegador.
