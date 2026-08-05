import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from '../../FirebaseConfig';

import Abas from '../../componentes/AbasLocais';



export default function Detalhes() {
   console.log("Detalhes renderizou");
  const { id } = useLocalSearchParams();
   console.log("ID:", id);
  const [local, setLocal] = useState<any>(null);

  useEffect(() => {
    console.log("Entrou no useEffect");
    async function buscarLocal() {
      console.log("Buscando...");
      if (typeof id !== 'string') return;
      
      const docRef = doc(db, 'espaco', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLocal(docSnap.data());
      }
    }

    buscarLocal();
  }, [id]);

  if (!local) return <Text>Carregando...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.foto}>
          <Image source={{ uri: local.imagem }} style={styles.foto} />
          <TouchableOpacity style={[styles.botao]}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botao]}>
            <Ionicons name="heart" size={22} color="#E53935"  />
          </TouchableOpacity>
        </View>

        <View style={styles.informacoes}>
          <Text style={styles.titulo}>{local.nome}</Text>
          <Text style={styles.subtitulo}>{local.endereco}</Text>
          <View style={styles.avaliacoes}> {/* descobrir como pegar a nota no nosso banco */}
            <Ionicons name="star" size={20} color="#FFC107" />
            <Text style={styles.nota}>{local.nota}</Text>
            <Text style={styles.avaliacoesTexto}>({local.numeroAvaliacoes})</Text> {/*descobrir como pegar o número de avaliações*/}
            {/* adicionar ícones de acessibilidade */}
          </View>
        </View>


        <View style={styles.abas}>
            <Abas
                style={styles.aba}
            />
        </View>

    


    

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: { 
    flex: 1, 
    backgroundColor: '#141414' 
  },
  foto: { 
    width: '100%', 
    height: 300 
  },
  botao: {
    position: 'absolute', 
    width: 44, 
    height: 44, 
    borderRadius: 22,
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  informacoes: { 
    padding: 20 
  },
  titulo: { 
    color: '#fff', 
    fontSize: 26, 
    fontWeight: 'bold' 
  },
  subtitulo: { 
    color: '#9AA0A6', 
    fontSize: 16, 
    marginTop: 8 
  },
  avaliacoes: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 16 
  },
  nota: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18, 
    marginLeft: 8 
  },
  avaliacoesTexto: { 
    color: '#9AA0A6', 
    marginLeft: 8 
  },
  abas: { flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#2A2A2A' 
  },
  aba: { 
    flex: 1, 
    textAlign: 'center', 
    paddingVertical: 14, 
    color: '#9AA0A6' 
  },
  abaAtiva: { 
    color: '#3EC5D7', 
    borderBottomWidth: 2, 
    borderBottomColor: '#3EC5D7' 
  },
  botoes: { 
    flexDirection: 'row', 
    padding: 20 
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
    marginTop: 10 
  },
});