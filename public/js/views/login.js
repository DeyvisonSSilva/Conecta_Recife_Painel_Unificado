import { api } from '../api.js';
import { sessao } from '../sessao.js';
import { toast } from '../ui.js';

const LOGO = '<img src="/assets/logo-recife-prefeitura.png" alt="Prefeitura do Recife" width="190">';
const EMPREL = '<img src="/assets/logo-emprel.png" alt="Emprel" width="200" style="margin-top:26px">';

export async function login() {
  return {
    html: `<div class="ctr"><div><form class="lgc" id="f" novalidate>${LOGO}
      <button type="button" class="btn l w" data-aviso="Certificado Digital" style="margin-top:30px">Entrar com <b>Certificado Digital</b></button>
      <button type="button" class="btn l w" data-aviso="gov.br" style="margin-top:28px">Entrar com <b>gov.br</b></button>
      <p style="text-align:center;margin:20px 0 22px;line-height:1.9">Faça login em sua conta<br>Ou <span style="color:#2b8be8">Cadastre-se</span></p>
      <label for="doc" style="font-size:14px;font-weight:400;margin:0">CPF ou CNPJ</label><input id="doc" type="text" inputmode="numeric" autocomplete="username" style="margin-top:8px">
      <label style="display:flex;gap:8px;align-items:center;font-weight:400;font-size:13px;margin:8px 0 6px"><input type="checkbox" id="lembrar"> Mantenha-me conectado</label>
      <p class="erro" id="erro" role="alert" hidden></p>
      <button type="submit" class="btn l w" style="margin-top:8px">Entrar com Conecta Login</button>
      <button type="button" class="btn o w" id="limpar" style="margin-top:14px;color:#2b8be8;border-color:#5ea0ef;font-weight:400;font-size:13.5px;height:34px">&lt;&lt; Voltar para o sistema</button>${EMPREL}</form>
      <p style="margin:14px 0 0"><a class="lkb" href="#/servidor" style="color:var(--mu);font-weight:400">Acesso do servidor público</a></p></div></div>`,
    depois(root) {
      const erro = root.querySelector('#erro');
      root.querySelectorAll('[data-aviso]').forEach((b) => b.addEventListener('click', () => toast(`A integração com ${b.dataset.aviso} será disponibilizada na AV2. Use o Conecta Login.`)));
      root.querySelector('#limpar').addEventListener('click', () => { root.querySelector('#doc').value = ''; erro.hidden = true; root.querySelector('#doc').focus(); });
      root.querySelector('#f').addEventListener('submit', async (e) => {
        e.preventDefault(); erro.hidden = true;
        try {
          const dados = await api.post('/api/auth/cidadao', { documento: root.querySelector('#doc').value });
          sessao.salvar(dados, root.querySelector('#lembrar').checked); location.hash = '#/inicio';
        } catch (x) { erro.textContent = x.message; erro.hidden = false; }
      });
    }
  };
}

export async function loginServidor() {
  return {
    html: `<div class="ctr"><form class="lgc" id="f" novalidate>${LOGO}
      <h2 style="text-align:center;font-size:16px;margin:22px 0 14px">Acesso do servidor público</h2>
      <label for="mat" style="font-size:14px;font-weight:400;margin:0">Matrícula</label><input id="mat" type="text" autocomplete="username" style="margin:8px 0 14px">
      <label for="senha" style="font-size:14px;font-weight:400;margin:0">Senha</label><input id="senha" type="password" autocomplete="current-password" style="margin-top:8px;width:100%;height:38px;border:1px solid #5ea0ef;border-radius:6px;padding:0 10px;font:inherit">
      <p class="erro" id="erro" role="alert" hidden></p>
      <button type="submit" class="btn l w" style="margin-top:14px">Entrar</button>
      <a class="btn o w" href="#/login" style="margin-top:14px;color:#2b8be8;border-color:#5ea0ef;font-weight:400;font-size:13.5px;text-align:center">&lt;&lt; Voltar para o sistema</a>${EMPREL}</form></div>`,
    depois(root) {
      const erro = root.querySelector('#erro');
      root.querySelector('#f').addEventListener('submit', async (e) => {
        e.preventDefault(); erro.hidden = true;
        try {
          const dados = await api.post('/api/auth/servidor', { matricula: root.querySelector('#mat').value, senha: root.querySelector('#senha').value });
          sessao.salvar(dados, false); location.hash = '#/painel';
        } catch (x) { erro.textContent = x.message; erro.hidden = false; }
      });
    }
  };
}
