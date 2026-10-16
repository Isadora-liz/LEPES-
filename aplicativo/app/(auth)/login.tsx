import { Link, useRouter } from 'expo-router';
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";

import React, { useEffect, useState } from 'react';

import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import * as WebBrowser from "expo-web-browser";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { auth } from "../../FirebaseConfig";

WebBrowser.maybeCompleteAuthSession();


export default function Login() {

  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

   useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "976198499922-6vtsnd8no5ubi85tmdcgfep8utg1sab7.apps.googleusercontent.com",
    });
  }, []);


 const LogarGoogle = async () => {
  try {
    console.log("1 - começou login Google");

    await GoogleSignin.hasPlayServices();

    console.log("2 - Play Services OK");

    const response = await GoogleSignin.signIn();

    console.log("3 - resposta Google:", response);

    if (!response.data?.idToken) {
      console.log("4 - Google não retornou ID Token");
      return;
    }

    console.log("5 - ID Token recebido");

    const credential = GoogleAuthProvider.credential(
      response.data.idToken
    );

    console.log("6 - Credential criada");

    const userCredential = await signInWithCredential(
      auth,
      credential
    );

    console.log(
      "7 - Firebase login OK:",
      userCredential.user.email
    );

    console.log("8 - indo para explorar");

    router.replace("/explorar");

  } catch (error: any) {
    console.log("ERRO GOOGLE COMPLETO:");
    console.log(error);
    console.log("Código:", error?.code);
    console.log("Mensagem:", error?.message);
  }
};

  const Logar = async () => {
    if (!email || !senha) {
      console.warn("Por favor, preencha todos os campos.");
      return;
    }
    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          senha.trim()
        );
      console.log(
        "Usuário logado com sucesso:",
        userCredential.user.email
      );
      router.push('/explorar');
    } catch (e) {
      console.error(
        "Email ou senha incorretos.",
        e
      );

    }
  };


  
  return (
    <View style={styles.container}>

      <ImageBackground
        source={require('../../assets/images/fundo_igor.jpeg')}
        style={styles.imageBackground}
        resizeMode="cover"
        imageStyle={{ opacity: 0.4 }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 0 : 20
        }
      >

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.conteudos}>

            <View style={styles.logo}>

              <Image
                source={require('../../assets/images/logo_LEPES.png')}
                style={styles.logoImagem}
                resizeMode="contain"
              />

            </View>


            <View style={styles.inputs}>

            
      

              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#5b5b5b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />


              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#5b5b5b"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />



              <TouchableOpacity
                style={styles.botao}
                onPress={Logar}
              >

                <Text style={styles.textoBotao}>
                  Entrar
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={styles.botaoGoogle}
                onPress={LogarGoogle}
              
              >

                <Text style={styles.textoBotaoGoogle}>
                  Entrar com o Google
                </Text>

              </TouchableOpacity>

            </View>



            <Link
              href="./cadastro"
              style={styles.linkCadastro}
            >

              <Text style={styles.textoAlternativaBranco}>
                não tem uma conta?
              </Text>

              <Text style={styles.textoAlternativaAzul}>
                cadastre-se
              </Text>

            </Link>



            <Link
              href="(tabs)/./explorar"
              style={styles.linkVisitante}
            >

              <Text style={styles.textoAlternativaAzul}>
                continuar como visitante
              </Text>

            </Link>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  imageBackground: {
    ...StyleSheet.absoluteFill,
  },

  keyboardView: {
    flex: 1,
    width: '100%',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },

  conteudos: {
    width: '90%',
    maxWidth: 500,
  },

  logo: {
    alignItems: 'center',
    marginBottom: 20,
  },

  logoImagem: {
    width: 200,
    height: 200,
  },

  inputs: {
    zIndex: 1,
    padding: 20,
    width: '100%',
  },

  linkCadastro: {
    flexDirection: 'row',
    width: "100%",
    justifyContent: "center",
    textAlign: "center"
  },

  linkVisitante: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    textAlign:"center"
  },

  textoAlternativaBranco: {
    color: '#ffffff',
  },

  textoAlternativaAzul: {
    color: '#119fb8',
  },

  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: "#515050"
  },

  botao: {
    backgroundColor: '#119fb8',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
  },

  botaoGoogle: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 12,
    borderRadius: 25,
    width: '100%',
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
  },

  textoBotaoGoogle: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
  },

});