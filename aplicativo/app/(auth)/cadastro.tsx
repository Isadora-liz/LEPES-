import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { auth, db } from "../../FirebaseConfig";
import type { JSX } from "react";
import { router } from "expo-router";

export default function Cadastro(): JSX.Element {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const Cadastrar = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      alert("Preencha todos os campos!");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      await setDoc(doc(db, "usuarios", userCredential.user.uid), {
        nome: nome,
        email: email,
        createdAt: new Date(),
      });
      const user = auth.currentUser;
      if (user) {
        router.replace("/(tabs)/explorar");
      } else {
        setTimeout(() => {
          router.replace("/login");
        }, 500);
      }
    } catch (e) {
      console.error("Erro ao adicionar o documento: ", e);
      alert("Erro ao cadastrar.");
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/fundo_isa.jpeg")}
        style={styles.imageBackground}
        resizeMode="cover"
        imageStyle={{ opacity: 0.4 }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.conteudos}>
            <Image
              source={require("../../assets/images/logo_LEPES.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.titulo}>Cadastre-se!</Text>

            <RNTextInput
              style={styles.input}
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
            />

            <RNTextInput
              style={styles.input}
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <RNTextInput
              style={styles.input}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <TouchableOpacity style={styles.botao} onPress={Cadastrar}>
              <Text style={styles.textoBotao}>Cadastrar</Text>
            </TouchableOpacity>
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
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },

  conteudos: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "90%",
    maxWidth: 500,
  },

  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },

  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#ffffff",
  },

  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: "#fff",
  },

  botao: {
    backgroundColor: "#119fb8",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
  },

  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    alignSelf: "center",
  },
});
