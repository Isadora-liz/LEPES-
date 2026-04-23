import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Locais from '../../componentes/Locais';
import { db } from '../../FirebaseConfig';

export default function Explorar() {
  const [locais, setLocais] = useState<any[]>([]);

  useEffect(() => {
    async function buscarLocais() {
      const querySnapshot = await getDocs(collection(db, 'locais'));

      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLocais(lista);
    }

    buscarLocais();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/fundo_volei.jpg')}
        style={styles.imageBackground}
        resizeMode='cover'
        imageStyle={{ opacity: 0.2}}
      >
      {locais.map((item) => (
        <Locais
          key={item.id}
          id={item.id}
          nome={item.nome}
          descricao={item.descricao}
          imagem={item.imagem}
        />
      ))}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',

  },
  title: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#888',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
