import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  Linking,
  Share,
} from 'react-native';

import { db } from '../FirebaseConfig';

export interface LocalData {
  nome: string;
  endereco: string;
  horarioFuncionamento?: string;
  imagem?: string;
  descricao?: string;
}

export async function buscarLocalPorId(
  id: string
): Promise<LocalData | null> {
  try {
    const docRef = doc(
      db,
      'espaco',
      id
    );

    const docSnap =
      await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as LocalData;
  } catch (error) {
    console.error(
      'Erro ao buscar local:',
      error
    );

    throw error;
  }
}

export async function compartilharLocal(
  local: LocalData
) {
  try {
    await Share.share({
      message:
        `Confira esse local esportivo no LEPES: ${local.nome}`,
    });
  } catch (error) {
    console.error(
      'Erro ao compartilhar local:',
      error
    );

    throw error;
  }
}

export async function abrirRotasLocal(
  local: LocalData
) {
  try {
    const destino =
      `${local.nome}, ${local.endereco}`;

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        destino
      )}`;

    await Linking.openURL(url);
  } catch (error) {
    console.error(
      'Erro ao abrir rota:',
      error
    );

    throw error;
  }
}