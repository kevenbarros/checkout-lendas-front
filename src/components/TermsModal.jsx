import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const TERMOS_USO = `
TERMOS DE USO — LENDAS ESCAPE ROOM

1. OBJETO
Este documento regula a contratação de experiências de Escape Room oferecidas pela Lendas Escape Room. A reserva de um horário por meio deste checkout implica na aceitação integral destes termos.

2. IDADE MÍNIMA
A reserva e a participação são permitidas apenas a maiores de 18 (dezoito) anos. Menores de 18 anos só podem participar acompanhados por um responsável legal, também presente na experiência.

3. PONTUALIDADE E TOLERÂNCIA
O cliente deve chegar com antecedência mínima de 10 (dez) minutos do horário reservado. Atrasos superiores a 15 (quinze) minutos poderão resultar em redução do tempo de jogo ou cancelamento da sessão, sem direito a reembolso.

4. REGRAS DE SEGURANÇA
Durante a experiência, é proibido o uso de força física contra cenários, objetos cênicos ou trancas. O descumprimento poderá acarretar o encerramento imediato da partida sem reembolso e, em caso de danos, responsabilização do participante.

5. PAGAMENTO
O pagamento é processado por meio do Mercado Pago. A reserva só é considerada confirmada após a aprovação do pagamento, o que é comunicado por e-mail.

6. CANCELAMENTO E REEMBOLSO
Cancelamentos solicitados com mais de 24 (vinte e quatro) horas de antecedência dão direito a reagendamento. Cancelamentos com menos de 24 horas ou no-show não geram direito a reembolso ou reagendamento.

7. CUPONS DE DESCONTO
Cupons são pessoais, intransferíveis e sujeitos às regras e prazos de validade definidos no momento de sua emissão. Cupons marcados como de uso único deixam de ser válidos após a primeira utilização.

8. RESPONSABILIDADE
A Lendas Escape Room não se responsabiliza por pertences esquecidos no local nem por eventuais mal-estares causados por condições de saúde preexistentes não informadas previamente.

9. ALTERAÇÕES
Estes termos podem ser atualizados a qualquer momento. A versão aplicável é a vigente no momento da reserva.

Versão 1.0.0
`.trim();

const POLITICA_PRIVACIDADE = `
POLÍTICA DE PRIVACIDADE — LENDAS ESCAPE ROOM

1. DADOS COLETADOS
Ao realizar uma reserva, coletamos: nome completo, CPF, data de nascimento, e-mail e informações de pagamento processadas pelo Mercado Pago. Podemos registrar também o endereço IP utilizado no ato do aceite destes termos.

2. FINALIDADE
Os dados são utilizados para: (i) identificação do cliente e emissão de comprovantes, (ii) verificação de idade mínima, (iii) processamento do pagamento, (iv) envio de confirmação de reserva por e-mail e (v) cumprimento de obrigações legais e fiscais.

3. COMPARTILHAMENTO
Compartilhamos dados apenas com prestadores estritamente necessários à operação: Mercado Pago (pagamento), Google Calendar (registro interno de agenda) e provedor de e-mail transacional (envio da confirmação). Nenhum dado é vendido ou cedido para fins de marketing externo.

4. ARMAZENAMENTO
Os dados são armazenados em banco de dados protegido (Firebase Firestore) pelo prazo necessário ao cumprimento das finalidades acima e das obrigações legais aplicáveis.

5. DIREITOS DO TITULAR
Nos termos da LGPD (Lei 13.709/2018), o cliente pode solicitar, a qualquer momento, confirmação de tratamento, acesso, correção, anonimização ou exclusão de seus dados pessoais, por meio do e-mail de contato da Lendas Escape Room.

6. SEGURANÇA
Adotamos medidas técnicas razoáveis para proteger os dados, incluindo comunicação criptografada (HTTPS) e controle de acesso administrativo com autenticação.

7. COOKIES
Este site pode utilizar cookies estritamente necessários ao funcionamento do checkout. Não utilizamos cookies de publicidade ou rastreamento de terceiros.

8. ALTERAÇÕES
Esta política pode ser atualizada. A versão vigente no momento da reserva é a aplicável ao tratamento realizado.

Versão 1.0.0
`.trim();

const CONTEUDOS = {
  termos: { titulo: 'Termos de Uso', texto: TERMOS_USO },
  privacidade: { titulo: 'Política de Privacidade', texto: POLITICA_PRIVACIDADE },
};

export default function TermsModal({ tipo, onClose }) {
  useEffect(() => {
    function esc(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!tipo) return null;
  const conteudo = CONTEUDOS[tipo];
  if (!conteudo) return null;

  return createPortal(
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={conteudo.titulo}
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="title-sm">{conteudo.titulo}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <pre className="modal-body">{conteudo.texto}</pre>
        <div className="modal-footer">
          <button type="button" className="pay-btn" onClick={onClose}>
            Entendi
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
