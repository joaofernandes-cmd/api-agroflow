import fs from 'fs'
import path from 'path'

const MIGRATIONS_DIR = path.resolve(__dirname, '../../database/migrations')

function lerMigration(nome: string): string {
  return fs.readFileSync(path.join(MIGRATIONS_DIR, nome), 'utf8')
}

function valoresEnum(sql: string, nome: string): string[] {
  const match = sql.match(new RegExp(`CREATE TYPE ${nome} AS ENUM \\(([\\s\\S]*?)\\);`, 'i'))
  if (!match) return []

  return Array.from(match[1].matchAll(/'([^']+)'/g)).map(valor => valor[1])
}

describe('Migrations - alinhamento estatico do schema', () => {
  it('mantem numeracao sequencial das migrations', () => {
    const arquivos = fs.readdirSync(MIGRATIONS_DIR)
      .filter(nome => nome.endsWith('.sql'))
      .sort()

    expect(arquivos).toHaveLength(23)
    arquivos.forEach((nome, indice) => {
      expect(nome).toMatch(new RegExp(`^${String(indice + 1).padStart(3, '0')}-`))
    })
  })

  it('mantem enums operacionais alinhados ao frontend e backend', () => {
    const sql = lerMigration('001-create-retiro.sql')

    expect(valoresEnum(sql, 'ticket_categoria')).toEqual([
      'cerca',
      'eletrica',
      'hidraulica',
    ])

    expect(valoresEnum(sql, 'movimentacao_estagio_vida')).toEqual([
      'BEZERRO 0 A 7 MESES',
      'BEZERRA 0 A 7 MESES',
      'GARROTE 8 A 12 MESES',
      'GARROTE 13 A 24 MESES',
      'NOVILHA 8 A 12 MESES',
      'NOVILHA 13 A 24 MESES',
      'BOI 25 A 36 MESES',
      'BOI ACIMA 36 MESES',
      'TOURO 25 A 36 MESES',
      'TOURO ACIMA 36 MESES',
      'VACA 25 A 36 MESES',
      'VACA ACIMA 36 MESES',
    ])
  })

  it('cria tabelas principais com UUID desde a base', () => {
    const arquivos = [
      '001-create-retiro.sql',
      '002-create-usuario.sql',
      '003-create-tarefa.sql',
      '004-create-movimentacao.sql',
      '005-create-ticket.sql',
    ]

    arquivos.forEach(nome => {
      expect(lerMigration(nome)).toMatch(/id UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/)
    })
  })

  it('mantem usuario compativel com login tradicional e acesso de capataz por identificador', () => {
    const sql = lerMigration('002-create-usuario.sql')

    expect(sql).toContain('identificador VARCHAR(255) NOT NULL')
    expect(sql).toContain('login VARCHAR(255) UNIQUE')
    expect(sql).not.toContain('login VARCHAR(255) NOT NULL')
    expect(sql).toContain('senha_hash VARCHAR(255)')
    expect(sql).not.toContain('senha_hash VARCHAR(255) NOT NULL')
    expect(sql).toContain('usuario_identificador_unique')
  })
})
