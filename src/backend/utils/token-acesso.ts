import crypto from 'crypto'

// Tamanho em bytes do token bruto. 32 bytes -> 64 caracteres hex,
// mesmo comprimento aceito pela coluna token_hash (VARCHAR(64)).
const TOKEN_BYTES = 32

// Gera um token de acesso criptograficamente seguro (hex).
// O token bruto é o que vai dentro do QR Code / link; nunca é persistido.
export function gerarTokenAcesso(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex')
}

// Converte o token bruto no hash SHA-256 (hex) armazenado em acesso_capataz.token_hash.
// Mesma transformação usada na autenticação por token do capataz.
export function hashTokenAcesso(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex')
}

// URL base usada para montar o link do QR Code.
// Reaproveita APP_URL quando definida; caso contrário cai no host local + PORT.
function obterUrlBase(): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '')
  }

  return `http://localhost:${process.env.PORT || 3000}`
}

// Monta o link de acesso no formato esperado pela rota /capataz/acesso/:token.
export function montarLinkAcesso(token: string, urlBase: string = obterUrlBase()): string {
  return `${urlBase.replace(/\/+$/, '')}/capataz/acesso/${token}`
}

// Monta a URL de uma imagem de QR Code para o link informado.
// Abordagem desacoplada e sem dependências: usa um serviço público que devolve
// a imagem do QR. Observação: o link (com o token) trafega para o serviço externo.
export function montarQrCodeUrl(link: string, tamanho = 240): string {
  const dados = encodeURIComponent(link)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${tamanho}x${tamanho}&data=${dados}`
}
