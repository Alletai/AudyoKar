# AudyoKar

Sistema de agendamento para oficina automotiva, desenvolvido em ASP.NET Core MVC com Entity Framework Core e React com TypeScript, SCSS e Boostrap.

## Funcionalidades
- Agendamento de serviços
- Listagem de agendamentos
- Cadastro de Funcionarios
- Persistência de dados em banco SQL Server

## Requisitos

- [.NET 9.0 SDK ou superior](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/pt-br/sql-server/sql-server-downloads) como Banco de Dados
- [DotNetEnv](https://www.nuget.org/packages/DotNetEnv/) para armazenamento privado da string de conexão com o Banco de Dados

## Configuração

### 1. Faça um fork do repositório

Ao criar sua própria cópia do repositório, siga o seguinte procedimento:

```bash
git clone https://github.com/seu-usuario/AudyoKar.git
cd AudyoKar
```

Para inserir alterações no repositório principal, realize uma pull-request.

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com a string de conexão do banco.

> **Importante:** Não compartilhe seu `.env` publicamente.

### 3. Restaurar dependências

```bash
dotnet restore
```

### 4. Compile o código

```bash
dotnet build
```

### 5. Aplicar as migrations (criar o banco de dados)

```bash
dotnet ef database update
```

### 6. Rodar o back-end do projeto

```bash
dotnet watch run
```

Acesse o back-end do projeto em [http://localhost:8000](http://localhost:8000) ou conforme indicado no terminal.

### 7. Preparar o front-end do projeto

Para instalar os pacotes da `node_modules`, utilizar os seguintes comandos:

```bash
yarn install
```

Ou:

```bash
npm install
```

### 7. Rodar o front-end do projeto

```bash
cd ClientApp
npm run dev
```

Acesse o front-end do projeto em [http://localhost:5143](http://localhost:5143) ou conforme indicado no terminal.

## Estrutura do Projeto

- `Controllers/Api/` — Lógica da API
- `Models/` — Modelos de dados
- `ViewModels/` — ViewModels para formulários e requisições
- `ClientApp/` - Conteúdo Front-End
- `ClientApp/src/pages/` — Páginas do projeto
- `Data/` — Context do Entity Framework

## Observações

- A string de conexão é lida do `.env` via URI `DB_CONNECTION`.
