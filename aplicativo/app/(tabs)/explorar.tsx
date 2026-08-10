import {
  collection,
  getDocs
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
import { auth, db } from '../../FirebaseConfig';
import FotoPerfil from '@/componentes/FotoPerfil';
import { doc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';



export default function Locais() {


  const [locais, setLocais] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("lista");
  const [usuario, setUsuario] = useState<any>(null);

  async function buscarUsuarioLogado() {

    const user = auth.currentUser;

    if (!user) return;

    const usuarioRef = doc(db, "usuarios", user.uid);

    const usuarioSnap = await getDoc(usuarioRef);

    if (usuarioSnap.exists()) {
      setUsuario(usuarioSnap.data());
    }

  }

  useEffect(() => {

    buscarUsuarioLogado();

  }, []);

  useEffect(() => {


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



      } catch(error) {

        console.log("Erro ao buscar locais:", error);

      }


    }


    buscarLocais();


  }, []);


  const locaisFiltrados = locais.filter((item)=>{


    const texto = busca.toLowerCase();


    return (

      item.nome?.toLowerCase().includes(texto) ||

      item.endereco?.toLowerCase().includes(texto)

    );
 
    

  });




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
        <TouchableOpacity onPress={() => setAbaAtiva("lista")}>

          <Text
            style={[
              styles.abaTexto,
              abaAtiva === "lista" && styles.abaSelecionada,
            ]}
          >
            Lista
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setAbaAtiva("mapa")}>
          <Text
            style={[
              styles.abaTexto,
              abaAtiva === "mapa" && styles.abaSelecionada
            ]}
          >
            Mapa
          </Text>
        </TouchableOpacity>

        <FotoPerfil imagem={usuario?.imagem ?? ""} />
      </View>

      {abaAtiva === "lista" && (
      <View style={styles.containerLista}>

        <FlatList
  data={locaisFiltrados}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <LocaisCard {...item} />}
  showsVerticalScrollIndicator={false}
  ListHeaderComponent={
    <>
      <TextInput
        style={styles.busca}
        placeholder="Buscar locais, endereços..."
        value={busca}
        onChangeText={setBusca}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros}
      >
        <TouchableOpacity style={styles.botaoFiltro}>
          <Text style={styles.textoFiltro}>Vôlei</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoFiltro}>
          <Text style={styles.textoFiltro}>Futebol</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoFiltro}>
          <Text style={styles.textoFiltro}>Basquete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoFiltro}>
          <Text style={styles.textoFiltro}>Skate</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  }
/>




 {/*DEIXAR ISSO AUTOMATICO, PEGAR OS ESPORTES DO FIREBASE E COLOCAR AQUI*/}
          
          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtros}
          >
 
          <TouchableOpacity style={styles.botaoFiltro} >

            <Text style={styles.textoFiltro}>
              Vôlei
            </Text>

          </TouchableOpacity>



          <TouchableOpacity style={styles.botaoFiltro} >

            <Text style={styles.textoFiltro} >
              Futebol
            </Text>

          </TouchableOpacity>




          <TouchableOpacity style={styles.botaoFiltro}>

            <Text style={styles.textoFiltro}>
              Basquete
            </Text>

          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoFiltro}>

            <Text style={styles.textoFiltro}>
              Basquete
            </Text>

          </TouchableOpacity>


        </ScrollView>

      

        <FlatList
                  data={locaisFiltrados}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <LocaisCard {...item} />}
        
                  showsVerticalScrollIndicator={false}
        
                />
      </View>
      )} 
       {abaAtiva === "mapa" && (
        <View >
        <Text style={styles.titulo}>
          Mapa
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
    borderBottomWidth: 2, 
    borderBottomColor: '#8d8d8d' ,
    backgroundColor: '#202020' ,
  },

abaTexto:{
  color:"#aaa",
  fontSize:18,
  textAlign:"center",
  marginVertical: 20,
  marginLeft: 40,
  paddingVertical: 10,
  borderBottomWidth: 1,
  marginBottom: -1,
  borderColor:'#202020',
},


abaSelecionada:{
  color:"#00bcd4",
  borderBottomWidth: 2,
  borderColor:"#00bcd4",
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
    borderRadius:40,
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


