import 'dotenv/config'
import {
  gerarTokenAcesso,
  hashTokenAcesso,
  montarLinkAcesso,
  montarQrCodeUrl,
} from '../utils/token-acesso'

// Script utilitário e desacoplado para gerar um novo acesso por QR Code.
// Não escreve no banco: apenas gera o token, o hash, o link e a URL do QR Code,
// além do INSERT pronto para ser aplicado manualmente em acesso_capataz
// (usando exclusivamente colunas já existentes).
//
// Uso: npm run gerar:acesso -- <usuario_id>
function main() {
  const usuarioId = process.argv[2]

  const token = gerarTokenAcesso()
  const tokenHash = hashTokenAcesso(token)
  const link = montarLinkAcesso(token)
  const qrCodeUrl = montarQrCodeUrl(link)

  console.log('Token (vai dentro do QR Code, não é salvo):')
  console.log(`  ${token}\n`)
  console.log('Hash SHA-256 (salvar em acesso_capataz.token_hash):')
  console.log(`  ${tokenHash}\n`)
  console.log('Link de acesso:')
  console.log(`  ${link}\n`)
  console.log('URL da imagem do QR Code:')
  console.log(`  ${qrCodeUrl}\n`)

  console.log('INSERT pronto para aplicar manualmente:')
  if (usuarioId) {
    console.log(
      `  INSERT INTO acesso_capataz (usuario_id, token_hash, ativo)\n` +
        `  VALUES ('${usuarioId}', '${tokenHash}', true);`
    )
  } else {
    console.log('  (informe o usuario_id: npm run gerar:acesso -- <usuario_id>)')
  }
}

main()
