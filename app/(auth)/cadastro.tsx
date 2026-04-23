import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../FirebaseConfig';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const Cadastrar = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

      await setDoc(doc(db, "usuarios", userCredential.user.uid), {
        nome: nome,
        email: email,
        createdAt: new Date()
  });

      console.log("Usuário cadastrado com sucesso!");
      const user = auth.currentUser;
    if (user) {
      //router.replace('/perfil'); 
    } else {
      setTimeout(() => {
       // router.replace('/perfil');
      }, 500);
    }

  } catch (e) {
    console.error("Erro ao adicionar o documento: ", e);
    alert("Erro ao cadastrar.");
  }
};

  return (
    <View style={styles.containerPrincipal}>
      <View style={styles.containerLogo}>
        <Image
        //  source={require('../assets/logo.jpg')}
         // style={styles.logo}
         // resizeMode="contain"
        />
      </View>

      <View style={styles.containerCadastro}>
        <Text style={styles.titulo}>Cadastrar-se</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
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
    </View>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: {
    flex: 1,
    padding: 20,
    backgroundColor: '#90b3e6',
  },
  containerLogo: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  containerCadastro: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 12,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#001263',
    marginBottom: 15,
    backgroundColor: '#e0f2ffff',
  },
  botao: {
    width: '80%',
    backgroundColor: '#001263',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 60,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
