# Plano de Implementação 09: Modernização, Correção de Segurança (UUID) & Otimização do Bundle (<40KB)

**Issues Relacionadas:**
- [#92: Out of date UUID dependency](https://github.com/samuk190/localbase/issues/92)
- [#81: 2.18 MB is too much for a small library](https://github.com/samuk190/localbase/issues/81)
- [#77: migrate to TS](https://github.com/samuk190/localbase/issues/77)
- [#83: Need typescript support](https://github.com/samuk190/localbase/issues/83)
- [#31: Quasar CLI prefers yarn to npm. How should I install?](https://github.com/samuk190/localbase/issues/31)
- [#54: It broke my Quasar / Vite project](https://github.com/samuk190/localbase/issues/54)

---

## 1. Diagnóstico do Problema & Causa-Raiz

### A. Vulnerabilidade de Segurança no `ordered-uuid` (Issue #92)
A dependência `ordered-uuid@^1.1.0` utiliza internamente versões antigas do pacote `uuid` afetadas pelo alerta de segurança [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) (falta de checagem de limites de buffer em v3/v5/v6).
Como o `ordered-uuid` foi abandonado há anos, o `npm audit` emite alertas constantes de vulnerabilidade em qualquer projeto que instala o Localbase.

### B. Tamanho Excessivo do Pacote: 2.18 MB (Issue #81)
O pipeline de build atual utiliza **Browserify + Babelify + Envify + Tinyify**.
O Browserify injeta dezenas de polyfills monolíticos de Node.js (`buffer`, `process`, `stream`, etc.) que não são necessários para uma biblioteca voltada ao navegador. Isso gera um arquivo `localbase.dev.js` de incríveis **2.2 MB** e quebra bundlers modernos como Vite, Rollup e Webpack 5 que esperam ESM nativo puro (causando erros como `require is not defined` - Issues #57 e #72).

### C. Ausência de Suporte Moderno a TypeScript (Issues #77 e #83)
O repositório possui arquivos de tipagem `.d.ts` manuais e incompletos, sem suporte a Generics para tipagem de modelos de coleção (ex: `db.collection<User>('users')`).

---

## 2. Especificação da Solução Técnica

### A. Remoção Completa de `ordered-uuid` e Adoção de `crypto.randomUUID`
Substituir a biblioteca desatualizada por uma solução nativa de alto desempenho com zero dependências externas:
```javascript
export function generateKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback rápido baseado em timestamp + random para ambientes legados
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
}
```
**Benefício:** Elimina 100% das vulnerabilidades do `npm audit` e remove centenas de KB de dependências inúteis.

### B. Migração do Pipeline de Build para `tsup` / `Rollup` / `esbuild`
Substituir Browserify pelo pipeline moderno padrão da indústria:
- **Saídas geradas**:
  - `dist/index.mjs` (ESM para Vite, Next.js, Quasar, Rollup, Webpack 5) - **~15 KB minificado**.
  - `dist/index.cjs` (CommonJS para Node.js / Electron backend) - **~18 KB minificado**.
  - `dist/localbase.iife.min.js` (Standalone para inclusão direta via `<script>` em CDN) - **~25 KB gzipped**.
- **Redução de tamanho**: De **2.18 MB** para **menos de 30 KB** (redução de mais de 98% no peso da biblioteca!).

### C. Tipagem TypeScript de Primeira Classe com Suporte a Generics
Reescrever o `index.d.ts` para oferecer autocompletion completo no VS Code:
```typescript
export interface User {
  id: string
  name: string
  age: number
}

// O TypeScript infere o retorno de .get() automaticamente como User[]:
const users = await db.collection<User>('users').get()
```

---

## 3. Arquivos Afetados & Mudanças de Código

1. **`package.json`**:
   - Remover `ordered-uuid`, `browserify`, `babelify`, `envify`, `tinyify`.
   - Adicionar `tsup` ou `rollup` como dependência de desenvolvimento.
   - Configurar `"exports"` moderno para ESM e CJS:
     ```json
     {
       "name": "localbase",
       "main": "./dist/index.cjs",
       "module": "./dist/index.mjs",
       "types": "./dist/index.d.ts",
       "exports": {
         ".": {
           "import": "./dist/index.mjs",
           "require": "./dist/index.cjs",
           "types": "./dist/index.d.ts"
         }
       }
     }
     ```

2. **`localbase/utils/uuid.js` (Novo Arquivo)**:
   - Gerador nativo com zero vulnerabilidades.

3. **`localbase/api/actions/add.js`**:
   - Substituir importação de `ordered-uuid` pelo novo utilitário.

4. **`index.d.ts`**:
   - Definições de tipos completas e fortemente tipadas.

---

## 4. Plano de Testes & Validação

- [ ] Executar `npm audit` e garantir **0 vulnerabilidades encontradas**.
- [ ] Construir o bundle com `npm run build` e validar que o tamanho final é inferior a 40 KB.
- [ ] Importar em um projeto teste com Vite / Vue 3 / React e certificar ausência de erros de `require` ou polyfills.
- [ ] Compilar um arquivo TypeScript de teste usando tipagem de coleção genérica e validar intellisense e checagem de tipos em tempo de compilação.
