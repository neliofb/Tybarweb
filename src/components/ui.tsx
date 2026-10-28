import { ReactNode, useEffect, useRef, useState, useCallback } from 'react'
import { msgErro } from '../api/site'

/** Converte um id do jogo em nome de arquivo: MagoDeCombate → mago_de_combate */
export function slug(id: string): string {
  return id
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase()
}

/**
 * Imagem com marcador elegante: tenta cada caminho em ordem (ex.: povos/x.jpg, povos/x.png)
 * e, se nenhum existir, mostra um brasão com a inicial. As artes finais entram em public/media/ com os nomes fixos.
 */
export function Midia({ fontes, alt, rotulo, className, style }: {
  fontes: string[]; alt: string; rotulo?: string; className?: string; style?: React.CSSProperties
}) {
  const [i, setI] = useState(0)
  const chave = fontes.join('|')
  useEffect(() => setI(0), [chave])
  const src = fontes[i]
  return (
    <div className={'midia ' + (className ?? '')} style={style}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setI(n => n + 1)} />
      ) : (
        <div className="midia-marcador" role="img" aria-label={alt}>
          <span className="runa" aria-hidden="true">{(rotulo ?? alt).trim().charAt(0).toUpperCase()}</span>
          <span className="leg" aria-hidden="true">{rotulo ?? alt}</span>
        </div>
      )}
    </div>
  )
}

/** Candidatos de arquivo para um item de public/media/<pasta>/ */
export function fontesDe(pasta: string, id: string, extras: string[] = []): string[] {
  const nomes = Array.from(new Set([slug(id), id.toLowerCase(), ...extras]))
  const out: string[] = []
  for (const n of nomes) for (const ext of ['jpg', 'png', 'webp']) out.push(`/media/${pasta}/${n}.${ext}`)
  return out
}

// Nomes alternativos de arquivo já usados pela arte (plural, sem acento)
export const ALIAS_POVO: Record<string, string[]> = {
  thuriano: ['thuriao', 'thurioes'], zharkiano: ['zharkianos'], asanita: ['asanitas'],
  aquilrano: ['aquilranos'], vanirio: ['vanirios'], numajene: ['numajenes'],
}
export const fontesPovo = (id: string) => fontesDe('povos', id, ALIAS_POVO[slug(id)] ?? [])

/** Vídeo curto do povo (public/media/povos/<Nome>.mp4) */
export function videoPovo(id: string) {
  const s = slug(id)
  const nome = s === 'thuriano' ? 'Thuriao' : s.charAt(0).toUpperCase() + s.slice(1)
  return `/media/povos/${nome}.mp4`
}

export function Sigilo({ tamanho = 30 }: { tamanho?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={tamanho} height={tamanho} aria-hidden="true">
      <defs>
        <linearGradient id="og" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0d38a" /><stop offset="1" stopColor="#8a6a2a" />
        </linearGradient>
      </defs>
      <path d="M16 1l4 6-4 23-4-23z" fill="url(#og)" />
      <path d="M6 9h20l-2 3H8z" fill="url(#og)" />
      <circle cx="16" cy="5" r="1.6" fill="#1a1206" />
      <path d="M16 12l9 3-9 15-9-15z" fill="none" stroke="#c8a24b" strokeWidth="1.2" />
    </svg>
  )
}

export function Ornamento() {
  return (
    <div className="ornamento" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="currentColor" /></svg>
    </div>
  )
}

export function Carregando({ texto = 'Consultando os arquivos…' }: { texto?: string }) {
  return <div className="carregando" role="status">{texto}</div>
}

export function Erro({ erro, tentar }: { erro: string; tentar?: () => void }) {
  return (
    <div className="aviso aviso-erro" role="alert">
      {erro} {tentar && <button className="btn-link" onClick={tentar}>Tentar de novo</button>}
    </div>
  )
}

export function Selo({ tipo }: { tipo: 'oficial' | 'comunidade' }) {
  return tipo === 'oficial'
    ? <span className="selo selo-oficial" title="Build criada ou aprovada pela staff">✦ Build oficial</span>
    : <span className="selo selo-comunidade" title="Build criada por um jogador">Build da comunidade</span>
}

export function CabecalhoPagina({ sobre, titulo, children }: { sobre?: string; titulo: string; children?: ReactNode }) {
  return (
    <header className="pagina-cab">
      {sobre && <div className="sobretitulo">{sobre}</div>}
      <h1>{titulo}</h1>
      {children && <p>{children}</p>}
    </header>
  )
}

export function Busca({ valor, mudar, rotulo, placeholder }: { valor: string; mudar: (v: string) => void; rotulo: string; placeholder?: string }) {
  return (
    <label className="busca" style={{ display: 'block', flex: 1, minWidth: 200 }}>
      <span className="sr-only">{rotulo}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
      <input className="entrada" type="search" value={valor} placeholder={placeholder ?? rotulo} onChange={e => mudar(e.target.value)} />
    </label>
  )
}

export function Modal({ titulo, aberto, fechar, children, acoes }: {
  titulo: string; aberto: boolean; fechar: () => void; children: ReactNode; acoes?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!aberto) return
    const antes = document.activeElement as HTMLElement | null
    const el = ref.current
    el?.querySelector<HTMLElement>('input, textarea, select, button')?.focus()
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar() }
    document.addEventListener('keydown', tecla)
    return () => { document.removeEventListener('keydown', tecla); antes?.focus() }
  }, [aberto, fechar])
  if (!aberto) return null
  return (
    <div className="modal-fundo" onMouseDown={e => { if (e.target === e.currentTarget) fechar() }}>
      <div className="painel modal" role="dialog" aria-modal="true" aria-label={titulo} ref={ref}>
        <h3>{titulo}</h3>
        {children}
        {acoes && <div className="acoes">{acoes}</div>}
      </div>
    </div>
  )
}

/** Carrega dados de uma função da API, com estado de carregando/erro e recarregar. */
export function useDados<T>(fn: () => Promise<{ data: T }>, deps: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const carregar = useCallback(() => {
    setCarregando(true); setErro('')
    fn().then(r => setDados(r.data)).catch(e => setErro(msgErro(e))).finally(() => setCarregando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(() => { carregar() }, [carregar])
  return { dados, erro, carregando, carregar, setDados }
}

export function useTitulo(t: string) {
  useEffect(() => { document.title = t ? t + ' · Tybar' : 'Tybar' }, [t])
}

export function dataBR(s?: string) {
  if (!s) return '—'
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
