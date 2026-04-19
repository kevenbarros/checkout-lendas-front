import React, { useEffect, useMemo, useRef, useState } from 'react';
import ParticipantSelector from './ParticipantSelector';
import CouponInput from './CouponInput';
import PriceSummary from './PriceSummary';
import TermsModal from './TermsModal';
import { calcular, criarPagamento } from '../services/api';
import { maskCpf, formatDataBR, diaDaSemana } from '../utils/format';

const INITIAL = {
  quantidade: 2,
  cupons: [],
  nome: '',
  email: '',
  cpf: '',
  dataNascimento: '',
  aceiteTermos: false,
  aceitePrivacidade: false,
};

function calcularIdade(dataISO) {
  if (!dataISO) return null;
  const [y, m, d] = dataISO.split('-').map(Number);
  if (!y || !m || !d) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - y;
  const jaFez =
    hoje.getMonth() + 1 > m ||
    (hoje.getMonth() + 1 === m && hoje.getDate() >= d);
  if (!jaFez) idade -= 1;
  return idade;
}

export default function BookingForm({ slot }) {
  const [form, setForm] = useState(INITIAL);
  const [calculo, setCalculo] = useState(null);
  const [carregandoCalculo, setCarregandoCalculo] = useState(false);
  const [erroCupom, setErroCupom] = useState('');
  const [erroGeral, setErroGeral] = useState('');
  const [processando, setProcessando] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);

  const debounceRef = useRef(null);

  const cuponsKey = form.cupons.join(',');

  const pedidoCalculo = useMemo(
    () => ({
      quantidade: form.quantidade,
      cupons: form.cupons,
      slotId: slot?.id,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.quantidade, cuponsKey, slot?.id]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setCarregandoCalculo(true);
      setErroCupom('');
      try {
        const data = await calcular(pedidoCalculo);
        setCalculo(data);
      } catch (err) {
        if (pedidoCalculo.cupons && pedidoCalculo.cupons.length) {
          setErroCupom(err.message);
          try {
            const semCupom = await calcular({
              quantidade: pedidoCalculo.quantidade,
              cupons: [],
              slotId: pedidoCalculo.slotId,
            });
            setCalculo(semCupom);
          } catch (e) {
            setErroGeral(e.message);
          }
        } else {
          setErroGeral(err.message);
        }
      } finally {
        setCarregandoCalculo(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pedidoCalculo]);

  useEffect(() => {
    if (form.cupons.length > form.quantidade) {
      setForm((prev) => ({
        ...prev,
        cupons: prev.cupons.slice(0, prev.quantidade),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.quantidade]);

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErroGeral('');

    if (!slot) {
      setErroGeral('Horário não carregado.');
      return;
    }
    if (!form.nome || form.nome.trim().length < 3) {
      setErroGeral('Informe seu nome completo.');
      return;
    }
    if (!form.email) {
      setErroGeral('Informe seu e-mail.');
      return;
    }
    if (form.cpf.replace(/\D/g, '').length !== 11) {
      setErroGeral('Informe um CPF válido.');
      return;
    }
    if (!form.dataNascimento) {
      setErroGeral('Informe sua data de nascimento.');
      return;
    }
    const idade = calcularIdade(form.dataNascimento);
    if (idade === null) {
      setErroGeral('Data de nascimento inválida.');
      return;
    }
    if (idade < 18) {
      setErroGeral('Você precisa ter 18 anos ou mais para fazer a reserva.');
      return;
    }
    if (!form.aceiteTermos || !form.aceitePrivacidade) {
      setErroGeral(
        'Você precisa aceitar os Termos de Uso e a Política de Privacidade.'
      );
      return;
    }

    setProcessando(true);
    try {
      const payload = {
        slot_id: slot.id,
        nome: form.nome.trim(),
        email: form.email.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        data_nascimento: form.dataNascimento,
        quantidade: form.quantidade,
        cupons: form.cupons,
        aceite_termos: form.aceiteTermos,
        aceite_privacidade: form.aceitePrivacidade,
      };

      const resp = await criarPagamento(payload);
      const url = resp.init_point || resp.sandbox_init_point;
      if (!url) throw new Error('Não foi possível obter o link de pagamento.');
      window.location.href = url;
    } catch (err) {
      setErroGeral(err.message);
    } finally {
      setProcessando(false);
    }
  }

  const hoje = new Date();
  const maxNascimento = `${hoje.getFullYear() - 18}-${String(
    hoje.getMonth() + 1
  ).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  const maxCupons = calculo?.max_cupons ?? form.quantidade;

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1 className="title">Finalize sua reserva</h1>
      <p className="subtitle">
        Horário separado para você. Escolha os participantes e pague para
        confirmar.
      </p>

      {slot && (
        <div className="slot-box">
          <div>
            <span className="muted">Data</span>
            <strong>
              {formatDataBR(slot.data)}{' '}
              <small className="muted">({diaDaSemana(slot.data)})</small>
            </strong>
          </div>
          <div>
            <span className="muted">Horário</span>
            <strong>{slot.hora}</strong>
          </div>
        </div>
      )}

      <ParticipantSelector
        value={form.quantidade}
        onChange={(v) => atualizar('quantidade', v)}
        precoPorPessoa={calculo?.preco_por_pessoa}
        precoPorPessoaBase={calculo?.preco_por_pessoa_base}
        bulkAplicado={calculo?.bulk_aplicado}
        bulkMinQtd={calculo?.bulk_min_qtd}
        bulkValorPorPessoa={calculo?.bulk_valor_por_pessoa}
      />

      <div className="field">
        <label className="label" htmlFor="nome">Nome completo</label>
        <input
          id="nome"
          type="text"
          className="input"
          value={form.nome}
          onChange={(e) => atualizar('nome', e.target.value)}
          placeholder="Seu nome"
          required
        />
      </div>

      <div className="grid-2">
        <div className="field">
          <label className="label" htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => atualizar('email', e.target.value)}
            placeholder="voce@exemplo.com"
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            type="text"
            className="input"
            value={maskCpf(form.cpf)}
            onChange={(e) => atualizar('cpf', e.target.value.replace(/\D/g, ''))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="dataNascimento">Data de nascimento</label>
        <input
          id="dataNascimento"
          type="date"
          className="input"
          value={form.dataNascimento}
          max={maxNascimento}
          onChange={(e) => atualizar('dataNascimento', e.target.value)}
          required
        />
        <small className="hint">Apenas maiores de 18 anos.</small>
      </div>

      <CouponInput
        cupons={form.cupons}
        onChange={(v) => atualizar('cupons', v)}
        cuponsAplicados={calculo?.cupons}
        erroCupom={erroCupom}
        maxCupons={maxCupons}
      />

      <PriceSummary calculo={calculo} carregando={carregandoCalculo} />

      <div className="terms-box">
        <label className="terms-checkbox">
          <input
            type="checkbox"
            checked={form.aceiteTermos}
            onChange={(e) => atualizar('aceiteTermos', e.target.checked)}
          />
          <span>
            Li e aceito os{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => setModalTipo('termos')}
            >
              Termos de Uso
            </button>
            .
          </span>
        </label>

        <label className="terms-checkbox">
          <input
            type="checkbox"
            checked={form.aceitePrivacidade}
            onChange={(e) => atualizar('aceitePrivacidade', e.target.checked)}
          />
          <span>
            Li e aceito a{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => setModalTipo('privacidade')}
            >
              Política de Privacidade
            </button>
            .
          </span>
        </label>
      </div>

      {erroGeral && <div className="alert error">{erroGeral}</div>}

      <button
        type="submit"
        className="pay-btn"
        disabled={
          processando ||
          !calculo ||
          calculo.total <= 0 ||
          !slot ||
          !form.aceiteTermos ||
          !form.aceitePrivacidade
        }
      >
        {processando ? 'Processando...' : 'Pagar com Mercado Pago'}
      </button>

      <p className="footer-hint">
        Você será redirecionado para o ambiente seguro do Mercado Pago. Sua
        reserva é confirmada automaticamente após a aprovação do pagamento e um
        e-mail de confirmação será enviado.
      </p>

      {modalTipo && (
        <TermsModal tipo={modalTipo} onClose={() => setModalTipo(null)} />
      )}
    </form>
  );
}
