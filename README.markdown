# Gerador de Planos de Aula com IA

Este projeto é um sistema que gera planos de aula personalizados utilizando a IA do Google Gemini API, integrado com Supabase para autenticação e armazenamento. Ele atende ao Teste Técnico 2 para a vaga de Desenvolvedor Júnior/Estagiário (Supabase Backend Dev Desafio 2025).

## Instruções de Instalação

1. **Pré-requisitos**:
   - Node.js (versão 18 ou superior)
   - npm (geralmente instalado com Node.js)
   - Acesso ao Supabase (crie um projeto em supabase.com)
   - Chave API do Google Gemini (obtenha em ai.google.dev)

2. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/seu-usuario/gerador-planos-aula.git
   cd gerador-planos-aula
   ```

3. **Instalar Dependências**:
   ```bash
   npm install
   ```

4. **Configurar Variáveis de Ambiente**:
   - Crie um arquivo `.env` na raiz do projeto com:
     ```
     SUPABASE_URL=seu-supabase-url
     SUPABASE_SERVICE_ROLE_KEY=seu-supabase-service-role-key
     GEMINI_API_KEY=sua-chave-gemini
     ```
   - Substitua os valores pelas credenciais do Supabase e da Gemini API.

5. **Executar o Projeto**:
   ```bash
   npm run dev
   ```
   - Acesse a aplicação em `http://localhost:3000`.

## Estrutura do Projeto

- **Frontend**: HTML puro com JavaScript para interface e lógica.
- **Backend**: Node.js com Express, integrado ao Supabase.
- **IA**: Utiliza o modelo Gemini 2.0 Flash da Google AI Studio.

## Modelagem de Dados

### Tabelas no Supabase
- **users**:
  - `id` (UUID, PRIMARY KEY, DEFAULT uuid_generate_v4())
  - `email` (TEXT, UNIQUE, NOT NULL)
  - Script SQL:
    ```sql
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL
    );
    ```
- **lesson_plans**:
  - `id` (UUID, PRIMARY KEY, DEFAULT uuid_generate_v4())
  - `tema` (TEXT, NOT NULL)
  - `serie` (TEXT, NOT NULL)
  - `disciplina` (TEXT, NOT NULL)
  - `duracao` (INTEGER, NOT NULL)
  - `nivel_dificuldade` (TEXT, NOT NULL)
  - `introducao` (TEXT)
  - `objetivo_bncc` (TEXT)
  - `passo_a_passo` (JSONB)
  - `rubrica` (JSONB)
  - `user_id` (UUID, REFERENCES users(id))
  - Script SQL:
    ```sql
    CREATE TABLE lesson_plans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tema TEXT NOT NULL,
      serie TEXT NOT NULL,
      disciplina TEXT NOT NULL,
      duracao INTEGER NOT NULL,
      nivel_dificuldade TEXT NOT NULL,
      introducao TEXT,
      objetivo_bncc TEXT,
      passo_a_passo JSONB,
      rubrica JSONB,
      user_id UUID REFERENCES users(id)
    );
    ```

### Inputs do Usuário
- Tema
- Série
- Disciplina
- Duração (minutos)
- Nível de Dificuldade (Básico, Intermediário, Avançado)
- Contexto (opcional)

## Escolha do Modelo IA
O modelo escolhido foi o **Gemini 2.0 Flash**, devido à sua eficiência e capacidade de gerar respostas estruturadas em JSON, adequado para criar planos de aula com introdução lúdica, objetivos BNCC, passo a passo e rubrica de avaliação, sem exigir cartão de crédito para uso básico.

## Funcionalidades

- **Formulário**: Interface simples para entrada de dados.
- **Validação**: Campos obrigatórios são validados.
- **Integração com Gemini API**: Gera planos de aula personalizados.
- **Salvamento no Supabase**: Armazena planos e associa a usuários autenticados.
- **Exibição**: Mostra o plano gerado na interface.
- **Autenticação**: Usuários devem se cadastrar e fazer login via Supabase para gerar planos.
- **Exportação PDF**: Permite salvar o plano como PDF.
- **Tratamento de Erros**: Exibe mensagens de erro em caso de falhas.

## Decisões Técnicas

- Uso de Supabase para autenticação e banco de dados por sua integração nativa e escalabilidade.
- Frontend em HTML puro para simplicidade, com JavaScript para lógica.
- JSONB no Supabase para armazenar passo a passo e rubrica de forma flexível.

## Desafios e Soluções

- **Autenticação**: Adicionei validação de token JWT nas requisições API, resolvendo erros 401 com middleware no backend.
- **Parsing da IA**: Ajustei o parsing da resposta Gemini para garantir estrutura JSON válida, usando regex em caso de falhas.

## Acessos

- **URL da Aplicação**: `http://localhost:3000` (após `npm run dev`)
- **Credenciais de Teste**: Usuário `teste@example.com`, senha `123456` (cadastre-se se necessário)
- **Link Supabase**: Disponível no Dashboard Supabase após configuração.

## Contato
Para dúvidas, entre em contato via [seu-email@exemplo.com](mailto:seu-email@exemplo.com).