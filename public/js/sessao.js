const CHAVE = 'conecta:sessao';
/** Guarda token e usuário (localStorage se "Mantenha-me conectado", senão sessionStorage). */
export const sessao = {
  ler() { try { return JSON.parse(sessionStorage.getItem(CHAVE) || localStorage.getItem(CHAVE)); } catch { return null; } },
  get token() { const s = this.ler(); return s && s.token; },
  get usuario() { const s = this.ler(); return s && s.usuario; },
  salvar(dados, persistente) { this.limpar(); (persistente ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(dados)); },
  limpar() { localStorage.removeItem(CHAVE); sessionStorage.removeItem(CHAVE); }
};
