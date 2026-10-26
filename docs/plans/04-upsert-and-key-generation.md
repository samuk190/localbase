# Plano de Implementação 04: Upsert & Geração de Chaves (Auto-Incremento)

**Issues Relacionadas:**
- [#10: Feature Request: Upsert](https://github.com/samuk190/localbase/issues/10)
- [#9: How can we make the key auto incremented ?](https://github.com/samuk190/localbase/issues/9)

---

## 1. Diagnóstico do Problema & Causa-Raiz

### A. Ausência de Método Atômico de Upsert (Issue #10)
Atualmente, se um desenvolvedor quer garantir que um registro exista, ele precisa:
1. Fazer um `get()`.
2. Verificar se o registro retornou algo.
3. Se existir, chamar `update()` ou `set()`.
4. Se não existir, chamar `add()`.
Esse fluxo manual é sujeito a condições de corrida e polui o código da aplicação.

### B. Falta de Chaves Numéricas Auto-Incrementadas (Issue #9)
Atualmente, o `add()` gera obrigatoriamente um UUID textual via biblioteca `ordered-uuid` se nenhuma chave for especificada. Usuários que precisam de IDs sequenciais inteiros (ex: `1, 2, 3...`) para faturas, pedidos ou índices compactos não têm suporte nativo.

---

## 2. Especificação da Solução Técnica

### A. Novo Método Fluente: `.upsert(data, options)`
O método `.upsert()` atua diretamente no seletor de documento:
```javascript
// Upsert por chave explícita:
db.collection('users').doc('user_123').upsert({
  name: 'Samuka',
  lastLogin: new Date()
})

// Upsert por critério de busca:
db.collection('users').doc({ email: 'contato@empresa.com' }).upsert({
  email: 'contato@empresa.com',
  name: 'Samuka'
})
```

**Comportamento:**
1. Tenta localizar o documento por chave ou critério.
2. Se o documento for encontrado:
   - Executa a mesclagem dos campos fornecidos com os existentes (`update` seguro).
3. Se não for encontrado:
   - Cria o documento com os dados fornecidos.
   - Caso uma chave tenha sido passada em `.doc('chave')`, usa essa chave.
   - Caso um critério tenha sido passado em `.doc({ email: '...' })`, mescla o critério com o payload e gera uma nova chave.

### B. Suporte a Chaves Auto-Incrementadas (Sequenciador de Chaves)
Permitir a configuração de auto-incremento na coleção ou no método `.add()`:

```javascript
// Opção 1: Configuração na coleção
db.collection('orders', { autoIncrement: true }).add({ total: 150 }) // key: 1, 2, 3...

// Opção 2: Global via db.config
db.config.autoIncrement = true
```

**Implementação do Sequenciador:**
- Criar uma store interna de metadados: `__localbase_metadata__`.
- Chave no store: `seq:${collectionName}`.
- A cada inserção com auto-incremento, lê o valor atual, incrementa em 1 de forma transacional e grava a nova chave numérica.

---

## 3. Arquivos Afetados & Mudanças de Código

1. **`localbase/api/actions/upsert.js` (Novo Arquivo)**:
   - Implementa a lógica atômica de verificação e criação/atualização.

2. **`localbase/utils/keyGenerator.js` (Novo Arquivo)**:
   - Suporte a geração de chaves:
     - UUID v4 / ordenado.
     - Sequência auto-incrementada baseada em store interno.
     - Timestamp / ULID.

3. **`localbase/localbase.js`**:
   - Registrar `this.upsert = upsert.bind(this)`.

4. **`localbase/api/actions/add.js`**:
   - Integrar o `KeyGenerator` para respeitar o modo `autoIncrement` se ativado.

---

## 4. Plano de Testes & Validação

- [ ] Testar `.doc('k1').upsert({ val: 1 })` em documento inexistente -> deve criar documento com chave `'k1'`.
- [ ] Testar `.doc('k1').upsert({ val: 2, extra: true })` em documento existente -> deve atualizar sem apagar campos prévios.
- [ ] Testar inserções sucessivas com `autoIncrement: true` e validar que as chaves geradas são `1, 2, 3...`.
- [ ] Validar persistência do contador após reinicialização do banco.
