import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle, Share, Linking} from 'react-native';
import { db } from '../FirebaseConfig';
import { doc } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { getDoc } from 'firebase/firestore';

interface AbasProps {
  style?: StyleProp<ViewStyle>;
}


export default function Abas({ style }: AbasProps) {
  const { id } = useLocalSearchParams();
  const [local, setLocal] = useState<any>(null);

  useEffect(() => {
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

  const compartilharLocal = async () => {
  try {
    await Share.share({
      message:
        "Confira esse local esportivo no LEPES: " + local?.nome,
    });

  } catch (error) {
    console.log(error);
  }
};

  const abrirRotas = async () => {
    const destino = `${local.nome}, ${local.endereco}`;

    const url =`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`; 

    await Linking.openURL(url);
  };

  const [abaAtiva, setAbaAtiva] = useState('Visão geral');
  const renderConteudo = () => {
    switch (abaAtiva) {

      case 'Visão geral':
        return (
        <View>
          <View style={styles.botoes}>
            <TouchableOpacity style={styles.cartao}
              onPress={abrirRotas}
            >
              <Ionicons name="send" size={24} color="#3EC5D7" />
              <Text style={styles.cartaoTexto}>Rotas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartao}
               onPress={compartilharLocal}
            >
              <Ionicons name="share-social" size={24} color="#3EC5D7" />
              <Text style={styles.cartaoTexto}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.enderecoRow}>
                <Ionicons name="location-outline" size={30} color="#3EC5D7" />
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>Endereço</Text>
            </View>
            <Text style={{color: '#9d9c9c', fontWeight: "black", marginLeft: 30}}>{local?.endereco}</Text>
            <View style={styles.funcionamentoRow}>
                <Ionicons name='time-outline' size={30} color='#3EC5D7'></Ionicons>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>Horário de funcionamento</Text>
            </View>
            <Text style={{color: '#9d9c9c', marginLeft: 30}}>{local?.horarioFuncionamento}</Text>

          </View>
        </View> 

        );
      case 'Avaliações':
        return (
          <View>
            <Text style={{color: '#fff'}}>Conteúdo das Avaliações</Text>
          </View>
        );
      case 'Acessibilidade':
        return (
          <View>
            <Text style={{color: '#fff'}}>Conteúdo de Acessibilidade</Text>
          </View>
        );
      default:
        return null;
        
    }
    
  };

  return (
    <View style={styles.container}>
      <View style={styles.abas}>
        <TouchableOpacity onPress={() => setAbaAtiva('Visão geral')} style={{ flex: 1 }}>
          <Text style={[styles.aba, abaAtiva === 'Visão geral' && styles.abaAtiva]}>
            Visão geral
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva('Avaliações')} style={{ flex: 1 }}>
          <Text style={[styles.aba, abaAtiva === 'Avaliações' && styles.abaAtiva]}>
            Avaliações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva('Acessibilidade')} style={{ flex: 1 }}>
          <Text style={[styles.aba, abaAtiva === 'Acessibilidade' && styles.abaAtiva,]} >
            Acessibilidade
          </Text>
        </TouchableOpacity>
      </View>

      {renderConteudo()}
    </View>
  );
}


const styles = StyleSheet.create ({

  container: { 
    flex: 1, 
    backgroundColor: '#141414' 
  },
  abas: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#2A2A2A', 
    justifyContent: 'space-between',
  },
  aba: { 
    textAlign: 'center', 
    paddingVertical: 10,
    paddingHorizontal: 20, 
    color: '#9AA0A6' ,
    includeFontPadding: false,
  },
  abaAtiva: { 
    color: '#3EC5D7', 
    borderBottomWidth: 2, 
    borderBottomColor: '#3EC5D7' ,
    includeFontPadding: false,
  },
  enderecoRow:{
    flexDirection: 'row'
  },

  funcionamentoRow:{
    flexDirection: 'row',
    marginTop: 30

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

})