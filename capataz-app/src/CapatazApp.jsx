/*
 * ============================================================================
 *  Alow / BrPec — Aplicativo do Capataz
 * ----------------------------------------------------------------------------
 *  App mobile do perfil "Capataz", com 7 telas fiéis aos protótipos de alta
 *  fidelidade e alinhado ao Guia de Estilos BrPec (cores, tipografia Poppins
 *  e ícones).
 *
 *  Telas: Confirmação de perfil · Início · Nova Movimentação ·
 *         Movimentação de Morte · Abrir Chamado · Minhas Tarefas ·
 *         Detalhe da Tarefa.
 *
 *  A navegação é feita por uma "pilha" de telas (histórico), o que faz o
 *  botão de voltar levar sempre à tela anterior real.
 * ============================================================================
 */

import React, { useState } from "react";
import {
  Home,
  ArrowLeftRight,
  Megaphone,
  ListChecks,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Camera,
  Mic,
  Pencil,
  MapPin,
  Check,
} from "lucide-react";

// A logo é importada como arquivo (fica em src/assets).
import alowLogo from "./assets/alow-logo.png";

/* ----------------------------------------------------------------------------
 * 1. Tokens de design — Guia de Estilos BrPec
 * Centraliza todas as cores num só lugar para manter consistência.
 * -------------------------------------------------------------------------- */
const cores = {
  primaria: "#2F6C3D", // Verde Principal — botões, header, elementos ativos
  interacao: "#0F5F36", // Verde Escuro — hover, estado ativo, status bar
  texto: "#1F1F1F", // Texto principal
  fundo: "#F7F8F5", // Fundo da aplicação
  positivo: "#7FBF3F", // Verde Claro
  textoSec: "#7C847C", // Texto secundário (legendas, metadados)
  borda: "#D9DED8", // Bordas e divisores
  superficie: "#FFFFFF", // Branco — cards e áreas elevadas
  alerta: "#FF3B30", // Vermelho — prioridade alta, erros
  atencao: "#D99A00", // Amarelo — pendências, prioridade média/baixa
  info: "#3D7EA6", // Azul — informações, confirmações
  sucesso: "#22A855", // Verde — tarefas concluídas, sincronizado
  campo: "#F4F4F0", // Fundo de inputs
};

const FONTE = "'Poppins', system-ui, sans-serif";

/* ----------------------------------------------------------------------------
 * 2. Listas de opções da fazenda
 * Ficam no topo para facilitar a edição (ou troca por dados do back-end).
 * -------------------------------------------------------------------------- */
const RETIROS = [
  "Acurizal",
  "Aroeira",
  "Baia Bonita",
  "Bodoquena 1",
  "Bodoquena 2",
  "Boqueirão",
  "Caieira",
  "CMB",
  "Confinamento",
  "Cristo",
  "Morada Nova",
  "Morro Azul",
  "Puga",
  "São Miguel",
  "Vista Alegre",
];

const TIPOS_MOVIMENTACAO = ["Nascimento", "Morte", "Transferência", "Compra", "Venda"];
const ESTAGIOS_VIDA = ["Bezerro", "Novilho", "Adulto"];
const CAUSAS_OBITO = ["Doença", "Acidente", "Predador", "Causa natural", "Desconhecida"];
const CATEGORIAS_CHAMADO = ["Cerca", "Água", "Equipamento", "Veículo", "Energia", "Estoque", "Outro"];
const PRIORIDADES = ["Crítica", "Alta", "Média", "Baixa"];

/* ----------------------------------------------------------------------------
 * 3. Estilos reutilizáveis
 * -------------------------------------------------------------------------- */
const areaRolavel = { flex: 1, overflowY: "auto", padding: "20px 18px 8px" };

const botaoPrimario = {
  width: "100%",
  padding: 17,
  background: cores.primaria,
  color: "#fff",
  border: "none",
  borderRadius: 14,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: FONTE,
};

/* ----------------------------------------------------------------------------
 * 4. Componentes de estrutura (moldura do celular, header e barra inferior)
 * -------------------------------------------------------------------------- */

// Moldura que simula a tela de um celular.
function Celular({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#d7d7d2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: FONTE,
      }}
    >
      <div
        style={{
          width: 390,
          height: 820,
          background: cores.fundo,
          borderRadius: 44,
          boxShadow: "0 40px 80px -20px rgba(0,0,0,.45)",
          overflow: "hidden",
          position: "relative",
          border: "10px solid #15151a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Cabeçalho verde do topo, com título e botão de voltar opcional.
function Cabecalho({ titulo, aoVoltar }) {
  return (
    <div style={{ background: cores.interacao, paddingTop: 18 }}>
      <div
        style={{
          background: cores.primaria,
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {aoVoltar && (
          <button
            onClick={aoVoltar}
            style={{
              position: "absolute",
              left: 14,
              background: "rgba(255,255,255,.2)",
              border: "none",
              borderRadius: 12,
              width: 38,
              height: 38,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={20} color="#fff" />
          </button>
        )}
        <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{titulo}</span>
      </div>
    </div>
  );
}

// Barra de navegação inferior. Os ícones seguem o Guia de Estilos.
function BarraInferior({ ativa, navegar }) {
  const abas = [
    { id: "inicio", rotulo: "Início", Icone: Home },
    { id: "movimentacao", rotulo: "Movimentação", Icone: ArrowLeftRight },
    { id: "tickets", rotulo: "Tickets", Icone: Megaphone },
    { id: "tarefas", rotulo: "Tarefas", Icone: ListChecks },
  ];

  return (
    <div
      style={{
        borderTop: "1px solid " + cores.borda,
        background: cores.superficie,
        display: "flex",
        padding: "10px 6px 14px",
      }}
    >
      {abas.map(({ id, rotulo, Icone }) => {
        const ativo = ativa === id;
        return (
          <button
            key={id}
            onClick={() => navegar(id)}
            style={{
              flex: 1,
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              paddingTop: 4,
              position: "relative",
            }}
          >
            {/* Marcador verde acima da aba ativa */}
            {ativo && (
              <span
                style={{
                  position: "absolute",
                  top: -10,
                  width: 26,
                  height: 3,
                  borderRadius: 3,
                  background: cores.primaria,
                }}
              />
            )}
            <Icone size={21} color={ativo ? cores.primaria : cores.textoSec} strokeWidth={ativo ? 2.4 : 1.8} />
            <span
              style={{
                fontSize: 10,
                color: ativo ? cores.primaria : cores.textoSec,
                fontWeight: ativo ? 600 : 400,
              }}
            >
              {rotulo}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Logo Alow (imagem real, com fundo transparente).
function Logo({ tamanho = 140 }) {
  return <img src={alowLogo} alt="Alow" width={tamanho} style={{ height: "auto", display: "block" }} />;
}

/* ----------------------------------------------------------------------------
 * 5. Peças de formulário reutilizáveis
 * -------------------------------------------------------------------------- */

// Rótulo + conteúdo de um campo. "obrigatorio" mostra um asterisco vermelho.
function Campo({ rotulo, obrigatorio, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: cores.texto }}>
        {rotulo}
        {obrigatorio && <span style={{ color: cores.alerta }}> *</span>}
      </label>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}

// Dropdown: ao clicar, abre uma lista de opções para o usuário selecionar.
function Dropdown({ valor, placeholder, opcoes = [], erro, aoSelecionar }) {
  const [aberto, setAberto] = useState(false);
  const vazio = !valor;

  return (
    <div style={{ position: "relative" }}>
      {/* Campo clicável */}
      <button
        onClick={() => setAberto((estava) => !estava)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "14px 16px",
          background: cores.campo,
          border: erro
            ? "1px solid " + cores.alerta
            : aberto
            ? "2px solid " + cores.primaria
            : "1px solid " + cores.borda,
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 15,
          color: vazio ? cores.textoSec : cores.texto,
          cursor: "pointer",
          fontFamily: FONTE,
        }}
      >
        {valor || placeholder}
        <ChevronDown
          size={18}
          color={cores.textoSec}
          style={{ transform: aberto ? "rotate(180deg)" : "none", transition: "transform .2s" }}
        />
      </button>

      {/* Lista de opções (aparece só quando aberto) */}
      {aberto && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: cores.superficie,
            border: "1px solid " + cores.borda,
            borderRadius: 12,
            boxShadow: "0 16px 36px -16px rgba(0,0,0,.28)",
            zIndex: 20,
            overflow: "hidden",
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {opcoes.map((opcao, indice) => {
            const selecionada = opcao === valor;
            return (
              <button
                key={indice}
                onClick={() => {
                  aoSelecionar(opcao);
                  setAberto(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "13px 16px",
                  background: selecionada ? "#eef5f0" : cores.superficie,
                  border: "none",
                  borderBottom: indice < opcoes.length - 1 ? "1px solid " + cores.borda : "none",
                  fontSize: 15,
                  color: cores.texto,
                  cursor: "pointer",
                  fontFamily: FONTE,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {opcao}
                {selecionada && <Check size={16} color={cores.primaria} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Caixa de evidência com os três botões: Foto, Áudio e Texto.
function CaixaEvidencia({ texto = "", setTexto = () => {} }) {
  const [textoAtivo, setTextoAtivo] = useState(false);

  const botao = (cor, Icone, rotulo, onClick, ativo) => (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        background: ativo ? cores.interacao : cor,
        color: "#fff",
        borderRadius: 12,
        padding: "12px 6px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        outline: ativo ? "2px solid " + cores.primaria : "none",
        outlineOffset: 2,
      }}
    >
      <Icone size={17} /> {rotulo}
    </div>
  );

  return (
    <Campo rotulo="Evidência (obrigatório)">
      <div
        style={{
          border: "1.5px dashed " + cores.borda,
          borderRadius: 14,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {botao(cores.primaria, Camera, "Foto", undefined, false)}
          {botao(cores.info, Mic, "Áudio", undefined, false)}
          {botao(cores.atencao, Pencil, "Texto", () => setTextoAtivo((v) => !v), textoAtivo)}
        </div>

        {textoAtivo && (
          <textarea
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Descreva a evidência em texto..."
            rows={3}
            style={{
              width: "100%",
              padding: 14,
              background: cores.campo,
              border: "1px solid " + cores.borda,
              borderRadius: 12,
              fontSize: 15,
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: FONTE,
              color: cores.texto,
            }}
          />
        )}
      </div>
    </Campo>
  );
}

// Etiqueta colorida de prioridade ou status.
function Etiqueta({ nivel }) {
  const paleta = {
    Alta: cores.alerta,
    Média: cores.info,
    Baixa: cores.textoSec,
    Crítica: "#8a1c1c",
    Concluída: cores.primaria,
  };
  const fundo = paleta[nivel] || cores.textoSec;

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 20,
        background: fundo,
        color: "#fff",
        whiteSpace: "nowrap",
      }}
    >
      {nivel}
    </span>
  );
}

/* ----------------------------------------------------------------------------
 * 6. Tela 01 — Confirmação de perfil
 * -------------------------------------------------------------------------- */
function TelaPerfil({ navegar }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "70px 28px 24px",
      }}
    >
      <Logo tamanho={150} />

      <p style={{ color: cores.textoSec, fontSize: 14, margin: "30px 0 6px" }}>Você está registrado como</p>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: cores.texto,
          textAlign: "center",
          lineHeight: 1.15,
          margin: 0,
        }}
      >
        Daniel Carvalho
        <br />
        seu perfil
      </h1>

      <div
        style={{
          background: cores.superficie,
          borderRadius: 22,
          padding: 24,
          width: "100%",
          marginTop: 30,
          boxShadow: "0 16px 40px -22px rgba(0,0,0,.25)",
        }}
      >
        <p style={{ textAlign: "center", color: cores.textoSec, fontSize: 13, marginBottom: 16 }}>
          Confirme seu acesso para continuar
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            marginBottom: 18,
          }}
        >
          {/* Avatar com as iniciais */}
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "#bcd6c1",
              display: "grid",
              placeItems: "center",
              color: cores.interacao,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            DF
          </div>
          <span style={{ fontWeight: 700, color: cores.texto, fontSize: 15 }}>Daniel Carvalho</span>
        </div>
        <button onClick={() => navegar("inicio")} style={botaoPrimario}>
          Entrar
        </button>
      </div>

      <span style={{ marginTop: "auto", color: cores.textoSec, fontSize: 12 }}>v1.0.0</span>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * 7. Tela 02 — Início (Home)
 * -------------------------------------------------------------------------- */

// Card de atalho usado na Home (tarefa ou operação de campo).
function CardAtalho({ corBarra, titulo, subtitulo, nivel, aoClicar }) {
  return (
    <button
      onClick={aoClicar}
      style={{
        width: "100%",
        textAlign: "left",
        background: cores.superficie,
        border: "none",
        borderRadius: 16,
        padding: "16px 14px 16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        marginBottom: 12,
        boxShadow: "0 10px 24px -18px rgba(0,0,0,.3)",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONTE,
      }}
    >
      {/* Barra colorida à esquerda */}
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 10,
          bottom: 10,
          width: 5,
          borderRadius: 4,
          background: corBarra,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: cores.texto }}>{titulo}</div>
        <div style={{ fontSize: 13, color: cores.textoSec, marginTop: 3 }}>{subtitulo}</div>
      </div>
      {nivel && <Etiqueta nivel={nivel} />}
      <ChevronRight size={18} color={cores.textoSec} />
    </button>
  );
}

function TelaInicio({ navegar }) {
  return (
    <>
      <Cabecalho titulo="Início" />

      {/* Saudação e status de sincronização */}
      <div style={{ background: "#eceae4", padding: "18px 18px 20px" }}>
        <h2 style={{ fontSize: 23, fontWeight: 700, color: cores.texto, margin: 0 }}>
          Bom dia, Daniel Carvalho!
        </h2>
        <p style={{ color: cores.textoSec, fontSize: 14, margin: "4px 0 10px" }}>
          Sexta-feira, 29 de maio de 2026
        </p>
        <span
          style={{
            display: "inline-block",
            background: "#dff3e6",
            color: cores.sucesso,
            fontSize: 11,
            fontWeight: 600,
            padding: "5px 12px",
            borderRadius: 20,
          }}
        >
          ✓ Sincronizado
        </span>
      </div>

      <div style={areaRolavel}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: cores.texto, margin: "6px 0 14px" }}>
          Minhas tarefas
        </h3>
        <CardAtalho
          corBarra={cores.alerta}
          titulo="Vacinação lote B"
          subtitulo="Supervisor Luiz • Alta • Amanhã 08h"
          nivel="Alta"
          aoClicar={() => navegar("detalhe")}
        />
        <CardAtalho
          corBarra={cores.info}
          titulo="Conferência do rebanho"
          subtitulo="Supervisor Luiz • Média • Hoje 14h"
          nivel="Média"
          aoClicar={() => navegar("detalhe")}
        />

        <h3 style={{ fontSize: 18, fontWeight: 600, color: cores.texto, margin: "20px 0 14px" }}>
          Operações de campo
        </h3>
        <CardAtalho
          corBarra={cores.primaria}
          titulo="Registrar movimentação"
          subtitulo="Nascimento, morte, transferência..."
          aoClicar={() => navegar("novaMovimentacao")}
        />
        <CardAtalho
          corBarra={cores.atencao}
          titulo="Abrir chamado"
          subtitulo="Reportar problema de infraestrutura"
          aoClicar={() => navegar("novoChamado")}
        />
      </div>
    </>
  );
}

/* ----------------------------------------------------------------------------
 * 8. Telas 03/04 — Nova Movimentação (com fluxo especial de Morte)
 * -------------------------------------------------------------------------- */
function TelaMovimentacao({ aoVoltar, aoSalvar }) {
  const [tipo, setTipo] = useState("");
  const [retiro, setRetiro] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [estagio, setEstagio] = useState("");
  const [causa, setCausa] = useState("");
  const [textoEvidencia, setTextoEvidencia] = useState("");
  const [tentouSalvar, setTentouSalvar] = useState(false);

  const ehMorte = tipo === "Morte";

  const estiloInput = (erro) => ({
    width: "100%",
    padding: "14px 16px",
    background: cores.campo,
    border: "1px solid " + (erro ? cores.alerta : cores.borda),
    borderRadius: 12,
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: FONTE,
  });

  const salvar = () => {
    setTentouSalvar(true);
    const invalido =
      !tipo ||
      !quantidade ||
      (ehMorte && !causa) ||
      (!ehMorte && tipo && (!origem || !destino));
    if (invalido) return;
    aoSalvar({ tipo, retiro, origem, destino, quantidade, estagio, causa, textoEvidencia });
  };

  return (
    <>
      <Cabecalho titulo="Nova Movimentação" aoVoltar={aoVoltar} />
      <div style={areaRolavel}>
        <Campo rotulo="Tipo de movimentação" obrigatorio>
          <Dropdown
            valor={tipo}
            placeholder="Nascimento / Morte / Transferência..."
            opcoes={TIPOS_MOVIMENTACAO}
            erro={tentouSalvar && !tipo}
            aoSelecionar={setTipo}
          />
        </Campo>

        {ehMorte ? (
          <>
            <Campo rotulo="Retiro">
              <Dropdown valor={retiro} placeholder="Selecione o retiro" opcoes={RETIROS} aoSelecionar={setRetiro} />
            </Campo>
            <Campo rotulo="Quantidade" obrigatorio>
              <input
                placeholder="Ex: 3"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                style={estiloInput(tentouSalvar && !quantidade)}
              />
            </Campo>
            <Campo rotulo="Estágio da vida">
              <Dropdown
                valor={estagio}
                placeholder="Bezerro / Novilho / Adulto"
                opcoes={ESTAGIOS_VIDA}
                aoSelecionar={setEstagio}
              />
            </Campo>
            <Campo rotulo="Causa do óbito" obrigatorio>
              <Dropdown
                valor={causa}
                placeholder="Selecione a causa..."
                opcoes={CAUSAS_OBITO}
                erro={tentouSalvar && !causa}
                aoSelecionar={setCausa}
              />
            </Campo>
          </>
        ) : (
          <>
            <Campo rotulo="Retiro de origem" obrigatorio>
              <Dropdown
                valor={origem}
                placeholder="Selecione o retiro"
                opcoes={RETIROS}
                erro={tentouSalvar && tipo && !origem}
                aoSelecionar={setOrigem}
              />
            </Campo>
            <Campo rotulo="Retiro de destino" obrigatorio>
              <Dropdown
                valor={destino}
                placeholder="Selecione o retiro"
                opcoes={RETIROS}
                erro={tentouSalvar && tipo && !destino}
                aoSelecionar={setDestino}
              />
            </Campo>
            <Campo rotulo="Quantidade de animais" obrigatorio>
              <input
                placeholder="Ex: 12"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                style={estiloInput(tentouSalvar && !quantidade)}
              />
            </Campo>
            <Campo rotulo="Estágio da vida">
              <Dropdown
                valor={estagio}
                placeholder="Bezerro / Novilho / Adulto"
                opcoes={ESTAGIOS_VIDA}
                aoSelecionar={setEstagio}
              />
            </Campo>
          </>
        )}

        <CaixaEvidencia texto={textoEvidencia} setTexto={setTextoEvidencia} />
        <button onClick={salvar} style={{ ...botaoPrimario, marginTop: 6 }}>
          Salvar movimentação
        </button>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------------------
 * 9. Tela 05 — Abrir Chamado (Ticket de Infraestrutura)
 * -------------------------------------------------------------------------- */
function TelaChamado({ aoVoltar, aoSalvar }) {
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [textoEvidencia, setTextoEvidencia] = useState("");
  const [tentouSalvar, setTentouSalvar] = useState(false);

  const descricaoInvalida = tentouSalvar && descricao.trim().length < 10;

  const enviar = () => {
    setTentouSalvar(true);
    if (!categoria || !prioridade || descricao.trim().length < 10) return;
    aoSalvar({ categoria, prioridade, descricao: descricao.trim(), textoEvidencia });
  };

  return (
    <>
      <Cabecalho titulo="Ticket de Infraestrutura" aoVoltar={aoVoltar} />
      <div style={areaRolavel}>
        <Campo rotulo="Categoria do problema" obrigatorio>
          <Dropdown
            valor={categoria}
            placeholder="Cerca / Água / Equipamento..."
            opcoes={CATEGORIAS_CHAMADO}
            erro={tentouSalvar && !categoria}
            aoSelecionar={setCategoria}
          />
        </Campo>
        <Campo rotulo="Prioridade" obrigatorio>
          <Dropdown
            valor={prioridade}
            placeholder="Alta / Média / Baixa / Crítica"
            opcoes={PRIORIDADES}
            erro={tentouSalvar && !prioridade}
            aoSelecionar={setPrioridade}
          />
        </Campo>
        <Campo rotulo="Descrição (mínimo 10 caracteres)" obrigatorio>
          <textarea
            placeholder="Descreva o problema encontrado..."
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={{
              width: "100%",
              padding: 14,
              background: cores.campo,
              border: "1px solid " + (descricaoInvalida ? cores.alerta : cores.borda),
              borderRadius: 12,
              fontSize: 15,
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: FONTE,
              color: cores.texto,
            }}
          />
          {descricaoInvalida && (
            <span style={{ fontSize: 12, color: cores.alerta, marginTop: 4, display: "block" }}>
              Mínimo de 10 caracteres ({descricao.trim().length}/10)
            </span>
          )}
        </Campo>

        <CaixaEvidencia texto={textoEvidencia} setTexto={setTextoEvidencia} />

        <div
          style={{
            background: "#eef7f0",
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            color: cores.interacao,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          <MapPin size={15} /> Localização será registrada automaticamente
        </div>

        <button onClick={enviar} style={botaoPrimario}>Enviar chamado</button>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------------------
 * 10. Telas de lista — Movimentações e Tickets
 * -------------------------------------------------------------------------- */
function CardMovimentacao({ mov }) {
  const corBarra = mov.tipo === "Morte" ? cores.alerta : mov.tipo === "Transferência" ? cores.info : cores.sucesso;
  const subtitulo =
    mov.tipo === "Morte"
      ? `${mov.retiro || "Sem retiro"} • ${mov.causa}`
      : `${mov.origem || "—"} → ${mov.destino || "—"}`;
  const hora = mov.criadaEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      style={{
        background: cores.superficie,
        borderRadius: 14,
        padding: "14px 14px 14px 18px",
        marginBottom: 12,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 20px -18px rgba(0,0,0,.3)",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 5,
          borderRadius: 4,
          background: corBarra,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: cores.texto }}>{mov.tipo}</div>
          <div style={{ fontSize: 13, color: cores.textoSec, marginTop: 3 }}>{subtitulo}</div>
          {mov.quantidade && (
            <div style={{ fontSize: 13, color: cores.textoSec, marginTop: 2 }}>
              {mov.quantidade} animal(is){mov.estagio ? ` • ${mov.estagio}` : ""}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
              background: corBarra,
              color: "#fff",
            }}
          >
            {mov.tipo}
          </span>
          <div style={{ fontSize: 11, color: cores.textoSec, marginTop: 6 }}>Hoje, {hora}</div>
        </div>
      </div>
    </div>
  );
}

function TelaListaMovimentacoes({ movimentacoes, navegar }) {
  return (
    <>
      <Cabecalho titulo="Movimentações" />
      <div style={areaRolavel}>
        <button onClick={() => navegar("novaMovimentacao")} style={{ ...botaoPrimario, marginBottom: 20 }}>
          + Nova Movimentação
        </button>
        {movimentacoes.length === 0 ? (
          <p style={{ textAlign: "center", color: cores.textoSec, fontSize: 14, marginTop: 24 }}>
            Nenhuma movimentação registrada ainda.
          </p>
        ) : (
          movimentacoes.map((mov) => <CardMovimentacao key={mov.id} mov={mov} />)
        )}
      </div>
    </>
  );
}

function CardTicket({ ticket }) {
  const corPrioridade = {
    Crítica: "#8a1c1c",
    Alta: cores.alerta,
    Média: cores.info,
    Baixa: cores.textoSec,
  };
  const cor = corPrioridade[ticket.prioridade] || cores.textoSec;
  const hora = ticket.criadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      style={{
        background: cores.superficie,
        borderRadius: 14,
        padding: "14px 14px 14px 18px",
        marginBottom: 12,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 20px -18px rgba(0,0,0,.3)",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 5,
          borderRadius: 4,
          background: cor,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: cores.texto }}>{ticket.categoria}</div>
          <div style={{ fontSize: 13, color: cores.textoSec, marginTop: 3 }}>
            {ticket.descricao.length > 60 ? ticket.descricao.slice(0, 60) + "…" : ticket.descricao}
          </div>
          <div style={{ fontSize: 11, color: cores.textoSec, marginTop: 6 }}>Hoje, {hora}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <Etiqueta nivel={ticket.prioridade} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
              background: "#dff3e6",
              color: cores.sucesso,
            }}
          >
            Aberto
          </span>
        </div>
      </div>
    </div>
  );
}

function TelaListaTickets({ tickets, navegar }) {
  return (
    <>
      <Cabecalho titulo="Tickets" />
      <div style={areaRolavel}>
        <button onClick={() => navegar("novoChamado")} style={{ ...botaoPrimario, marginBottom: 20 }}>
          + Novo Chamado
        </button>
        {tickets.length === 0 ? (
          <p style={{ textAlign: "center", color: cores.textoSec, fontSize: 14, marginTop: 24 }}>
            Nenhum chamado registrado ainda.
          </p>
        ) : (
          tickets.map((t) => <CardTicket key={t.id} ticket={t} />)
        )}
      </div>
    </>
  );
}

/* ----------------------------------------------------------------------------
 * 11. Tela 06 — Minhas Tarefas
 * -------------------------------------------------------------------------- */

// Linha de tarefa da lista.
function LinhaTarefa({ corBarra, titulo, subtitulo, nivel, aoClicar }) {
  return (
    <button
      onClick={aoClicar}
      style={{
        width: "100%",
        textAlign: "left",
        background: cores.superficie,
        border: "none",
        borderRadius: 14,
        padding: "14px 14px 14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        marginBottom: 12,
        boxShadow: "0 8px 20px -18px rgba(0,0,0,.3)",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONTE,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 5,
          borderRadius: 4,
          background: corBarra,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: cores.texto }}>{titulo}</div>
        <div style={{ fontSize: 13, color: cores.textoSec, marginTop: 4 }}>{subtitulo}</div>
      </div>
      <Etiqueta nivel={nivel} />
      <ChevronRight size={18} color={cores.textoSec} />
    </button>
  );
}

function TelaTarefas({ navegar }) {
  const [busca, setBusca] = useState("");

  const todasTarefas = [
    [cores.alerta, "Vacinação lote B - Aroeira", "Supervisor Luiz • Amanhã 08:00", "Alta"],
    [cores.info, "Conferência do rebanho - CMB", "Supervisor Luiz • Hoje 14:00", "Média"],
    [cores.textoSec, "Inspeção sanitária - Puga", "Supervisor Luiz • Sex 10:00", "Baixa"],
    [cores.primaria, "Alimentação suplementar - Cristo", "Supervisor Alberto • há 2 dias", "Concluída"],
    [cores.primaria, "Movimentação - Bodoquena", "Supervisor José • há 3 dias", "Concluída"],
  ];

  const tarefas = busca.trim()
    ? todasTarefas.filter((t) => t[1].toLowerCase().includes(busca.toLowerCase()) || t[2].toLowerCase().includes(busca.toLowerCase()))
    : todasTarefas;

  return (
    <>
      <Cabecalho titulo="Minhas Tarefas" />
      <div style={areaRolavel}>
        {/* Barra de busca */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: cores.campo,
            border: "1px solid " + cores.borda,
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>🔍</span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar tarefas..."
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: 14,
              color: cores.texto,
              outline: "none",
              fontFamily: FONTE,
            }}
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              style={{ border: "none", background: "none", cursor: "pointer", color: cores.textoSec, fontSize: 16, lineHeight: 1, padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>

        {tarefas.length === 0 ? (
          <p style={{ textAlign: "center", color: cores.textoSec, fontSize: 14, marginTop: 32 }}>
            Nenhuma tarefa encontrada.
          </p>
        ) : (
          tarefas.map((t, i) => (
            <LinhaTarefa
              key={i}
              corBarra={t[0]}
              titulo={t[1]}
              subtitulo={t[2]}
              nivel={t[3]}
              aoClicar={() => navegar("detalhe")}
            />
          ))
        )}
      </div>
    </>
  );
}

/* ----------------------------------------------------------------------------
 * 11. Tela 07 — Detalhe da Tarefa
 * -------------------------------------------------------------------------- */

// Linha "rótulo: valor" da ficha de detalhes.
function LinhaDetalhe({ rotulo, valor, ultima }) {
  return (
    <div
      style={{
        display: "flex",
        padding: "12px 0",
        borderBottom: ultima ? "none" : "1px solid " + cores.borda,
      }}
    >
      <span style={{ width: 110, color: cores.textoSec, fontSize: 14, fontWeight: 500 }}>{rotulo}</span>
      <span style={{ flex: 1, color: cores.texto, fontSize: 14, fontWeight: 500 }}>{valor}</span>
    </div>
  );
}

function TelaDetalhe({ aoVoltar }) {
  // Guarda se a tarefa já foi marcada como concluída.
  const [concluida, setConcluida] = useState(false);

  return (
    <>
      <Cabecalho titulo="Detalhe da Tarefa" aoVoltar={aoVoltar} />
      <div style={areaRolavel}>
        {/* Cartão de resumo da tarefa */}
        <div
          style={{
            background: cores.superficie,
            borderRadius: 16,
            padding: "16px 16px 16px 18px",
            position: "relative",
            overflow: "hidden",
            marginBottom: 18,
            boxShadow: "0 10px 24px -18px rgba(0,0,0,.3)",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 10,
              bottom: 10,
              width: 5,
              borderRadius: 4,
              background: cores.alerta,
            }}
          />
          <div style={{ paddingLeft: 6 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: cores.texto }}>Vacinação lote B — Aroeira</div>
            <div style={{ fontSize: 13, color: cores.textoSec, margin: "4px 0 10px" }}>Criada por Supervisor Luiz</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Etiqueta nivel="Alta" />
              <span style={{ fontSize: 13, color: cores.textoSec }}>Amanhã, 08:00</span>
            </div>
            <div style={{ fontSize: 13, color: cores.textoSec, marginTop: 10 }}>Saúde animal</div>
          </div>
        </div>

        {/* Ficha de dados */}
        <LinhaDetalhe rotulo="Retiro" valor="Fazenda Aroeira" />
        <LinhaDetalhe rotulo="Data" valor="30/05/2026 às 08:00" />
        <LinhaDetalhe rotulo="Status" valor={concluida ? "Concluída" : "Pendente"} />
        <LinhaDetalhe rotulo="Supervisor" valor="Luiz Ferreira" ultima />

        {/* Descrição */}
        <label style={{ fontSize: 13, fontWeight: 600, color: cores.texto, display: "block", margin: "14px 0 8px" }}>
          Descrição
        </label>
        <div
          style={{
            background: cores.superficie,
            border: "1px solid " + cores.borda,
            borderRadius: 12,
            padding: 14,
            fontSize: 14,
            color: cores.textoSec,
            marginBottom: 18,
          }}
        >
          Aplicar vacina contra febre aftosa no lote B. Usar EPI completo.
        </div>

        {/* Ações */}
        <button
          onClick={() => setConcluida(true)}
          style={{
            ...botaoPrimario,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {concluida && <Check size={18} />} {concluida ? "Concluída" : "Marcar como concluída"}
        </button>
        <button
          style={{
            width: "100%",
            padding: 16,
            background: cores.superficie,
            color: cores.primaria,
            border: "2px solid " + cores.primaria,
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: FONTE,
          }}
        >
          Anexar evidência
        </button>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------------------
 * 12. Componente principal — controla a navegação entre as telas
 * -------------------------------------------------------------------------- */

// Telas que aparecem na barra inferior.
const ABAS = ["inicio", "movimentacao", "tickets", "tarefas"];

export default function CapatazApp() {
  const [pilha, setPilha] = useState(["perfil"]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [tickets, setTickets] = useState([]);

  const telaAtual = pilha[pilha.length - 1];

  const navegar = (proxima) =>
    setPilha((atual) => (atual[atual.length - 1] === proxima ? atual : [...atual, proxima]));

  const voltar = () => setPilha((atual) => (atual.length > 1 ? atual.slice(0, -1) : atual));

  const salvarMovimentacao = (mov) => {
    setMovimentacoes((prev) => [{ ...mov, id: Date.now(), criadaEm: new Date() }, ...prev]);
    voltar();
  };

  const salvarTicket = (ticket) => {
    setTickets((prev) => [{ ...ticket, id: Date.now(), criadoEm: new Date(), status: "Aberto" }, ...prev]);
    voltar();
  };

  const dentroDoApp =
    ABAS.includes(telaAtual) ||
    ["detalhe", "novaMovimentacao", "novoChamado"].includes(telaAtual);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <Celular>
        {telaAtual === "perfil" && <TelaPerfil navegar={navegar} />}
        {telaAtual === "inicio" && <TelaInicio navegar={navegar} />}
        {telaAtual === "movimentacao" && <TelaListaMovimentacoes movimentacoes={movimentacoes} navegar={navegar} />}
        {telaAtual === "novaMovimentacao" && <TelaMovimentacao aoVoltar={voltar} aoSalvar={salvarMovimentacao} />}
        {telaAtual === "tickets" && <TelaListaTickets tickets={tickets} navegar={navegar} />}
        {telaAtual === "novoChamado" && <TelaChamado aoVoltar={voltar} aoSalvar={salvarTicket} />}
        {telaAtual === "tarefas" && <TelaTarefas navegar={navegar} />}
        {telaAtual === "detalhe" && <TelaDetalhe aoVoltar={voltar} />}

        {dentroDoApp && (
          <BarraInferior ativa={ABAS.includes(telaAtual) ? telaAtual : "tarefas"} navegar={navegar} />
        )}
      </Celular>
    </>
  );
}
