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
  TouchableOpacity
} from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";
import LocaisCard from '../../componentes/Locais';
import { db } from '../../FirebaseConfig';



export default function Locais() {


  const [locais, setLocais] = useState<any[]>([]);
  const [busca, setBusca] = useState("");




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


    <ImageBackground

      source={require('../../assets/images/fundo_volei.jpg')}

      style={styles.imageBackground}

      resizeMode="cover"

      imageStyle={{
        opacity:0.6
      }}

    >



      <SafeAreaView style={styles.conteudos}>



        <Text style={styles.titulo}>
          Espaços
        </Text>




        <TextInput

          style={styles.busca}

          placeholder="Buscar eventos, endereços..."

          value={busca}

          onChangeText={setBusca}

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

      </SafeAreaView>
    </ImageBackground>


  );

}




const styles = StyleSheet.create({
  imageBackground:{
    flex:1,
    width:"100%",
  },

  conteudos:{
    flex:1,
    width:"100%",
    padding:20,
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