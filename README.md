# Inteli - Instituto de Tecnologia e Liderança 

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="assets/inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0"></a>
</p>

# AgroFlow

## :student: Integrantes: 

<div align="center">
  <table>
    <tr>
      <td align="center"><a href="https://www.linkedin.com/in/ana-clara-silvestre-328706326/"><img style="border-radius: 10%; object-fit: cover;" src="documents/others/assets/fotos-integrantes/foto-ana.png" width="100px" height="100px" alt="" /><br><sub><b>Ana Clara da Silva Silvestre</b></sub></a></td>
      <td align="center"><a href="https://www.linkedin.com/in/andr%C3%A9-fischer-de-carvalho-5588443b0/"><img style="border-radius: 10%; object-fit: cover;" src="documents/others/assets/fotos-integrantes/foto-andre.png" width="100px" height="100px" alt=""/><br><sub><b>André Fischer de Carvalho</b></sub></a></td>
      <td align="center"><a href="https://www.linkedin.com/in/enzo-braga-heins-b706603b9/"><img style="border-radius: 10%; object-fit: cover;" src="documents/others/assets/fotos-integrantes/foto-enzo.png" width="100px" height="100px" alt=""/><br><sub><b>Enzo Braga Heins</b></sub></a></td>
      <td align="center"><a href="https://www.linkedin.com/in/fabiana-dias-souza/"><img style="border-radius: 10%; object-fit: cover;" src="documents/others/assets/fotos-integrantes/foto-fabiana.png" width="100px" height="100px" alt=""/><br><sub><b>Fabiana Dias de Souza</b></sub></a></td>
       <td align="center"><a href="https://www.linkedin.com/in/jo%C3%A3o-glauco-fernandes-2292513a9//"><img style="border-radius: 10%; object-fit: cover;" src="documents/others/assets/fotos-integrantes/foto-joao.png" width="100px" height="100px" alt=""/><br><sub><b>João Glauco Fernandes Araújo de Freitas</b></sub></a></td>
      <td align="center"><a href="https://www.linkedin.com/in/levi-correia-silveira-4900a4312/"><img style="border-radius: 10%; object-fit: cover;" src="documents/others/assets/fotos-integrantes/foto-levi.png" width="100px" height="100px" alt=""/><br><sub><b>Levi Correia Silveira</b></sub></a></td>
      <td align="center"><a href="https://www.linkedin.com/in/matheus-augusto-corr%C3%AAa-santos-0bab03373/?locale=en"><img style="border-radius: 10%; object-fit: cover;" src="documents/others/assets/fotos-integrantes/foto-matheus.png" width="100px" height="100px" alt=""/><br><sub><b>Matheus Augusto Corrêa Santos</b></sub></a></td>
      <td align="center"><a href="https://www.linkedin.com/in/theo-moreda"><img style="border-radius: 10%; object-fit: cover;" src="documents/others/assets/fotos-integrantes/foto-theo.png" width="100px" height="100px" alt=""/><br><sub><b>Théo Pires Morêda</b></sub></a></td>
    </tr>
  </table>
</div>


## :teacher: Professores:
### Orientador(a)

- <a href="https://www.linkedin.com/in/marcelo-gon%C3%A7alves-phd/">Marcelo Luiz do Amaral Gonçalves</a>
### Instrutores

- <a href="https://www.linkedin.com/in/diogo-martins-gon%C3%A7alves-de-morais-96404732/">Diogo Martins Gonçalves de Morais</a>

- <a href="https://www.linkedin.com/in/filipe-gon%C3%A7alves-08a55015b/">Filipe Gonçalves</a>

- <a href="https://www.linkedin.com/in/gui-cestari/">Guilherme Cestari</a>

- <a href="https://www.linkedin.com/in/natalia-k-37a62052/">Natália Kloeckner</a>

- <a href="https://www.linkedin.com/in/ovidio-netto/">Ovidio Netto Lopes</a>








## 📝 Descrição

&emsp;&emsp;A AgroFlow é uma aplicação web desenvolvida pelo grupo 02 da turma 26 em parceria com a empresa BrPec Agropecuária S.A. com o propósito de digitalizar o registro das operações que ocorrem nos retiros da fazenda BrPec. Atualmente, o fluxo de informação entre o campo e o escritório depende de um processo que utiliza de boletas de papel para registro seguidas de digitação manual dessas informações em planilhas. A adoção desse registro manual atrasa a consolidação dos dados, é passível de manipulações ou omissões de dados e está sujeita a erros durante a reescrita. A solução desenvolvida substitui esse processo manual por um registro centralizado e rastreável das operações que ocorrem na fazenda.

&emsp;&emsp;O sistema possibilita o registro de movimentações do rebanho (dentre eles nascimento, morte, transferência, compra e venda), a gestão de tarefas operacionais, a abertura de tickets de manutenção (dentre eles cerca, hidráulica, elétrica, edificação e abastecimento de água) e anexo de evidências (dentre eles foto, áudio e mensagem escrita).

&emsp;&emsp;A Solução atende a três níveis hierárquicos de cada retiro: capatazes, supervisores e gerentes. Os escopos de atuação de cada nível na aplicação são os seguintes: os capatazes fazem o registro das operações e abrem tickets de infraestrutura; os supervisores validam os registros dos capatazes e criam novas tarefas para eles; e gerentes consultam relatórios operacionais organizados por período. O controle de acesso é feito por cargo: capatazes acessam por qrcode único, supervisores e gerentes acessam por login e senha, garantindo que cada perfil tenha acesso somente às funcionalidades compatíveis com seu escopo de atuação.

&emsp;&emsp;Por fim, a característica-chave da aplicação desenvolvida é a operação offline (uma demanda que foi trazida pela empresa parceira e que é necessária para a aplicabilidade da solução): quando o capataz faz os registros em campo eles são salvos localmente em seu aparelho, assim que a conexão é reestabelecida, os registros são sincronizados, permitindo que o escritório tenha acesso aos eventos do campo.



## 📝 Link de demonstração

_Coloque aqui o link para o vídeo de demonstração do projeto_

## 📁 Estrutura de pastas

```text
g02/
├── assets/                     # Imagens padrão Inteli
├── documents/
│   ├── others/                 # Assets da documentação
│   ├── index.html              # Versão renderizada do WAD
│   └── wad.md                  # Web Application Document (documentação principal)
├── src/
│   └── backend/
│       ├── @types/             # Extensões de tipos do Express
│       ├── controllers/        # Camada de entrada das rotas (HTTP)
│       ├── database/
│       │   ├── migrations/     # Migrations SQL (DDL) versionadas
│       │   ├── connection.ts   # Conexão com o PostgreSQL
│       │   └── migrate.ts      # Runner de migrations
│       ├── middlewares/        # Autenticação, autorização por cargo, logs e erros
│       ├── models/             # Tipos de domínio
│       ├── repositories/       # Acesso a dados
│       ├── routes/             # Definição dos endpoints
│       ├── services/           # Regras de negócio
│       ├── tests/              # Testes unitários e de integração (Jest)
│       ├── app.ts              # Configuração do app Express
│       └── server.ts           # Inicialização do servidor
├── jest.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 💻 Configuração para desenvolvimento e execução do código

 
Pré-requisitos:
 
- [Node.js](https://nodejs.org/) (versão 22 LTS ou superior — definida em `package.json`).
- Uma instância de **PostgreSQL** acessível (local ou em nuvem).
- Git instalado.

Passo a passo:
 
1. Clone o repositório e acesse a pasta raiz do projeto:
```sh
git clone <url-do-repositorio>
cd g02
```
 
2. Instale as dependências (executar na raiz, onde está o `package.json`):
```sh
npm install
```
 
3. Crie um arquivo `.env` na raiz do projeto com as variáveis necessárias:
```env
DATABASE_URL=postgres://usuario:senha@host:5432/nome_do_banco
JWT_SECRET=defina-uma-senha-forte
PORT=3000
```
 
> A aplicação não inicia sem a variável `DATABASE_URL`. O `JWT_SECRET` deve ser definido para o ambiente de produção (o código possui um valor padrão apenas para desenvolvimento).
 
4. Execute as migrations para criar o esquema do banco:
```sh
npm run migrate
```
 
5. Inicie a aplicação em modo de desenvolvimento:
```sh
npm run dev
```

Scripts disponíveis:
 
| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo watch (desenvolvimento). |
| `npm run migrate` | Executa as migrations SQL no banco. |
| `npm run build` | Compila o TypeScript para `dist/`. |
| `npm start` | Inicia a versão compilada. |
| `npm test` | Executa todos os testes. |
| `npm run test:unit` | Executa apenas os testes unitários. |
| `npm run test:integration` | Executa apenas os testes de integração. |
| `npm run test:coverage` | Executa os testes com relatório de cobertura. |
 

## 🗃 Histórico de lançamentos

* 0.5.0 - XX/XX/2024
    * 
* 0.4.0 - XX/XX/2024
    * 
* 0.3.0 - XX/XX/2024
    * 
* 0.2.0 - XX/XX/2024
    * 
* 0.1.0 - XX/XX/2024
    *

## 📋 Licença/License

<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="#">AgroFlow</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://www.inteli.edu.br/">Inteli</a>, <a href="https://www.linkedin.com/in/ana-clara-silvestre-328706326/" target="_blank" rel="noopener noreferrer">Ana Clara da Silva Silvestre</a>, <a href="https://www.linkedin.com/in/andr%C3%A9-fischer-de-carvalho-5588443b0/" target="_blank" rel="noopener noreferrer">André Fischer de Carvalho</a>, <a href="https://www.linkedin.com/in/enzo-braga-heins-b706603b9/" target="_blank" rel="noopener noreferrer">Enzo Braga Heins</a>, <a href="https://www.linkedin.com/in/fabiana-dias-souza/" target="_blank" rel="noopener noreferrer">Fabiana Dias de Souza</a>, <a href="https://www.linkedin.com/in/jo%C3%A3o-glauco-fernandes-2292513a9//" target="_blank" rel="noopener noreferrer">João Glauco Fernandes Araújo de Freitas</a>, <a href="https://www.linkedin.com/in/levi-correia-silveira-4900a4312/" target="_blank" rel="noopener noreferrer">Levi Correia Silveira</a>, <a href="https://www.linkedin.com/in/matheus-augusto-corr%C3%AAa-santos-0bab03373/?locale=en" target="_blank" rel="noopener noreferrer">Matheus Augusto Corrêa Santos</a>, <a href="https://www.linkedin.com/in/theo-moreda" target="_blank" rel="noopener noreferrer">Théo Pires Morêda</a> is licensed under <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution 4.0 International</a>.</p>