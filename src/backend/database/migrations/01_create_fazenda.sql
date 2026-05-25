CREATE TYPE status_usuario AS ENUM ('ativo', 'inativo');
CREATE TYPE cargo_usuario AS ENUM ('capataz', 'supervisor', 'gerente');
CREATE TYPE prioridade_tarefa AS ENUM ('alta', 'media', 'baixa');
CREATE TYPE status_tarefa AS ENUM ('pendente', 'em_andamento', 'concluida', 'cancelada');
CREATE TYPE tipo_movimentacao AS ENUM ('nascimento', 'morte', 'transferencia', 'compra', 'venda', 'outros');
CREATE TYPE retiro_nome AS ENUM ('Acurizal', 'Aroeira', 'Baia Bonita', 'Bodoquena 1', 'Bonoquena 2', 'Boqueirão', 'Caieira', 'CMB', 'Confinamento', 'Cristo', 'Morada Nova', 'Morro Azul', 'Puga', 'São Miguel', 'Vista Alegre');
CREATE TYPE status_movimentacao AS ENUM ('pendente', 'aprovado', 'rejeitado');
CREATE TYPE estagio_vida AS ENUM ('BEZERRO 0 A 7 MESES', 'GARROTE 8 A 12 MESES', 'NOVILHA 8 A 12 MESES', 'GARROTE 13 A 24 MESES', 'NOVILHA 13 A 24 MESES', 'BOI 25 A 36 MESES', 'NOVILHA 25 A 36 MESES', 'TOURO 25 A 36 MESES', 'VACA ACIMA 36 MESES', 'BOI ACIMA 36 MESES', 'TOURO ACIMA 36 MESES');
CREATE TYPE categoria_ticket AS ENUM ('cerca', 'hidraulica', 'eletrica', 'edificacao', 'abastecimento_agua', 'outro');
CREATE TYPE status_ticket AS ENUM ('aberto', 'em_atendimento', 'resolvido', 'cancelado');
CREATE TYPE tipo_evidencia AS ENUM ('foto', 'audio', 'mensagem');
CREATE TYPE tipo_relatorio AS ENUM ('movimentacao', 'tarefas', 'tickets', 'consolidado');


CREATE TABLE retiro (
    id   UUID         NOT NULL DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE usuario (
    id           UUID               NOT NULL DEFAULT gen_random_uuid(),
    retiro_id    UUID               NOT NULL,
    nome         VARCHAR(255)       NOT NULL,
    login        VARCHAR(255)       NOT NULL UNIQUE,
    senha_hash   VARCHAR(255)       NOT NULL,
    status       status_usuario     NOT NULL,
    data_criacao TIMESTAMP          NOT NULL,
    cargo        cargo_usuario      NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT usuario_retiro_id_foreign FOREIGN KEY (retiro_id) REFERENCES retiro (id)
);

CREATE TABLE tarefa (
    id          UUID             NOT NULL DEFAULT gen_random_uuid(),
    retiro_id   UUID             NOT NULL,
    criada_por  UUID             NOT NULL,
    atribuida_a UUID             NOT NULL,
    descricao   TEXT             NOT NULL,
    categoria   VARCHAR(255)     NOT NULL,
    prioridade  prioridade_tarefa NOT NULL,
    data        TIMESTAMP        NOT NULL,
    status      status_tarefa    NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT tarefa_retiro_id_foreign    FOREIGN KEY (retiro_id)   REFERENCES retiro (id),
    CONSTRAINT tarefa_criada_por_foreign   FOREIGN KEY (criada_por)  REFERENCES usuario (id),
    CONSTRAINT tarefa_atribuida_a_foreign  FOREIGN KEY (atribuida_a) REFERENCES usuario (id)
);

CREATE TABLE movimentacao (
    id           UUID                 NOT NULL DEFAULT gen_random_uuid(),
    retiro_id    UUID                 NOT NULL,
    capataz_id   UUID                 NOT NULL,
    validado_por UUID                 NOT NULL,
    tipo         tipo_movimentacao    NOT NULL,
    origem       retiro_nome          NULL,
    destino      retiro_nome          NULL,
    quantidade   INT                  NOT NULL,
    status       status_movimentacao  NOT NULL,
    sincronizado BOOLEAN              NOT NULL DEFAULT FALSE,
    data_criacao TIMESTAMP            NOT NULL,
    causa_obito  VARCHAR(255)         NULL,
    estagio_vida estagio_vida         NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT movimentacao_retiro_id_foreign    FOREIGN KEY (retiro_id)    REFERENCES retiro (id),
    CONSTRAINT movimentacao_capataz_id_foreign   FOREIGN KEY (capataz_id)   REFERENCES usuario (id),
    CONSTRAINT movimentacao_validado_por_foreign FOREIGN KEY (validado_por) REFERENCES usuario (id),
    CONSTRAINT chk_causa_obito_obrigatoria CHECK (tipo != 'morte' OR causa_obito IS NOT NULL),
    CONSTRAINT chk_transferencia_campos_obrigatorios CHECK (tipo != 'transferencia' OR (origem IS NOT NULL AND destino IS NOT NULL))
);

CREATE TABLE ticket (
    id             UUID            NOT NULL DEFAULT gen_random_uuid(),
    retiro_id      UUID            NOT NULL,
    aberto_por     UUID            NOT NULL,
    categoria      categoria_ticket NOT NULL,
    localizacao    VARCHAR(255)    NOT NULL,
    status         status_ticket   NOT NULL,
    atribuido_a    UUID            NOT NULL,
    descricao      VARCHAR(255)    NOT NULL,
    data_criacao   DATE            NOT NULL,
    data_realizado DATE            NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT ticket_retiro_id_foreign  FOREIGN KEY (retiro_id)   REFERENCES retiro (id),
    CONSTRAINT ticket_aberto_por_foreign FOREIGN KEY (aberto_por)  REFERENCES usuario (id),
    CONSTRAINT ticket_atribuido_a_foreign FOREIGN KEY (atribuido_a) REFERENCES usuario (id)
);

CREATE TABLE evidencia (
    id           UUID           NOT NULL DEFAULT gen_random_uuid(),
    usuario_id   UUID           NOT NULL,
    tipo         tipo_evidencia NOT NULL,
    data_criacao TIMESTAMP      NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT evidencia_usuario_id_foreign FOREIGN KEY (usuario_id) REFERENCES usuario (id)
);

CREATE TABLE evidencia_foto (
    evidencia_id UUID         NOT NULL,
    url_arquivo  VARCHAR(255) NOT NULL,
    latitude     DOUBLE PRECISION NOT NULL,
    longitude    DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (evidencia_id),
    CONSTRAINT evidencia_foto_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia (id),
    CONSTRAINT chk_latitude_valida  CHECK (latitude  >= -90  AND latitude  <= 90),
    CONSTRAINT chk_longitude_valida CHECK (longitude >= -180 AND longitude <= 180)
);

CREATE TABLE evidencia_audio (
    evidencia_id UUID         NOT NULL,
    url_arquivo  VARCHAR(255) NOT NULL,
    PRIMARY KEY (evidencia_id),
    CONSTRAINT evidencia_audio_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia (id)
);

CREATE TABLE evidencia_mensagem (
    evidencia_id UUID NOT NULL,
    conteudo     TEXT NOT NULL,
    PRIMARY KEY (evidencia_id),
    CONSTRAINT evidencia_mensagem_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia (id)
);

CREATE TABLE evidencia_movimentacao (
    evidencia_id    UUID NOT NULL,
    movimentacao_id UUID NOT NULL,
    PRIMARY KEY (evidencia_id, movimentacao_id),
    CONSTRAINT evidencia_movimentacao_evidencia_id_foreign    FOREIGN KEY (evidencia_id)    REFERENCES evidencia (id),
    CONSTRAINT evidencia_movimentacao_movimentacao_id_foreign FOREIGN KEY (movimentacao_id) REFERENCES movimentacao (id)
);

CREATE TABLE evidencia_tarefa (
    evidencia_id UUID NOT NULL,
    tarefa_id    UUID NOT NULL,
    PRIMARY KEY (evidencia_id, tarefa_id),
    CONSTRAINT evidencia_tarefa_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia (id),
    CONSTRAINT evidencia_tarefa_tarefa_id_foreign    FOREIGN KEY (tarefa_id)    REFERENCES tarefa (id)
);

CREATE TABLE evidencia_ticket (
    evidencia_id UUID NOT NULL,
    ticket_id    UUID NOT NULL,
    PRIMARY KEY (evidencia_id, ticket_id),
    CONSTRAINT evidencia_ticket_evidencia_id_foreign FOREIGN KEY (evidencia_id) REFERENCES evidencia (id),
    CONSTRAINT evidencia_ticket_ticket_id_foreign    FOREIGN KEY (ticket_id)    REFERENCES ticket (id)
);

CREATE TABLE relatorio (
    id          UUID             NOT NULL DEFAULT gen_random_uuid(),
    gerado_por  UUID             NULL,
    retiro_id   UUID             NULL,
    tipo        tipo_relatorio   NULL,
    data_inicio DATE             NULL,
    data_fim    DATE             NULL,
    data_gerado TIMESTAMP        NULL,
    url_arquivo VARCHAR(255)     NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT relatorio_gerado_por_foreign FOREIGN KEY (gerado_por) REFERENCES usuario (id),
    CONSTRAINT relatorio_retiro_id_foreign  FOREIGN KEY (retiro_id)  REFERENCES retiro (id)
);

