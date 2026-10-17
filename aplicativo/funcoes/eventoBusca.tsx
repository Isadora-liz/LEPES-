import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  Linking,
  Share,
} from 'react-native';

import { db } from '../FirebaseConfig';

export interface EventoData {
  nome: string;
  endereco: string;
  imagem?: string;
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
}


import * as Location from "expo-location";

export interface LocalData {
  endereco: string;
  nome: string;
}

export async function buscarEventoPorId(
  id: string
): Promise<EventoData | null> {
  try {
    const docRef = doc(
      db,
      'eventos',
      id
    );

    const docSnap =
      await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as EventoData;
  } catch (error) {
    console.error(
      'Erro ao buscar eventos:',
      error
    );

    throw error;
  }
}

export async function compartilharEvento(
  evento: EventoData
) {
  try {
    await Share.share({
      message:
        `Confira esse evento no LEPES: ${evento.nome}`,
    });
  } catch (error) {
    console.error(
      'Erro ao compartilhar evento:',
      error
    );

    throw error;
  }
}

export async function abrirRotasLocal(
  local: LocalData
) {
  try {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      throw new Error(
        "Permissão de localização não concedida."
      );
    }

    const localizacao =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    const latitudeAtual =
      localizacao.coords.latitude;

    const longitudeAtual =
      localizacao.coords.longitude;

    const destino =
      `${local.nome}, ${local.endereco}`;

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${latitudeAtual},${longitudeAtual}` +
      `&destination=${encodeURIComponent(destino)}`;

    await Linking.openURL(url);

  } catch (error) {
    console.error(
      "Erro ao abrir rota:",
      error
    );

    throw error;
  }
}