import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";

import { auth, db } from "../../FirebaseConfig";
import { supabase } from "../../SupabaseConfig";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

type NomeIcone = keyof typeof Ionicons.glyphMap;

export default function Perfil() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);

  const [nomeEditado, setNomeEditado] = useState("");
  const [emailEditado, setEmailEditado] = useState("");
  const [imagemEditada, setImagemEditada] =
    useState<string | null>(null);

  const [fotoEditada, setFotoEditada] =
    useState<string | null>(null);

  const [editandoPerfil, setEditandoPerfil] =
    useState(false);

  const [mostrarTermos, setMostrarTermos] =
    useState(false);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [
    enviandoRedefinicao,
    setEnviandoRedefinicao,
  ] = useState(false);

  useEffect(() => {
    const cancelarObservacao = onAuthStateChanged(
      auth,
      async (usuario: any) => {
        if (!usuario) {
          setCarregando(false);

          router.replace("/login" as never);
          return;
        }

        try {
          const uid: any = usuario.uid;

          const nomeAuth: string =
            usuario.displayName || "Usuário";

          const emailAuth: string =
            usuario.email || "";

          const referenciaUsuario = doc(
            db,
            "usuarios",
            uid
          );

          const documentoUsuario =
            await getDoc(referenciaUsuario);

          if (documentoUsuario.exists()) {
            const dados: any =
              documentoUsuario.data();

            const nomeRecebido: string =
              dados.nome || nomeAuth;

            const emailRecebido: string =
              dados.email || emailAuth;

            const imagemRecebida: string =
              dados.imagem  || null;

            setNome(nomeRecebido);
            setEmail(emailRecebido);
            setImagem(imagemRecebida);

            setNomeEditado(nomeRecebido);
            setEmailEditado(emailRecebido);
            setImagemEditada(imagemRecebida);

          } else {
            await setDoc(referenciaUsuario, {
              nome: nomeAuth,
              email: emailAuth,
              atualizadoEm: serverTimestamp(),
            });

            setNome(nomeAuth);
            setEmail(emailAuth);
            setImagem(imagem);

            setNomeEditado(nomeAuth);
            setEmailEditado(emailAuth);
            setImagemEditada(imagem);
          }
        } catch (erro: any) {
          console.log(
            "Erro ao carregar perfil:",
            erro
          );

          if (erro.code === "permission-denied") {
            Alert.alert(
              "Acesso negado",
              "As regras do Firestore não permitiram carregar o perfil."
            );
          } else {
            Alert.alert(
              "Erro",
              "Não foi possível carregar os dados do perfil."
            );
          }
        } finally {
          setCarregando(false);
        }
      }
    );

    return cancelarObservacao;
  }, []);

  function abrirEdicao() {
    setNomeEditado(nome);
    setEmailEditado(email);
    setImagemEditada(imagem);
    setEditandoPerfil(true);
  }

  function cancelarEdicao() {
    setNomeEditado(nome);
    setEmailEditado(email);
    setImagemEditada(imagem);
    setEditandoPerfil(false);
  }

  async function selecionarImagem() {
    try {
      const permissao =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          "Permissão necessária",
          "Permita o acesso às suas fotos para escolher uma imagem de perfil."
        );
        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (!resultado.canceled) {
        setFotoEditada(resultado.assets[0].uri);
      }
    } catch (erro) {
      console.log(
        "Erro ao selecionar foto:",
        erro
      );

      Alert.alert(
        "Erro",
        "Não foi possível abrir a galeria."
      );
    }
  }

  function validarDados() {
    if (!nomeEditado.trim()) {
      Alert.alert(
        "Nome obrigatório",
        "Digite seu nome completo."
      );
      return false;
    }

    if (!emailEditado.trim()) {
      Alert.alert(
        "E-mail obrigatório",
        "Digite seu e-mail."
      );
      return false;
    }

    const formatoEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(emailEditado.trim())) {
      Alert.alert(
        "E-mail inválido",
        "Digite um endereço de e-mail válido."
      );
      return false;
    }

    return true;
  }

  
async function salvarAlteracoes() {
  if (!validarDados()) {
    return;
  }

  const usuario = auth.currentUser;

  if (!usuario) {
    Alert.alert(
      "Sessão encerrada",
      "Entre novamente para editar seu perfil."
    );
    return;
  }

  try {
    setSalvando(true);

    const uid = usuario.uid;
    let urlImagem = imagemEditada;

    // Se uma nova foto foi selecionada, envia ao Supabase
    if (fotoEditada) {
      const resposta = await fetch(fotoEditada);
      const arquivo = await resposta.arrayBuffer();

      const extensao =
        fotoEditada.split(".").pop()?.split("?")[0]
          ?.toLowerCase() || "jpg";

      const tipoImagem =
        extensao === "png"
          ? "image/png"
          : extensao === "webp"
          ? "image/webp"
          : extensao === "heic"
          ? "image/heic"
          : "image/jpeg";

      const caminho =
        `usuarios/${uid}/${Date.now()}.${extensao}`;

      const { error: erroUpload } =
        await supabase.storage
          .from("imagens-lepes")
          .upload(caminho, arquivo, {
            contentType: tipoImagem,
            upsert: false,
          });

      if (erroUpload) {
        throw erroUpload;
      }

      const { data } = supabase.storage
        .from("imagens-lepes")
        .getPublicUrl(caminho);

      urlImagem = data.publicUrl;
    }

    // Salva os dados e a URL da foto no Firestore
    const referenciaUsuario = doc(
      db,
      "usuarios",
      uid
    );

    await setDoc(
      referenciaUsuario,
      {
        nome: nomeEditado.trim(),
        email: emailEditado.trim(),
        imagem: urlImagem || "",
        atualizadoEm: serverTimestamp(),
      },
      { merge: true }
    );

    setNome(nomeEditado.trim());
    setEmail(emailEditado.trim());
    setImagem(urlImagem);
    setImagemEditada(urlImagem);
    setFotoEditada(null);
    setEditandoPerfil(false);

    Alert.alert(
      "Perfil atualizado",
      "As alterações foram salvas com sucesso."
    );
  } catch (erro: any) {
    console.log("Erro ao salvar perfil:", erro);

    Alert.alert(
      "Erro",
      erro.message ||
        "Não foi possível salvar as alterações."
    );
  } finally {
    setSalvando(false);
  }
}

  function confirmarRedefinicaoSenha() {
    const usuario: any = auth.currentUser;

    const emailDaConta: string =
      usuario?.email || "";

    if (!emailDaConta) {
      Alert.alert(
        "E-mail não encontrado",
        "Não foi possível identificar o e-mail utilizado para entrar nesta conta."
      );
      return;
    }

    Alert.alert(
      "Redefinir senha",
      `Um link para criar uma nova senha será enviado para:\n\n${emailDaConta}`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Enviar",
          onPress: enviarEmailRedefinicao,
        },
      ]
    );
  }

  async function enviarEmailRedefinicao() {
    const usuario: any = auth.currentUser;

    const emailDaConta: string =
      usuario?.email || "";

    if (!emailDaConta) {
      Alert.alert(
        "E-mail não encontrado",
        "Não foi possível identificar o e-mail da conta."
      );
      return;
    }

    try {
      setEnviandoRedefinicao(true);

      auth.languageCode = "pt-BR";

      await sendPasswordResetEmail(
        auth,
        emailDaConta
      );

      Alert.alert(
        "E-mail enviado para ${emailDaConta}",
        `Acesse sua caixa de entrada e, se não encontrar a mensagem .\n\nVerifique também as pastas de spam ou lixo eletrônico..`
      );
    } catch (erro: any) {
      console.log(
        "Erro ao enviar redefinição:",
        erro
      );

      let mensagem =
        "Não foi possível enviar o e-mail de redefinição.";

      if (erro.code === "auth/invalid-email") {
        mensagem =
          "O endereço de e-mail da conta é inválido.";
      }

      if (erro.code === "auth/user-not-found") {
        mensagem =
          "Não existe uma conta cadastrada com esse e-mail.";
      }

      if (erro.code === "auth/too-many-requests") {
        mensagem =
          "Muitas solicitações foram realizadas. Aguarde alguns minutos e tente novamente.";
      }

      if (
        erro.code ===
        "auth/network-request-failed"
      ) {
        mensagem =
          "Não foi possível conectar ao Firebase. Verifique sua internet.";
      }

      Alert.alert("Erro", mensagem);
    } finally {
      setEnviandoRedefinicao(false);
    }
  }

  async function abrirPermissoes() {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível abrir as configurações do dispositivo."
      );
    }
  }

  function abrirConfiguracoes() {
    Alert.alert(
      "Configurações",
      "As configurações do aplicativo aparecerão aqui."
    );
  }

  function abrirPrivacidade() {
    Alert.alert(
      "Privacidade",
      "As opções de privacidade aparecerão aqui."
    );
  }

  function confirmarSaida() {
    Alert.alert(
      "Sair da conta",
      "Tem certeza de que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: sairDaConta,
        },
      ]
    );
  }

  async function sairDaConta() {
    try {
      await signOut(auth);
      router.replace("/login" as never);
    } catch (erro) {
      console.log("Erro ao sair:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível sair da conta."
      );
    }
  }

  // TELA DE CARREGAMENTO
  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.areaCarregamento}>
          <ActivityIndicator
            size="large"
            color="#19A6BF"
          />

          <Text style={styles.textoCarregamento}>
            Carregando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // TELA DE EDITAR PERFIL
  if (editandoPerfil) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.conteudoEditar
            }
          >
            <TouchableOpacity
              style={styles.botaoVoltarComTexto}
              activeOpacity={0.7}
              onPress={cancelarEdicao}
            >
              <Ionicons
                name="arrow-back"
                size={28}
                color="#FFFFFF"
              />

              <Text style={styles.textoVoltar}>
                Voltar
              </Text>
            </TouchableOpacity>

            <Text style={styles.tituloEditar}>
              Editar Perfil
            </Text>

            <View style={styles.areaFotoEditar}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={selecionarImagem}
              >
                <View
                  style={
                    styles.fotoEditarContainer
                  }
                >
                  {fotoEditada || imagemEditada ? (
               <Image
                  source={{
                    uri: fotoEditada || imagemEditada || "",
                  }}
                  style={styles.imagemPerfil}
                  />

                  ) : (
                    <View style={styles.fotoPadrao}>
                      <Ionicons
                        name="person-outline"
                        size={82}
                        color="#FFFFFF"
                      />
                    </View>
                  )}

                  <View
                    style={styles.circuloCamera}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={selecionarImagem}
              >
                <Text
                  style={styles.textoEditarFoto}
                >
                  Editar foto de perfil
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formulario}>
              <Text style={styles.label}>
                Nome completo
              </Text>

              <TextInput
                style={styles.input}
                value={nomeEditado}
                onChangeText={setNomeEditado}
                placeholder="Digite seu nome completo"
                placeholderTextColor="#777777"
                autoCapitalize="words"
                editable={!salvando}
              />

              <Text style={styles.label}>
                Email
              </Text>

              <TextInput
                style={styles.input}
                value={emailEditado}
                onChangeText={setEmailEditado}
                placeholder="Digite seu email"
                placeholderTextColor="#777777"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!salvando}
              />

              <View style={styles.cartaoRedefinirSenha}>
                <View
                  style={
                    styles.cabecalhoRedefinirSenha
                  }
                >
                  <View
                    style={
                      styles.iconeRedefinirSenha
                    }
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={25}
                      color="#19A6BF"
                    />
                  </View>

                  <View
                    style={
                      styles.textosRedefinirSenha
                    }
                  >
                    <Text
                      style={
                        styles.tituloRedefinirSenha
                      }
                    >
                      Redefinir senha
                    </Text>

                    <Text
                      style={
                        styles.descricaoRedefinirSenha
                      }
                    >
                      Enviaremos um link seguro
                      para o e-mail utilizado no
                      login.
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.emailRedefinicaoContainer
                  }
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#AAB8D0"
                  />

                  <Text
                    style={styles.emailRedefinicao}
                    numberOfLines={1}
                  >
                    {auth.currentUser?.email ||
                      "E-mail não encontrado"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.botaoRedefinirSenha,
                    enviandoRedefinicao &&
                      styles.botaoDesativado,
                  ]}
                  activeOpacity={0.8}
                  onPress={
                    confirmarRedefinicaoSenha
                  }
                  disabled={enviandoRedefinicao}
                >
                  {enviandoRedefinicao ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="send-outline"
                        size={20}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.textoBotaoRedefinir
                        }
                      >
                        Enviar e-mail de redefinição
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.botaoSalvar,
                  salvando &&
                    styles.botaoDesativado,
                ]}
                activeOpacity={0.8}
                onPress={salvarAlteracoes}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.textoBotaoSalvar
                    }
                  >
                    Salvar alterações
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // TELA PRINCIPAL DO PERFIL
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.conteudoPerfil
        }
      >
        <TouchableOpacity
          style={styles.botaoVoltar}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={29}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.areaPerfil}>
          <View
            style={styles.fotoPerfilContainer}
          >
            {imagem ? (
              <Image
                source={{ uri: imagem }}
                style={styles.imagemPerfil}
              />
            ) : (
              <View style={styles.fotoPadrao}>
                <Ionicons
                  name="person-outline"
                  size={82}
                  color="#FFFFFF"
                />
              </View>
            )}
          </View>

          <Text style={styles.nomePerfil}>
            {nome}
          </Text>

          <Text style={styles.emailPerfil}>
            {email}
          </Text>

          <TouchableOpacity
            style={styles.botaoEditar}
            activeOpacity={0.8}
            onPress={abrirEdicao}
          >
            <Text
              style={styles.textoBotaoEditar}
            >
              Editar Perfil
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          <OpcaoMenu
            icone="settings-outline"
            texto="Configurações"
            onPress={abrirConfiguracoes}
          />

          <View style={styles.divisor} />

          <OpcaoMenu
            icone="shield-checkmark-outline"
            texto="Privacidade"
            onPress={abrirPrivacidade}
          />

          <View style={styles.divisor} />

          <OpcaoMenu
            icone="key-outline"
            texto="Permissões"
            onPress={abrirPermissoes}
          />

          <View style={styles.divisor} />

          <OpcaoMenu
            icone="document-text-outline"
            texto="Termos de uso"
            onPress={() =>
              setMostrarTermos(true)
            }
          />

          <View style={styles.divisor} />

          <OpcaoMenu
            icone="log-out-outline"
            texto="Sair"
            vermelho
            onPress={confirmarSaida}
          />
        </View>
      </ScrollView>

      <Modal
        visible={mostrarTermos}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() =>
          setMostrarTermos(false)
        }
      >
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.conteudoTermos
            }
          >
            <TouchableOpacity
              style={
                styles.botaoVoltarComTexto
              }
              activeOpacity={0.7}
              onPress={() =>
                setMostrarTermos(false)
              }
            >
              <Ionicons
                name="arrow-back"
                size={28}
                color="#FFFFFF"
              />

              <Text style={styles.textoVoltar}>
                Voltar
              </Text>
            </TouchableOpacity>

            <Text style={styles.tituloTermos}>
              Termos de uso
            </Text>

            <View style={styles.cartaoTermos}>
              <Text
                style={styles.subtituloTermos}
              >
                Uso do aplicativo
              </Text>

              <Text
                style={styles.paragrafoTermos}
              >
                Ao utilizar o LEPES, o usuário
                concorda em fornecer informações
                verdadeiras e utilizar o
                aplicativo de maneira
                responsável.
              </Text>

              <Text
                style={styles.subtituloTermos}
              >
                Espaços e eventos
              </Text>

              <Text
                style={styles.paragrafoTermos}
              >
                As informações sobre espaços
                esportivos e eventos são
                disponibilizadas para fins
                informativos e podem sofrer
                alterações.
              </Text>

              <Text
                style={styles.subtituloTermos}
              >
                Avaliações
              </Text>

              <Text
                style={styles.paragrafoTermos}
              >
                As avaliações devem respeitar os
                demais usuários e não podem
                conter conteúdo ofensivo,
                discriminatório ou inadequado.
              </Text>

              <Text
                style={styles.subtituloTermos}
              >
                Privacidade
              </Text>

              <Text
                style={styles.paragrafoTermos}
              >
                Os dados do usuário deverão ser
                utilizados somente para oferecer
                as funcionalidades do aplicativo.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

interface OpcaoMenuProps {
  icone: NomeIcone;
  texto: string;
  onPress: () => void;
  vermelho?: boolean;
}

function OpcaoMenu({
  icone,
  texto,
  onPress,
  vermelho = false,
}: OpcaoMenuProps) {
  const cor = vermelho
    ? "#FF5A5F"
    : "#AAB8D0";

  return (
    <TouchableOpacity
      style={styles.opcaoMenu}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.opcaoEsquerda}>
        <Ionicons
          name={icone}
          size={26}
          color={cor}
        />

        <Text
          style={[
            styles.textoOpcao,
            vermelho && styles.textoSair,
          ]}
        >
          {texto}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={23}
        color={cor}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#181818",
  },

  areaCarregamento: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  textoCarregamento: {
    color: "#AAB8D0",
    fontSize: 16,
    marginTop: 15,
  },

  conteudoPerfil: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? 38 : 15,
    paddingBottom: 45,
  },

  botaoVoltar: {
    alignSelf: "flex-start",
    padding: 4,
  },

  areaPerfil: {
    alignItems: "center",
    marginTop: 38,
  },

  fotoPerfilContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
    backgroundColor: "#19A2B9",
  },

  imagemPerfil: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
  },

  fotoPadrao: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 80,
    backgroundColor: "#19A2B9",
  },

  nomePerfil: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
    marginTop: 24,
  },

  emailPerfil: {
    color: "#AAB8D0",
    fontSize: 16,
    marginTop: 8,
  },

  botaoEditar: {
    width: "88%",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    backgroundColor: "#19A6BF",
    marginTop: 32,
  },

  textoBotaoEditar: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  menu: {
    backgroundColor: "#292929",
    borderRadius: 20,
    marginTop: 70,
    overflow: "hidden",
  },

  opcaoMenu: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },

  opcaoEsquerda: {
    flexDirection: "row",
    alignItems: "center",
  },

  textoOpcao: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 16,
  },

  textoSair: {
    color: "#FF5A5F",
    fontWeight: "700",
  },

  divisor: {
    height: 1,
    backgroundColor: "#3A3A3A",
    marginHorizontal: 20,
  },

  conteudoEditar: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? 38 : 15,
    paddingBottom: 40,
  },

  botaoVoltarComTexto: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
  },

  textoVoltar: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  tituloEditar: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
    marginTop: 27,
  },

  areaFotoEditar: {
    alignItems: "center",
    marginTop: 40,
  },

  fotoEditarContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#19A2B9",
  },

  circuloCamera: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#18A8C4",
    borderWidth: 3,
    borderColor: "#181818",
  },

  textoEditarFoto: {
    color: "#00B7D5",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 24,
  },

  formulario: {
    marginTop: 44,
  },

  label: {
    color: "#AAB8D0",
    fontSize: 17,
    fontWeight: "500",
    marginBottom: 10,
  },

  input: {
    height: 72,
    color: "#FFFFFF",
    fontSize: 18,
    backgroundColor: "#292929",
    borderWidth: 1,
    borderColor: "#3E4A5E",
    borderRadius: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  cartaoRedefinirSenha: {
    backgroundColor: "#292929",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    borderRadius: 20,
    padding: 18,
    marginTop: 5,
    marginBottom: 10,
  },

  cabecalhoRedefinirSenha: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconeRedefinirSenha: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#1D4650",
  },

  textosRedefinirSenha: {
    flex: 1,
    marginLeft: 14,
  },

  tituloRedefinirSenha: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  descricaoRedefinirSenha: {
    color: "#AAB8D0",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  emailRedefinicaoContainer: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    borderRadius: 13,
    paddingHorizontal: 14,
    marginTop: 18,
  },

  emailRedefinicao: {
    flex: 1,
    color: "#D8DEE8",
    fontSize: 14,
    marginLeft: 10,
  },

  botaoRedefinirSenha: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#19A6BF",
    borderRadius: 27,
    paddingHorizontal: 15,
    marginTop: 15,
  },

  textoBotaoRedefinir: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 9,
  },

  botaoSalvar: {
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#19A6BF",
    borderRadius: 35,
    marginTop: 22,
  },

  botaoDesativado: {
    opacity: 0.6,
  },

  textoBotaoSalvar: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  conteudoTermos: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop:
      Platform.OS === "android" ? 38 : 15,
    paddingBottom: 40,
  },

  tituloTermos: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 30,
  },

  cartaoTermos: {
    backgroundColor: "#292929",
    borderRadius: 20,
    padding: 22,
  },

  subtituloTermos: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 9,
  },

  paragrafoTermos: {
    color: "#B8C0CF",
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 26,
  },
});