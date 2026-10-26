# Plano de Implementação 08: Exportação/Importação de Dados (JSON/CSV) & Versionamento do Banco

**Issues Relacionadas:**
- [#30: Add .xls, .json, .csv export features.](https://github.com/samuk190/localbase/issues/30)
- [#68: Version Control / Schema Migrations](https://github.com/samuk190/localbase/issues/68)
- [#27: How to use fk in collections?](https://github.com/samuk190/localbase/issues/27)

---

## 1. Diagnóstico do Problema & Causa-Raiz

### A. Ausência de Backup e Portabilidade Offline (Issue #30)
Como banco de dados offline baseado no IndexedDB do navegador, o Localbase fica vulnerável à limpeza de cache pelo usuário, navegação anônima ou necessidade de migração entre dispositivos. Os usuários necessitam de:
- Exportar coleções inteiras para arquivos `.json` ou planilhas `.csv`.
- Importar backups para restaurar o estado da aplicação.
- Mecanismo agendado ou sob demanda de auto-save / snapshot.

### B. Falta de Controle de Versão e Migrações (Issue #68)
Quando uma nova versão do app cliente é lançada com mudanças na estrutura dos documentos (ex: renomeação de colunas, normalização de dados, novos campos obrigatórios), não há forma nativa de detectar que a versão dos dados no cliente é legada e aplicar scripts de migração estruturados.

---

## 2. Especificação da Solução Técnica

### A. Sistema de Exportação: `.export(options)`
Permitir exportação de uma coleção ou de todo o banco de dados em formato JSON ou CSV:
```javascript
// Exportar como Objeto / String JSON:
const backupData = await db.export({
  format: 'json',
  collections: ['users', 'orders'], // ou omitir para todas as coleções
  pretty: true
})

// Exportar diretamente para download no navegador (.json ou .csv):
await db.exportFile({
  filename: 'backup-sistema.json',
  format: 'json'
})

// Exportar coleção tabular para CSV:
await db.collection('customers').exportFile({
  filename: 'clientes.csv',
  format: 'csv'
})
```

**Conversor CSV Embutido Leve:**
- Transforma array de objetos planos em linhas CSV formatadas com escape de aspas e quebras de linha (`"campo, com virgula"`).

### B. Sistema de Importação: `.import(data, options)`
```javascript
// Importar dados de backup:
await db.import(backupData, {
  overwrite: true, // ou false para não sobrescrever documentos existentes
  onProgress: (percent) => console.log(`${percent}% importado`)
})
```

### C. Versionamento & Migrações: `db.version(targetVersion, migrationFn)`
Inspirado na arquitetura do Dexie.js e Firestore:
```javascript
const db = new Localbase('appDb')

// Declarar migração para versão 2:
db.version(2, async (migrator) => {
  // Atualizar estrutura da coleção 'users'
  await migrator.collection('users').transform((user) => {
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      migratedAt: new Date()
    }
  })
})

await db.init() // Executa automaticamente migrações pendentes de forma segura
```

---

## 3. Arquivos Afetados & Mudanças de Código

1. **`localbase/utils/csvConverter.js` (Novo Arquivo)**:
   - Funções utilitárias bidirecionais `jsonToCsv(data)` e `csvToJson(csv)`.

2. **`localbase/api/actions/export.js` (Novo Arquivo)**:
   - Extrai registros de coleções com suporte a download direto via Blob/URL.

3. **`localbase/api/actions/import.js` (Novo Arquivo)**:
   - Valida e insere lotes de dados respeitando limites do IndexedDB.

4. **`localbase/core/migrationManager.js` (Novo Arquivo)**:
   - Gerencia tabela interna de versão `__localbase_schema_version__`.
   - Executa migrações sequenciais ordenadas com rollback de segurança em caso de falha.

---

## 4. Plano de Testes & Validação

- [ ] Exportar coleção com 50 registros para JSON e validar consistência de chaves e tipos de dados.
- [ ] Exportar dados para CSV e verificar separação por vírgulas e escape de caracteres especiais.
- [ ] Limpar o banco e reimportar o arquivo exportado -> verificar paridade 100% com o banco original.
- [ ] Executar migração de esquema de v1 para v2 e validar transformação dos documentos existentes.
