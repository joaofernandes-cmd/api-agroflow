const PREFIXOS_SEGUROS_PARA_CLIENTE = [
  'Apenas ',
  'Foto rejeitada:',
  'Mensagem rejeitada:',
  'Áudio rejeitado:',
  'Ticket rejeitado:',
  'Prioridade inválida',
  'Quantidade deve ser maior que zero',
]

function mensagemPodeSerExposta(mensagem: string): boolean {
  return PREFIXOS_SEGUROS_PARA_CLIENTE.some(prefixo => mensagem.startsWith(prefixo))
}

export function mensagemErroCliente(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) {
    return fallback
  }

  const mensagem = error.message.trim()

  if (!mensagem) {
    return fallback
  }

  return mensagemPodeSerExposta(mensagem) ? mensagem : fallback
}
