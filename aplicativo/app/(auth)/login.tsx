import { Link, useRouter } from 'expo-router';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
      const [email, setEmail] = useState('');
      const [senha, setSenha] = useState('');
      const router = useRouter();
      const auth = getAuth()

      const Logar = async () => {
        if (!email || !senha) {
        console.warn("Por favor, preencha todos os campos.");
        return;
    }
         try {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), senha.trim());
          console.log("Usuário logado com sucesso:", userCredential);
          router.push('/explorar');
    }
        catch (e) {
           console.error("Email ou senha incorretos. Por favor, tente novamente.", e);
    }
}


  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bem-vindo ao X da Questão 📘</Text>
      <Text style={styles.titulo}></Text>




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




      <TouchableOpacity style={styles.botao} onPress={Logar}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>
      <Text> ou </Text>
      <Link href="./cadastro" >
            <Text >cadastre-se</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  botao: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
