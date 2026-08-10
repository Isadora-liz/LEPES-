import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../../FirebaseConfig';
import Abas from '../../componentes/AbasDetalhesLocais';
import { getDocs } from 'firebase/firestore';

interface LocalData {
  imagem: string;
  nome: string;
  descricao: string;
  favoritos?: string[];
}

export default function Detalhes() {
  console.log('Detalhes renderizou');

  const { id } = useLocalSearchParams();
  console.log("Tipo:", typeof id);
  console.log('ID:', id);

  const [local, setLocal] = useState<LocalData | null>(null);
  const [favoritado, setFavoritado] = useState(false);
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState(0);
  const [quantidadeAvaliacoes, setQuantidadeAvaliacoes] = useState(0);

  useEffect(() => {
    console.log('Entrou no useEffect');

  async function buscarLocal() {
  if (typeof id !== 'string') return;

  try {

    const docRef = doc(db, 'espaco', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const dados = docSnap.data() as LocalData;

      setLocal(dados);
      const auth = getAuth();
      const usuario = auth.currentUser;

      if (usuario) {
        const favoritos = dados.favoritos || [];
        setFavoritado(favoritos.includes(usuario.uid));
      }

      const avaliacoesRef = collection(
        db,
        'espaco',
        id,
        'avaliacoes'
      );

      const avaliacoesSnap = await getDocs(avaliacoesRef);

      const quantidade = avaliacoesSnap.size;

      setQuantidadeAvaliacoes(quantidade);
      if (quantidade === 0) {
        setMediaAvaliacoes(0);
        return;
      }

      let somaNotas = 0;

      avaliacoesSnap.forEach((avaliacao: { data: () => any; }) => {
        const dadosAvaliacao = avaliacao.data();

        somaNotas += Number(dadosAvaliacao.nota) || 0;
      });

      const media = somaNotas / quantidade;

      setMediaAvaliacoes(media);
    }
  } catch (error) {
    console.error('Erro ao buscar local:', error);
  }
}
    buscarLocal();
  }, [id]);

  async function favoritar() {
  if (typeof id !== 'string') {
    return;
  }

  try {
    const usuario = auth.currentUser;

    if (!usuario) {
      console.log(" Usuário não está logado");
      return;
    }


    const usuarioRef = doc(
      db,
      "usuarios",
      usuario.uid
    );

    console.log(
      "Caminho procurado:",
      `usuarios/${usuario.uid}`
    );

    const usuarioSnap = await getDoc(usuarioRef);

    if (!usuarioSnap.exists()) {
      return;
    }

    console.log(
      usuarioSnap.data()
    );

    if (favoritado) {
      await updateDoc(usuarioRef, {
        favoritos: arrayRemove(id),
      });

      setFavoritado(false);
    } else {
      await updateDoc(usuarioRef, {
        favoritos: arrayUnion(id),
      });

      setFavoritado(true);
    }

  } catch (error) {
    console.log("erro ao favoritar", error);
  }
}
  if (!local) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff' }}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <Image source={{ uri: local.imagem }} style={styles.foto} />
          
          <TouchableOpacity
            style={styles.botao}
            onPress={() => router.push('/explorar')}
          >
            <Ionicons name="arrow-back" size={24} color="#141414" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoFav}
            onPress={favoritar}
          >
            <Ionicons
              name={favoritado ? 'heart' : 'heart-outline'}
              size={24}
              color={favoritado ? '#E53935' : '#141414'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.informacoes}>
          <Text style={styles.titulo}>{local.nome}</Text>

          <Text style={styles.subtitulo}>
            {local.descricao}
          </Text>

          <View style={styles.avaliacoes}>
              {quantidadeAvaliacoes > 0 ? (
              <>
            <Ionicons
                name="star"
                size={20}
                color="#FFC107"
            />

            <Text style={styles.nota}>
              {mediaAvaliacoes.toFixed(1)}
            </Text>

            <Text style={styles.avaliacoesTexto}>
              ({quantidadeAvaliacoes}{' '}
              {quantidadeAvaliacoes === 1
                ? 'avaliação'
                : 'avaliações'})
            </Text>
            </>
            ) : (
            <>
            <Ionicons
                name="star-outline"
                size={20}
                color="#9AA0A6"
            />

            <Text style={styles.semAvaliacoes}>
                Ainda não há avaliações
            </Text>
            </>
            )}
        </View>
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

  botaoFav: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    right: '4%',
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

  avaliacoes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  semAvaliacoes: {
  color: '#9AA0A6',
  fontSize: 15,
  marginLeft: 8,
},

  nota: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },

  avaliacoesTexto: {
    color: '#9AA0A6',
    marginLeft: 8,
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

  abaAtiva: {
    color: '#3EC5D7',
    borderBottomWidth: 2,
    borderBottomColor: '#3EC5D7',
  },

  botoes: {
    flexDirection: 'row',
    padding: 20,
  },

  cartao: {
    flex: 1,
    backgroundColor: '#262626',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  cartaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },
});