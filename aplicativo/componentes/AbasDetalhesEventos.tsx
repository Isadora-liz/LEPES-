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
  const [evento, setEvento] = useState<any>(null);

  useEffect(() => {
    async function buscarEvento() {
      console.log("Buscando...");
      if (typeof id !== 'string') return;

      const docRef = doc(db, 'eventos', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setEvento(docSnap.data());
      }
    }

    buscarEvento();
  }, [id]);

  const compartilharLocal = async () => {
  try {
    await Share.share({
      message:
        "Confira esse evento esportivo no LEPES: " + evento?.nome,
    });

  } catch (error) {
    console.log(error);
  }
};

  const abrirRotas = async () => {
    const destino = `${evento.endereco}`;

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
            <Text style={{color: '#9d9c9c', fontWeight: "black", marginLeft: 30}}>{evento?.endereco}</Text>

            <View style={styles.dataRow}>
                <Ionicons name="calendar-outline" size={30} color="#3EC5D7" />
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>Data de Início</Text>
            </View>
            <Text style={{color: '#9d9c9c', marginLeft: 30}}>{evento?.dataInicio}</Text>

            <View style={styles.dataRow}>
                <Ionicons name="calendar-outline" size={30} color="#3EC5D7" />
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>Data de Fim</Text>
            </View>
            <Text style={{color: '#9d9c9c', marginLeft: 30}}>{evento?.dataFim}</Text>

            <View style={styles.horarioRow}>
                <Ionicons name="time-outline" size={30} color="#3EC5D7" />
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>Horário</Text>
            </View>
            <Text style={{color: '#9d9c9c', marginLeft: 30}}>{evento?.horario}</Text>

          </View>
          <View style={styles.rodape}>
            <Text style={{color: '#9d9c9c', marginLeft: 30}}>para mais informações acesse: </Text>
          </View>
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
            Visão Geral
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

  dataRow:{
    flexDirection: 'row',
    marginTop: 30
  },

  horarioRow:{
    flexDirection: 'row',
    marginTop: 30
  },

  rodape:{
    
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