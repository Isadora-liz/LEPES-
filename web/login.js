
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "./firebase.js";

document.querySelector(".entrar").addEventListener("click", async function(e) {
    e.preventDefault();

    const email = document.getElementById("user").value;
    const senha = document.getElementById("senha").value;
    
    const erroElemento = document.getElementById("mensagem-erro");
 
    erroElemento.style.display = "none";
    erroElemento.textContent = "";


    if (!email || !senha) {
        erroElemento.textContent = "Por favor, preencha todos os campos.";
        erroElemento.style.display = "block";
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email.trim(), senha.trim());
        window.location.href = "explorar.html";

    } catch (error) {
        console.error("Erro no Firebase:", error.code);
        
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            erroElemento.textContent = "Email ou senha incorretos.";
        } else if (error.code === 'auth/invalid-email') {
            erroElemento.textContent = "Por favor, insira um e-mail válido.";
        } else {
            erroElemento.textContent = "Ocorreu um erro ao tentar fazer login.";
        }
        erroElemento.style.display = "block";
    }
});