import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { db } from '../../FirebaseConfig';

export default function Detalhes() {
  const { id } = useLocalSearchParams();
  const [local, setLocal] = useState<any>(null);

  useEffect(() => {
    async function buscarLocal() {
      if (typeof id !== 'string') return;
      
      const docRef = doc(db, 'locais', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLocal(docSnap.data());
      }
    }

    buscarLocal();
  }, [id]);

  if (!local) return <Text>Carregando...</Text>;

  return (
    <View>
      <Text>{local.nome}</Text>
      <Text>{local.descricao}</Text>
    </View>
  );
}