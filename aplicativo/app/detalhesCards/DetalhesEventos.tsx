import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from '../../FirebaseConfig';

export default function Detalhes() {
   console.log("Detalhes renderizou");
  const { id } = useLocalSearchParams();
   console.log("ID:", id);
  const [evento, setEvento] = useState<any>(null);

  useEffect(() => {
    console.log("Entrou no useEffect");
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

  if (!evento) return <Text>Carregando...</Text>;

  return (
    <SafeAreaView style={styles.container}>
    <Text>Estou na tela de detalhes!</Text>
    <Text>{evento.nome}</Text> 
    <Text>{evento.descricao}</Text>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  
    backgroundColor: "white" 
  },
});