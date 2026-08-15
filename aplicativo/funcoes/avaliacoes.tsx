import {
  doc,
  getDoc,
  runTransaction,
} from 'firebase/firestore';

import { db } from '../FirebaseConfig';

export interface Avaliacao {
  usuarioId: string;
  nota: number;
  horariosFrequencia: string[];
}

export const HORARIOS_FREQUENCIA = [
  '07h - 10h',
  '10h - 13h',
  '13h - 16h',
  '16h - 19h',
  '19h - 22h',
];

export async function buscarAvaliacoesDoLocal(
  espacoId: string
): Promise<Avaliacao[]> {

  try {

    const localRef = doc(
      db,
      'espaco',
      espacoId
    );

    const localSnap =
      await getDoc(localRef);

    if (!localSnap.exists()) {
      return [];
    }

    const dados =
      localSnap.data();

    const avaliacoes =
      Array.isArray(dados.avaliacoes)
        ? dados.avaliacoes
        : [];

    return avaliacoes;

  } catch (error) {

    console.error(
      'Erro ao buscar avaliações:',
      error
    );

    throw error;
  }
}

export async function buscarMinhaAvaliacao(
  espacoId: string,
  usuarioId: string
): Promise<Avaliacao | null> {

  try {

    const avaliacoes =
      await buscarAvaliacoesDoLocal(
        espacoId
      );

    const minhaAvaliacao =
      avaliacoes.find(
        (avaliacao) =>
          avaliacao.usuarioId ===
          usuarioId
      );

    return minhaAvaliacao || null;

  } catch (error) {

    console.error(
      'Erro ao buscar avaliação do usuário:',
      error
    );

    throw error;
  }
}

export async function salvarAvaliacaoDoUsuario(
  espacoId: string,
  usuarioId: string,
  nota: number,
  horariosFrequencia: string[]
) {

  try {

    const localRef = doc(
      db,
      'espaco',
      espacoId
    );

    await runTransaction(
      db,
      async (transaction: { get: (arg0: any) => any; update: (arg0: any, arg1: { avaliacoes: Avaliacao[]; }) => void; }) => {

        const localSnap =
          await transaction.get(
            localRef
          );

        if (!localSnap.exists()) {
          throw new Error(
            'Local não encontrado'
          );
        }

        const dados =
          localSnap.data();

        const avaliacoesAtuais:
          Avaliacao[] =
          Array.isArray(
            dados.avaliacoes
          )
            ? [...dados.avaliacoes]
            : [];

        const indice =
          avaliacoesAtuais.findIndex(
            (avaliacao) =>
              avaliacao.usuarioId ===
              usuarioId
          );

        const novaAvaliacao:
          Avaliacao = {

          usuarioId,

          nota,

          horariosFrequencia,

        };

        if (indice !== -1) {

          avaliacoesAtuais[indice] =
            novaAvaliacao;

        }

        else {

          avaliacoesAtuais.push(
            novaAvaliacao
          );

        }

        transaction.update(
          localRef,
          {
            avaliacoes:
              avaliacoesAtuais,
          }
        );
      }
    );

  } catch (error) {

    console.error(
      'Erro ao salvar avaliação:',
      error
    );

    throw error;
  }
}

export function totalAvaliacoes(
  avaliacoes: Avaliacao[]
) {

  return avaliacoes.length;

}

export function calcularMedia(
  avaliacoes: Avaliacao[]
) {

  if (
    avaliacoes.length === 0
  ) {
    return 0;
  }

  const soma =
    avaliacoes.reduce(
      (total, avaliacao) =>
        total +
        Number(avaliacao.nota),
      0
    );

  return (
    soma /
    avaliacoes.length
  );
}

export function contarNota(
  avaliacoes: Avaliacao[],
  nota: number
) {

  return avaliacoes.filter(
    (avaliacao) =>
      Number(avaliacao.nota) ===
      nota
  ).length;

}

export function calcularPercentual(
  avaliacoes: Avaliacao[],
  nota: number
) {

  if (
    avaliacoes.length === 0
  ) {
    return 0;
  }

  const quantidade =
    contarNota(
      avaliacoes,
      nota
    );

  return (
    quantidade /
    avaliacoes.length
  ) * 100;
}

export interface EstatisticaHorario {
  horario: string;
  quantidade: number;
  percentual: number;
}

export function calcularFrequenciaHorarios(
  avaliacoes: Avaliacao[]
): EstatisticaHorario[] {

  const totalDeAvaliacoes =
    avaliacoes.length;

  return HORARIOS_FREQUENCIA.map(
    (horario) => {

      const quantidade =
        avaliacoes.filter(
          (avaliacao) =>
            avaliacao.horariosFrequencia?.includes(
              horario
            )
        ).length;

      const percentual =
        totalDeAvaliacoes > 0
          ? (
              quantidade /
              totalDeAvaliacoes
            ) * 100
          : 0;

      return {
        horario,
        quantidade,
        percentual,
      };
    }
  );
}

export function obterHorariosDePico(
  avaliacoes: Avaliacao[]
): EstatisticaHorario[] {

  if (avaliacoes.length === 0) {
    return [];
  }

  const estatisticas =
    calcularFrequenciaHorarios(
      avaliacoes
    );

  const maiorQuantidade =
    Math.max(
      ...estatisticas.map(
        (item) =>
          item.quantidade
      )
    );

  if (maiorQuantidade === 0) {
    return [];
  }

  return estatisticas.filter(
    (item) =>
      item.quantidade ===
      maiorQuantidade
  );
}