
--------------
Tabela: retiro
--------------

CREATE TABLE `retiro` (
    `id`        CHAR(36)     NOT NULL,
    `nome`      VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
);

---------------
Tabela: usuario
---------------

CREATE TABLE `usuario` (
    `id`         CHAR(36)                 NOT NULL,
    `retiro_id`  CHAR(36)                 NOT NULL,
    `nome`       VARCHAR(255)             NOT NULL,
    `login`      VARCHAR(255)             NOT NULL,
    `senha_hash` VARCHAR(255)             NOT NULL,
    `status`     ENUM('ativo', 'inativo') NOT NULL,
    `data_criacao`  TIMESTAMP                NOT NULL,
    `cargo`     ENUM('capataz', 'supervisor', 'gerente') NOT NULL,
    PRIMARY KEY (`id`)
);

ALTER TABLE `usuario`
    ADD UNIQUE `usuario_login_unique` (`login`);

ALTER TABLE `usuario`
    ADD CONSTRAINT `usuario_retiro_id_foreign`
    FOREIGN KEY (`retiro_id`) REFERENCES `retiro` (`id`);

--------------
Tabela: tarefa
--------------

CREATE TABLE `tarefa` (
    `id`          CHAR(36)                                                   NOT NULL,
    `retiro_id`   CHAR(36)                                                   NOT NULL,
    `criada_por`  CHAR(36)                                                   NOT NULL,
    `atribuida_a` CHAR(36)                                                   NOT NULL,
    `descricao`   TEXT                                                       NOT NULL,
    `categoria`   VARCHAR(255)                                               NOT NULL,
    `prioridade`  ENUM('alta', 'media', 'baixa')                             NOT NULL,
    `data`        TIMESTAMP                                                       NOT NULL,
    `status`      ENUM('pendente', 'em_andamento', 'concluida', 'cancelada') NOT NULL,
    PRIMARY KEY (`id`)
);

ALTER TABLE `tarefa`
    ADD CONSTRAINT `tarefa_retiro_id_foreign`
    FOREIGN KEY (`retiro_id`) REFERENCES `retiro` (`id`);

ALTER TABLE `tarefa`
    ADD CONSTRAINT `tarefa_criada_por_foreign`
    FOREIGN KEY (`criada_por`) REFERENCES `usuario` (`id`);

ALTER TABLE `tarefa`
    ADD CONSTRAINT `tarefa_atribuida_a_foreign`
    FOREIGN KEY (`atribuida_a`) REFERENCES `usuario` (`id`);

--------------------
Tabela: movimentacao
--------------------

CREATE TABLE `movimentacao` (
    `id`           CHAR(36)                                                        NOT NULL,
    `retiro_id`    CHAR(36)                                                        NOT NULL,
    `capataz_id`   CHAR(36)                                                        NOT NULL,
    `validado_por` CHAR(36)                                                        NOT NULL,
    `tipo`         ENUM('nascimento', 'morte', 'transferencia', 'compra', 'venda', 'outros') NOT NULL,
    `origem`       ENUM('Acurizal', 'Aroeira', 'Baia Bonita', 'Bodoquena 1', 'Bonoquena 2', 'Boqueirão', 'Caieira', 'CMB', 'Confinamento', 'Cristo', 'Morada Nova', 'Morro Azul', 'Puga', 'São Miguel', 'Vista Alegre')                                                 NULL,
    `destino`      ENUM('Acurizal', 'Aroeira', 'Baia Bonita', 'Bodoquena 1', 'Bonoquena 2', 'Boqueirão', 'Caieira', 'CMB', 'Confinamento', 'Cristo', 'Morada Nova', 'Morro Azul', 'Puga', 'São Miguel', 'Vista Alegre')                                                            NULL,
    `quantidade`   INT                                                             NOT NULL,
    `status`       ENUM('pendente', 'aprovado', 'rejeitado')                       NOT NULL,
    `sincronizado` BOOLEAN                                                         NOT NULL DEFAULT 0,
    `data_criacao`    TIMESTAMP                                                       NOT NULL,
    `causa_obito`  VARCHAR(255)                                                    NULL,
    `estagio_vida` ENUM('BEZERRO 0 A 7 MESES', 'GARROTE 8 A 12 MESES','NOVILHA 8 A 12 MESES','GARROTE 13 A 24 MESES', 'NOVILHA 13 A 24 MESES', 'BOI 25 A 36 MESES', 'NOVILHA 25 A 36 MESES', 'TOURO 25 A 36 MESES', 'VACA ACIMA 36 MESES', 'BOI ACIMA 36 MESES', 'TOURO ACIMA 36 MESES')                                                     NOT NULL,

    PRIMARY KEY (`id`)
);

ALTER TABLE `movimentacao`
    ADD CONSTRAINT `movimentacao_retiro_id_foreign`
    FOREIGN KEY (`retiro_id`) REFERENCES `retiro` (`id`);

ALTER TABLE `movimentacao`
    ADD CONSTRAINT `movimentacao_capataz_id_foreign`
    FOREIGN KEY (`capataz_id`) REFERENCES `usuario` (`id`);

ALTER TABLE `movimentacao`
    ADD CONSTRAINT `movimentacao_validado_por_foreign`
    FOREIGN KEY (`validado_por`) REFERENCES `usuario` (`id`);

ALTER TABLE `movimentacao`
    ADD CONSTRAINT `chk_causa_obito_obrigatoria`
    CHECK (
        `tipo` != 'morte' OR `causa_obito` IS NOT NULL
    );

ALTER TABLE `movimentacao`
    ADD CONSTRAINT `chk_transferencia_campos_obrigatorios`
    CHECK (
        `tipo` != 'transferencia' 
        OR (`origem` IS NOT NULL AND `destino` IS NOT NULL)
    );
--------------
Tabela: ticket
--------------

CREATE TABLE `ticket` (
    `id`          CHAR(36)                                                                           NOT NULL,
    `retiro_id`   CHAR(36)                                                                           NOT NULL,
    `aberto_por`  CHAR(36)                                                                           NOT NULL,
    `categoria`   ENUM('cerca', 'hidraulica', 'eletrica', 'edificacao', 'abastecimento_agua', 'outro') NOT NULL,
    `localizacao` VARCHAR(255)                                                                       NOT NULL,
    `status`      ENUM('aberto', 'em_atendimento', 'resolvido', 'cancelado')                         NOT NULL,
    `atribuido_a` CHAR(36)                                                                           NOT NULL,
    `descricao` VARCHAR(255)                                                                         NOT NULL,
    `data_criacao`                          DATE                                                     NOT NULL,
    `data_realizado`                          DATE                                                   NOT NULL,
    PRIMARY KEY (`id`)
);

ALTER TABLE `ticket`
    ADD CONSTRAINT `ticket_retiro_id_foreign`
    FOREIGN KEY (`retiro_id`) REFERENCES `retiro` (`id`);

ALTER TABLE `ticket`
    ADD CONSTRAINT `ticket_aberto_por_foreign`
    FOREIGN KEY (`aberto_por`) REFERENCES `usuario` (`id`);

ALTER TABLE `ticket`
    ADD CONSTRAINT `ticket_atribuido_a_foreign`
    FOREIGN KEY (`atribuido_a`) REFERENCES `usuario` (`id`);

-----------------
Tabela: evidencia
-----------------

CREATE TABLE `evidencia` (
    `id`          CHAR(36)                          NOT NULL,
    `usuario_id`  CHAR(36)                          NOT NULL,
    `tipo`        ENUM('foto', 'audio', 'mensagem') NOT NULL,
    `data_criacao`   TIMESTAMP                         NOT NULL,
    PRIMARY KEY (`id`)
);

ALTER TABLE `evidencia`
    ADD CONSTRAINT `evidencia_usuario_id_foreign`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

------------------------------
Tabela: evidencia_foto
------------------------------
CREATE TABLE `evidencia_foto` (
    `evidencia_id` CHAR(36)     NOT NULL,
    `url_arquivo`  VARCHAR(255) NOT NULL,
    `latitude`     FLOAT(53)    NOT NULL,
    `longitude`    FLOAT(53)    NOT NULL,
    PRIMARY KEY (`evidencia_id`)
);

ALTER TABLE `evidencia_foto`
    ADD CONSTRAINT `evidencia_foto_evidencia_id_foreign`
    FOREIGN KEY (`evidencia_id`) REFERENCES `evidencia` (`id`);

ALTER TABLE `evidencia_foto`
    ADD CONSTRAINT `chk_latitude_valida`
    CHECK (`latitude` >= -90 AND `latitude` <= 90);

ALTER TABLE `evidencia_foto`
    ADD CONSTRAINT `chk_longitude_valida`
    CHECK (`longitude` >= -180 AND `longitude` <= 180);

------------------------------
Tabela: evidencia_audio
------------------------------

CREATE TABLE `evidencia_audio` (
    `evidencia_id` CHAR(36)     NOT NULL,
    `url_arquivo`  VARCHAR(255) NOT NULL,
    PRIMARY KEY (`evidencia_id`)
);

ALTER TABLE `evidencia_audio`
    ADD CONSTRAINT `evidencia_audio_evidencia_id_foreign`
    FOREIGN KEY (`evidencia_id`) REFERENCES `evidencia` (`id`);

------------------------------
Tabela: evidencia_mensagem
------------------------------

CREATE TABLE `evidencia_mensagem` (
    `evidencia_id` CHAR(36) NOT NULL,
    `conteudo`     TEXT     NOT NULL,
    PRIMARY KEY (`evidencia_id`)
);

ALTER TABLE `evidencia_mensagem`
    ADD CONSTRAINT `evidencia_mensagem_evidencia_id_foreign`
    FOREIGN KEY (`evidencia_id`) REFERENCES `evidencia` (`id`);

------------------------------
Tabela: evidencia_movimentacao
------------------------------

CREATE TABLE `evidencia_movimentacao` (
    `evidencia_id`    CHAR(36) NOT NULL,
    `movimentacao_id` CHAR(36) NOT NULL,
    PRIMARY KEY (`evidencia_id`, `movimentacao_id`)
);

ALTER TABLE `evidencia_movimentacao`
    ADD CONSTRAINT `evidencia_movimentacao_evidencia_id_foreign`
    FOREIGN KEY (`evidencia_id`) REFERENCES `evidencia` (`id`);

ALTER TABLE `evidencia_movimentacao`
    ADD CONSTRAINT `evidencia_movimentacao_movimentacao_id_foreign`
    FOREIGN KEY (`movimentacao_id`) REFERENCES `movimentacao` (`id`);

------------------------
Tabela: evidencia_tarefa
------------------------

CREATE TABLE `evidencia_tarefa` (
    `evidencia_id` CHAR(36) NOT NULL,
    `tarefa_id`    CHAR(36) NOT NULL,
    PRIMARY KEY (`evidencia_id`, `tarefa_id`)
);

ALTER TABLE `evidencia_tarefa`
    ADD CONSTRAINT `evidencia_tarefa_evidencia_id_foreign`
    FOREIGN KEY (`evidencia_id`) REFERENCES `evidencia` (`id`);

ALTER TABLE `evidencia_tarefa`
    ADD CONSTRAINT `evidencia_tarefa_tarefa_id_foreign`
    FOREIGN KEY (`tarefa_id`) REFERENCES `tarefa` (`id`);

-----------------------
Tabela: evidencia_ticket
------------------------

CREATE TABLE `evidencia_ticket` (
    `evidencia_id` CHAR(36) NOT NULL,
    `ticket_id`    CHAR(36) NOT NULL,
    PRIMARY KEY (`evidencia_id`, `ticket_id`)
);

ALTER TABLE `evidencia_ticket`
    ADD CONSTRAINT `evidencia_ticket_evidencia_id_foreign`
    FOREIGN KEY (`evidencia_id`) REFERENCES `evidencia` (`id`);

ALTER TABLE `evidencia_ticket`
    ADD CONSTRAINT `evidencia_ticket_ticket_id_foreign`
    FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`);

-----------------
Tabela: relatorio
-----------------

CREATE TABLE `relatorio` (
    `id`          CHAR(36)                                                  NOT NULL,
    `gerado_por`  CHAR(36)                                                  NULL,
    `retiro_id`   CHAR(36)                                                  NULL,
    `tipo`        ENUM('movimentacao', 'tarefas', 'tickets', 'consolidado') NULL,
    `data_inicio` DATE                                                      NULL,
    `data_fim`    DATE                                                      NULL,
    `data_gerado`   TIMESTAMP                                                 NULL,
    `url_arquivo`  VARCHAR(255)                                             NOT NULL,
    PRIMARY KEY (`id`)
);

ALTER TABLE `relatorio`
    ADD CONSTRAINT `relatorio_gerado_por_foreign`
    FOREIGN KEY (`gerado_por`) REFERENCES `usuario` (`id`);

ALTER TABLE `relatorio`
    ADD CONSTRAINT `relatorio_retiro_id_foreign`
    FOREIGN KEY (`retiro_id`) REFERENCES `retiro` (`id`);
