
# Jogo do Bicho - Backend

Este é o backend da aplicação Jogo do Bicho, desenvolvido com Node.js e Express.

## Estrutura do Projeto

- `/api`: Código fonte da aplicação backend
  - `/config`: Configurações da aplicação
  - `/middleware`: Middlewares do Express
  - `/routes`: Rotas da API
  - `/utils`: Funções utilitárias
- `/db`: Arquivos JSON para persistência de dados

## Tecnologias Utilizadas

- Node.js
- Express
- JWT para autenticação
- Armazenamento de dados em arquivos JSON
- bcrypt para hashing de senhas

## Instalação e Execução Local

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/bicho-do-bicho-backend-01.git
   cd bicho-do-bicho-backend-01
   ```

2. Instale as dependências:
   ```
   cd api
   npm install
   ```

3. Execute o projeto em modo de desenvolvimento:
   ```
   node index.js
   ```

4. A API estará disponível em `http://localhost:3000`

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
PORT=3000
JWT_SECRET=seu_segredo_jwt
```

## Deploy

Este projeto está configurado para deploy no Vercel usando a configuração em `vercel.json`.

## Endpoints da API

### Autenticação
- `POST /api/auth/register`: Registrar novo usuário
- `POST /api/auth/login`: Login de usuário
- `GET /api/auth/usuario`: Obter dados do usuário atual

### Apostas
- `POST /api/apostas/criar`: Criar nova aposta
- `GET /api/apostas/listar`: Listar apostas do usuário

### Resultados
- `GET /api/resultados/listar`: Listar resultados dos sorteios
- `POST /api/resultados/sortear`: Realizar novo sorteio
- `POST /api/resultados/verificar`: Verificar apostas ganhadoras

## Frontend

O frontend deste projeto está disponível em: [bicho-do-bicho-frontend-01](https://github.com/seu-usuario/bicho-do-bicho-frontend-01)
