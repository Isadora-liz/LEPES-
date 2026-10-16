import {
  collection,
  onSnapshot,
  getDocs,
  doc,
  getDoc
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

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { SafeAreaView } from "react-native-safe-area-context";
import LocaisCard from '../../componentes/Locais';
import { auth, db } from '../../FirebaseConfig';
import FotoPerfil from '@/componentes/FotoPerfil';
import { Feather } from '@expo/vector-icons';


export default function Locais() {

  const [locais, setLocais] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("lista");
  const [usuario, setUsuario] = useState<any>(null);
  const [modalidades, setModalidades] = useState<string[]>([]);
  const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState<string[]>([]);

  const iconesModalidades: Record<string, string> = {
    Futsal: "⚽",
    Basquete: "🏀",
    Vôlei: "🏐",
    Skate: "🛹",
    Bocha: "🎯",
    Tênis: "🎾",
    "Tênis de mesa": "🏓",
    Futevôlei: "⚽",
    "Tênis de praia": "🎾",
    "Vôlei de praia": "🏐",
    "Corrida de rua": "🏃‍♂️",
  };


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


  function alternarModalidade(
    modalidade: string
  ) {

    setModalidadesSelecionadas(
      (modalidadesAnteriores) => {

        const estaSelecionada =
          modalidadesAnteriores.includes(
            modalidade
          );


        if (estaSelecionada) {

          return modalidadesAnteriores.filter(
            (item) =>
              item !== modalidade
          );

        }


        return [
          ...modalidadesAnteriores,
          modalidade,
        ];

      }
    );

  }


useEffect(() => {

  const unsubscribe = onSnapshot(
    collection(db, "espaco"),
    (snapshot: { docs: any[]; }) => {

      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setLocais(lista);

      
      const todasModalidades = lista.flatMap(
        (espaco: any) => espaco.modalidades || []
      );

      const modalidadesUnicas: string[] = [
        ...new Set(todasModalidades)
      ].filter(
        (modalidade): modalidade is string =>
          typeof modalidade === "string"
      );

      setModalidades(modalidadesUnicas);
    }
  );

  return () => unsubscribe();

}, []);

  function removerAcentos(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

  const locaisFiltrados =
    locais.filter((item) => {

      const texto = removerAcentos(busca);

  const correspondeBusca =
    removerAcentos(item.nome || "").includes(texto) ||
    removerAcentos(item.endereco || "").includes(texto);

   const correspondeModalidade =
    modalidadesSelecionadas.length === 0 ||
    modalidadesSelecionadas.every((modalidade) =>
      item.modalidades?.includes(modalidade)
    );

  return correspondeBusca && correspondeModalidade;

});

  return (

    <SafeAreaView style={styles.conteudos} edges={["top"]}>

      <ImageBackground
        source={require('../../assets/images/fundo_hele.jpeg')}
        style={styles.imageBackground}
        resizeMode="cover"
        imageStyle={{
          opacity: 0.6
        }}
      >

        <View style={styles.abas}>

          <View style={styles.containerAbas}>

            <TouchableOpacity
              style={styles.botaoAba}
              onPress={() => setAbaAtiva("lista")}
              activeOpacity={0.7}
            >

              <Text
                style={[
                  styles.abaTexto,
                  abaAtiva === "lista" &&
                  styles.abaSelecionada,
                ]}
              >
                Lista
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={styles.botaoAba}
              onPress={() => setAbaAtiva("mapa")}
              activeOpacity={0.7}
            >

              <Text
                style={[
                  styles.abaTexto,
                  abaAtiva === "mapa" &&
                  styles.abaSelecionada,
                ]}
              >
                Mapa
              </Text>

            </TouchableOpacity>

          </View>


          <View style={styles.perfil}>

            <FotoPerfil
              imagem={usuario?.imagem ?? ""}
            />

          </View>

        </View>


        {abaAtiva === "lista" && (

          <View style={styles.containerLista}>

            <View style={styles.containerBusca}>

              <Feather
                name="search"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.busca}
                placeholder="Buscar eventos..."
                placeholderTextColor="#64748B"
                value={busca}
                onChangeText={setBusca}
              />

            </View>


            <View style={styles.containerFiltros}>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollFiltros}
                contentContainerStyle={styles.filtros}
              >

                {modalidades.map((modalidade) => (

                  <TouchableOpacity
                    key={modalidade}
                    style={[
                      styles.botaoFiltro,
                      modalidadesSelecionadas.includes(modalidade) &&
                      styles.botaoFiltroAtivo,
                    ]}
                    onPress={() => alternarModalidade(modalidade)}
                    activeOpacity={0.7}
                  >

                    {iconesModalidades[modalidade] && (

                      <Text style={styles.iconeFiltro}>
                        {iconesModalidades[modalidade]}
                      </Text>

                    )}


                    <Text
                      style={[
                        styles.textoFiltro,
                        {
                          minWidth: modalidade.length * 10,
                        },
                        modalidadesSelecionadas.includes(modalidade) &&
                        styles.textoFiltroAtivo,
                      ]}
                    >
                      {modalidade}
                    </Text>

                  </TouchableOpacity>

                ))}

              </ScrollView>

            </View>


            <View style={styles.listaContainer}>

              <FlatList
                style={styles.lista}
                data={locaisFiltrados}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
  <LocaisCard
    {...item}
    imagem={item.imagens?.[0] ?? item.imagem ?? ''}
  />
)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listaConteudo}
                ListHeaderComponent={
                  <>
                  </>
                }
              />

            </View>

          </View>

        )}


        {abaAtiva === "mapa" && (

          <View style={styles.containerMapa}>

           {/*  //<MapView
             // style={styles.map}
              
            >

            //</MapView> */}

          </View>

        )}

      </ImageBackground>

    </SafeAreaView>

  );

}


const styles = StyleSheet.create({

  imageBackground: {
    flex: 1,
    width: "100%",
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


  mapaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },


  conteudos: {
    flex: 1,
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
  },


  containerLista: {
    flex: 1,
    margin: 20,
  },


  listaContainer: {
    flex: 1,
  },


  lista: {
    flex: 1,
  },


  listaConteudo: {
    paddingBottom: 20,
  },


  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20
  },


  containerBusca: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(62, 197, 215, 0.35)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },


  busca: {
    flex: 1,
    height: "100%",
    marginLeft: 12,
    paddingVertical: 0,
    color: "#1E293B",
    fontSize: 15,
  },


  containerFiltros: {
    height: 54,
    marginBottom: 8,
    justifyContent: "center",
  },


  scrollFiltros: {
    flexGrow: 0,
  },


  filtros: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingRight: 10,
  },


  botaoFiltro: {
    height: 42,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    borderRadius: 21,
    marginRight: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    flexShrink: 0,
    alignSelf: "flex-start",
  },


  conteudoFiltro: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },


  iconeFiltro: {
    fontSize: 16,
    marginRight: 6,
  },


  textoFiltro: {
    fontSize: 15,
    lineHeight: 20,
    color: "#222",
    flexShrink: 0
  },


  botaoFiltroAtivo: {
    backgroundColor: "#3EC5D7",
    borderColor: "#3EC5D7",
  },


  textoFiltroAtivo: {
    color: "#fff",
    fontWeight: "700",
  },


  containerMapa: {
    flex: 1,
  },


  map: {
    width: "100%",
    height: "100%"
  },

});