import Ionicons from '@expo/vector-icons/build/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
   useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '../../FirebaseConfig';
import Abas from '../../componentes/AbasDetalhesEventos';

interface EventoData {
  imagem?: string | string[];
  nome: string;
  descricao: string;
}

export default function Detalhes() {
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams();

  const [evento, setEvento] = useState<EventoData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function buscarEvento() {
      if (typeof id !== 'string') {
        setCarregando(false);
        setErro(true);
        return;
      }

      try {
        console.log('Buscando evento com ID:', id);
        const docRef = doc(db, 'eventos', id);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data() as EventoData;

          console.log('Evento encontrado:', dados);

          setEvento(dados);
        } else {
          console.log('Evento não encontrado no Firebase');
          setErro(true);
        }
      } catch (error) {
        console.error('Erro ao buscar evento:', error);
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }

    buscarEvento();
  }, [id]);

  if (carregando) {
    return (
      <SafeAreaView style={styles.containerCentralizado}>
        <Text style={styles.mensagem}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (erro || !evento) {
    return (
      <SafeAreaView style={styles.containerCentralizado}>
        <Text style={styles.mensagem}>Evento não encontrado.</Text>

        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.back()}
        >
          <Text style={styles.textoBotaoVoltar}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

   const imagensLocal: string[] = (
  Array.isArray(evento.imagem)
    ? evento.imagem
    : [evento.imagem]
).filter(
  (imagem): imagem is string =>
    typeof imagem === 'string' &&
    imagem.trim() !== ''
);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
           {imagensLocal.length > 0 && (
                       <FlatList
                         data={imagensLocal}
                         horizontal
                         pagingEnabled
                         showsHorizontalScrollIndicator={false}
                         keyExtractor={(item, index) => `${item}-${index}`}
                         renderItem={({ item }) => (
                           <View
                             style={{
                               width,
                               alignItems: 'center',
                             }}
                           >
                             <Image
                               source={{ uri: item }}
                               style={styles.imagemCarrossel}
                               resizeMode="cover"
                             />
                           </View>
                         )}
                       />
                     )}
           
          <TouchableOpacity
            style={styles.botao}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#141414"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.informacoes}>
          <Text style={styles.titulo}>
            {evento.nome}
          </Text>

          <Text style={styles.subtitulo}>
            {evento.descricao}
          </Text>
        </View>

        <View style={styles.abas}>
          <Abas style={styles.aba} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },

  containerCentralizado: {
    flex: 1,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mensagem: {
    color: '#fff',
    fontSize: 16,
  },

  foto: {
    width: '100%',
    height: 300,
  },

  botao: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '4%',
    marginTop: 15,
  },

  informacoes: {
    padding: 20,
  },

  titulo: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#9AA0A6',
    fontSize: 16,
    marginTop: 8,
  },

  imagemCarrossel: {
    width: '100%',
    height: 300,
    
  },

  abas: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },

  aba: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 14,
    color: '#9AA0A6',
  },

  botaoVoltar: {
    marginTop: 20,
    backgroundColor: '#3EC5D7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },

  textoBotaoVoltar: {
    color: '#141414',
    fontWeight: 'bold',
  },
});