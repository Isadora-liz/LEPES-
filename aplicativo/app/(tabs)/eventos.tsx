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
import EventoCard from '../../componentes/Eventos';
import { db } from '../../FirebaseConfig';



export default function Eventos() {


  const [eventos, setEventos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");




  useEffect(() => {


    async function buscarEventos() {


      try {


        const snapshot = await getDocs(
          collection(db, "eventos")
        );


        const lista = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({

          id: doc.id,

          ...doc.data()

        }));


        setEventos(lista);



      } catch(error) {

        console.log("Erro ao buscar eventos:", error);

      }


    }


    buscarEventos();


  }, []);


  const eventosFiltrados = eventos.filter((item)=>{


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
          Eventos
        </Text>




        <TextInput

          style={styles.busca}

          placeholder="Buscar eventos, endereços..."

          value={busca}

          onChangeText={setBusca}

        />




 {/* DEIXAR ISSO AUTOMATICO, PEGAR OS ESPORTES DO FIREBASE E COLOCAR AQUI*/}
          
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
          data={eventosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventoCard {...item} />}

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
  header: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
    },

  avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: "#7C3AED",
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
    includeFontPadding: false, /*resolve o problema de comer a ultima letra*/
  }
});