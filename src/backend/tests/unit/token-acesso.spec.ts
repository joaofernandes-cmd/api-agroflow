import crypto from 'crypto'
import {
  gerarTokenAcesso,
  hashTokenAcesso,
  montarLinkAcesso,
  montarQrCodeUrl,
} from '../../utils/token-acesso'

describe('token-acesso', () => {
  it('gerarTokenAcesso deve gerar token hex de 64 caracteres e único', () => {
    const token = gerarTokenAcesso()
    const outro = gerarTokenAcesso()

    expect(token).toMatch(/^[0-9a-f]{64}$/)
    expect(token).not.toBe(outro)
  })

  it('hashTokenAcesso deve gerar SHA-256 hex e ignorar espaços nas bordas', () => {
    const esperado = crypto.createHash('sha256').update('qr-capataz-daniel-aroeira').digest('hex')

    expect(hashTokenAcesso('qr-capataz-daniel-aroeira')).toBe(esperado)
    expect(hashTokenAcesso('  qr-capataz-daniel-aroeira  ')).toBe(esperado)
  })

  it('hashTokenAcesso deve casar com o hash semeado em acesso_capataz', () => {
    expect(hashTokenAcesso('qr-capataz-daniel-aroeira')).toBe(
      'a858669b3c392f03e4b62383ad1118142a18ad745a5c9b7de0edb8e2453f39c2'
    )
  })

  it('montarLinkAcesso deve montar a URL da rota de acesso', () => {
    expect(montarLinkAcesso('abc123', 'http://localhost:3000')).toBe(
      'http://localhost:3000/capataz/acesso/abc123'
    )
    expect(montarLinkAcesso('abc123', 'http://localhost:3000/')).toBe(
      'http://localhost:3000/capataz/acesso/abc123'
    )
  })

  it('montarQrCodeUrl deve codificar o link na URL do QR Code', () => {
    const link = 'http://localhost:3000/capataz/acesso/abc123'

    expect(montarQrCodeUrl(link)).toBe(
      `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(link)}`
    )
  })
})
