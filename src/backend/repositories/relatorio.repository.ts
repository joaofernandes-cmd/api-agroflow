import sql from '../database/connection'
import { Relatorio, RelatorioInput } from '../models/relatorio.model'

// Retorna todos os relatorios
export const RelatorioRepository = {

	// Ordena relatórios por data que foi gerado
	async buscarTodos(): Promise<Relatorio[]> {
		return sql<Relatorio[]>`
			SELECT id, gerado_por, retiro_id, tipo, data_inicio, data_fim, data_gerado, url_arquivo
			FROM relatorio
			ORDER BY data_gerado
		`
	},

	// Busca relatório pelo seu id e retorna nulo se não encontrar
	async buscarPorId(id: number): Promise<Relatorio | null> {
		const relatorios = await sql<Relatorio[]>`
			SELECT id, gerado_por, retiro_id, tipo, data_inicio, data_fim, data_gerado, url_arquivo
			FROM relatorio
			WHERE id = ${id}
			LIMIT 1
		`

		return relatorios[0] ?? null
	},

	// Cria um novo relatório no banco de dados
	async criar(input: RelatorioInput): Promise<Relatorio> {
		const [created] = await sql<Relatorio[]>`
			INSERT INTO relatorio (gerado_por, retiro_id, tipo, data_inicio, data_fim, data_gerado, url_arquivo)
			VALUES (
				${input.gerado_por},
				${input.retiro_id},
				${input.tipo},
				${input.data_inicio},
				${input.data_fim},
				${input.data_gerado ?? new Date()},
				${input.url_arquivo}
			)
			RETURNING id, gerado_por, retiro_id, tipo, data_inicio, data_fim, data_gerado, url_arquivo
		`

		return created
	},

	// Atualiza um relatório existente no banco de dados
	async atualizar(id: number, input: Partial<RelatorioInput>): Promise<Relatorio | null> {
		const [updated] = await sql<Relatorio[]>`
			UPDATE relatorio
			SET
				gerado_por = COALESCE(${input.gerado_por ?? null}, gerado_por),
				retiro_id = COALESCE(${input.retiro_id ?? null}, retiro_id),
				tipo = COALESCE(${input.tipo ?? null}, tipo),
				data_inicio = COALESCE(${input.data_inicio ?? null}, data_inicio),
				data_fim = COALESCE(${input.data_fim ?? null}, data_fim),
				data_gerado = COALESCE(${input.data_gerado ?? null}, data_gerado),
				url_arquivo = COALESCE(${input.url_arquivo ?? null}, url_arquivo)
			WHERE id = ${id}
			RETURNING id, gerado_por, retiro_id, tipo, data_inicio, data_fim, data_gerado, url_arquivo
		`

		return updated ?? null
	}
}
