# AudyoKar

Sistema de agendamento para oficina automotiva, desenvolvido em ASP.NET Core MVC com Entity Framework Core.

## Funcionalidades

- Cadastro de clientes e veículos
- Agendamento de serviços
- Listagem de agendamentos ordenados por data
- Persistência de dados em banco SQL Server

## Requisitos

- [.NET 9.0 SDK ou superior](https://dotnet.microsoft.com/download)
- SQL Server (LocalDB ou outro)
- (Opcional) [DotNetEnv](https://www.nuget.org/packages/DotNetEnv/) para variáveis de ambiente

## Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/AudyoKar.git
cd AudyoKar
```

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
yarn
```

Ou:

```bash
npm i
```

### 7. Rodar o front-end do projeto

```bash
yarn dev
```

Acesse o front-end do projeto em [http://localhost:5143](http://localhost:5143) ou conforme indicado no terminal.

## Estrutura do Projeto

- `Controllers/` — Lógica de controle MVC
- `Models/` — Modelos de dados
- `ViewModels/` — ViewModels para formulários e requisições
- `Views/` — Arquivos Front-End
- `Data/` — Contexto do Entity Framework

## Observações

- A string de conexão é lida do `.env` via variável de ambiente `DB_CONNECTION`.
- O arquivo `appsettings.json` não contém mais a string de conexão.
- Adicione `.env` ao seu `.gitignore`.