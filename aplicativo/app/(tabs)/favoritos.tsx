import {
  collection,
  getDocs,
  getDoc,
  doc
} from 'firebase/firestore';

import {
  useEffect,
  useState
} from 'react';

import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


import { SafeAreaView } from "react-native-safe-area-context";
import LocaisCard from '../../componentes/Locais';
import { auth, db} from '../../FirebaseConfig';
import FotoPerfil from '@/componentes/FotoPerfil';



export default function Favoritos() {

  const [locais, setLocais] = useState<any[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [abaAtiva, setAbaAtiva] = useState("locais");
  const [usuario, setUsuario] = useState<any>(null);

  async function buscarUsuarioLogado() {

    try {

      const user = auth.currentUser;

      if (!user) return;

      const usuarioRef = doc(db, "usuarios", user.uid);

      const usuarioSnap = await getDoc(usuarioRef);

      if (usuarioSnap.exists()) {

        const dadosUsuario = usuarioSnap.data();

        setUsuario(dadosUsuario);

        setFavoritos(dadosUsuario.favoritos || []);
      }

    } catch (error) {

      console.log("Erro ao buscar usuário:", error);

    }
  }


  async function buscarLocais() {

    try {

      const snapshot = await getDocs(
        collection(db, "espaco")
      );

      const lista = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({

        id: doc.id,

        ...doc.data()

      }));

      setLocais(lista);

    } catch (error) {

      console.log("Erro ao buscar locais:", error);

    }

  }


  useEffect(() => {

    buscarUsuarioLogado();

    buscarLocais();

  }, []);


  const locaisFavoritados = locais.filter((item) =>
    favoritos.includes(item.id)
  );


  return (

     <SafeAreaView style={styles.conteudos} edges={["top"]}>
        <ImageBackground
            source={require('../../assets/images/fundo_volei.jpg')}
            style={styles.imageBackground}
            resizeMode="cover"
            imageStyle={{
                 opacity:0.6
            }}

    >
         <View style={styles.abas}>

  <View style={styles.containerAbas}>

    <TouchableOpacity
      style={styles.botaoAba}
      onPress={() => setAbaAtiva("locais")}
    >
      <Text
        style={[
          styles.abaTexto,
          abaAtiva === "locais" && styles.abaSelecionada,
        ]}
      >
        Locais
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.botaoAba}
      onPress={() => setAbaAtiva("eventos")}
    >
      <Text
        style={[
          styles.abaTexto,
          abaAtiva === "eventos" && styles.abaSelecionada,
        ]}
      >
        Eventos
      </Text>
    </TouchableOpacity>

  </View>

  <View style={styles.perfil}>
    <FotoPerfil imagem={usuario?.imagem ?? ""} />
  </View>

</View>
      {abaAtiva === "locais" && (
      <View style={styles.containerLista}>


      <FlatList
            data={locaisFavoritados}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
            <LocaisCard  nome={item.nome}
              imagem={item.imagem}
              endereco={item.endereco} id={item.id} descricao={item.descricao} />
            )}
      />
          
      </View>
      )} 
       {abaAtiva === "eventos" && (
        <View >
        <Text style={styles.titulo}>
          Eventos
        </Text>
        </View>
      )}  
       </ImageBackground>
      </SafeAreaView>

  );
}



const styles = StyleSheet.create({
  imageBackground:{
    flex:1,
    width:"100%",
    margin: 0,
  },

abas: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#202020',
  borderBottomWidth: 1,
  borderBottomColor: '#3A3A3A',
  paddingHorizontal: 16,
},

containerAbas: {
  flex: 1,
  flexDirection: 'row',
},

botaoAba: {
  flex: 1,
  alignItems: 'center',
},

abaTexto: {
  color: '#aaa',
  fontSize: 17,
  fontWeight: '500',
  paddingVertical: 20,
  textAlign: 'center',
  borderBottomWidth: 2,
  borderBottomColor: 'transparent',
},

abaSelecionada: {
  color: '#00bcd4',
  borderBottomColor: '#00bcd4',
},

perfil: {
  marginLeft: 12,
  alignItems: 'center',
  justifyContent: 'center',
},

linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },


mapaContainer:{
  flex:1,
  justifyContent:"center",
  alignItems:"center",
},

  conteudos:{
    flex: 1, 
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
  },

  containerLista:{
    margin:20,
  },

  titulo:{
    fontSize:32,
    fontWeight:"bold",
    color:"#fff",
    marginBottom:20
  },

  busca:{
    backgroundColor:"#8d8d8d",
    color:"#fff",
    borderRadius:18,
    padding:12,
    fontSize:16,
    marginBottom:15,
    width:"80%",
  },

  filtros:{
    flexDirection:"row",
    alignItems:"center",
    paddingBottom:15,
  },

  botaoFiltro:{
    backgroundColor:"#fff",
    paddingHorizontal:20,
    paddingVertical:10,
    borderRadius:30,
    marginRight:10,
    alignSelf: "flex-start", 
    justifyContent: "center",
    alignItems: "center",
  },
  
  textoFiltro:{
    fontSize:16,
    textAlignVertical: "center", 
    paddingRight: 4, 
    includeFontPadding: false,
  }
});




