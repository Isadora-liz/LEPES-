
import { db } from "./firebase.js";
import { supabase } from "./supabase.js";
import { auth } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-local");
    const inputImagens = document.getElementById("imagens");

    if (!form) {
        console.error("Formulário não encontrado");
        return;
    }

    
if (inputImagens) {
    inputImagens.addEventListener("change", function () {
        const quantidade = this.files.length;

        const mensagemImagem =
            document.getElementById("mensagem-imagem");

        const miniaturas =
            document.getElementById("miniaturas-imagens");

        if (mensagemImagem) {
            if (quantidade > 0) {
                mensagemImagem.style.display = "block";
                mensagemImagem.textContent =
                    quantidade === 1
                        ? "✅ 1 imagem selecionada!"
                        : `✅ ${quantidade} imagens selecionadas!`;
            } else {
                mensagemImagem.style.display = "none";
                mensagemImagem.textContent = "";
            }
        }

        if (!miniaturas) return;

        // Limpa as miniaturas anteriores
        miniaturas.innerHTML = "";

        // Cria uma miniatura para cada imagem
        Array.from(this.files).forEach((arquivo) => {
            if (!arquivo.type.startsWith("image/")) return;

            const container = document.createElement("div");
            container.className = "miniatura-container";

            const img = document.createElement("img");
            img.className = "miniatura-imagem";
            img.src = URL.createObjectURL(arquivo);
            img.alt = arquivo.name;
            img.title = arquivo.name;

            container.appendChild(img);
            miniaturas.appendChild(container);
        });
    });
}

    

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const nome = document.getElementById("nome").value.trim();
            const endereco = document.getElementById("endereco").value.trim();
            const descricao = document.getElementById("descricao").value.trim();

            const horarioFuncionamento =
                document.getElementById("horarioFuncionamento").value.trim();

            const imagens = inputImagens
                ? Array.from(inputImagens.files)
                : [];

            const modalidades =
                obterCheckboxesSelecionados("modalidades[]");

            const acessibilidade =
                obterCheckboxesSelecionados("acessibilidade[]");

            if (
                !nome ||
                !endereco ||
                !horarioFuncionamento ||
                modalidades.length === 0
            ) {
                mostrarMensagem(
                    "Preencha todos os campos obrigatórios!",
                    "red"
                );
                return;
            }

            // Envia as imagens para o Supabase Storage
            const urlsImagens = await enviarImagens(imagens);


            // Salva os dados do local no Firestore
            await addDoc(collection(db, "espaco"), {
                nome,
                endereco,
                descricao,
                horarioFuncionamento,
                modalidades,
                acessibilidade,
                imagem: urlsImagens[0] ?? "",
                criadoEm: serverTimestamp()
            });

            console.log("Local salvo!");

            mostrarMensagem(
               "Local adicionado com sucesso!",
               "green"
            );

            form.reset();

            setTimeout(() => {
              window.location.href = "explorar.html";
            }, 1500);

            const mensagemImagem =
                document.getElementById("mensagem-imagem");

            if (mensagemImagem) {
                mensagemImagem.style.display = "none";
                mensagemImagem.textContent = "";
            }

        } catch (error) {
            console.error("Erro ao cadastrar local:", error);

            mostrarMensagem(
                error.message || "Erro ao cadastrar local.",
                "red"
            );
        }
    });
});


async function enviarImagens(imagens) {
    const urls = [];

    if (!imagens || imagens.length === 0) {
        return urls;
    }

    
const usuario = auth.currentUser;

if (!usuario) {
    throw new Error("Usuário não autenticado no Firebase.");
}

const resultadoToken = await usuario.getIdTokenResult(true);


    if (resultadoToken.claims.role !== "authenticated") {
        console.error(
            "O token não contém a role authenticated."
        );
        throw new Error(
            "O token do Firebase não possui a permissão necessária para enviar imagens ao Supabase."
        );
    }

    for (const imagem of imagens) {
        console.log("Enviando imagem:", imagem.name);

        const nomeArquivo =
            `${crypto.randomUUID()}-${imagem.name}`;

        const caminho = `lugares/${nomeArquivo}`;

        console.log("Caminho enviado:", caminho);

        const bucket = supabase.storage.from("imagens-lepes");

        const { data: arquivoEnviado, error } =
            await bucket.upload(caminho, imagem, {
                contentType:
                    imagem.type || "application/octet-stream",
                upsert: false
            });

        if (error) {
            console.error("Erro ao enviar imagem:", error);
            throw error;
        }

        console.log("Upload concluído:", arquivoEnviado);

        const { data } = bucket.getPublicUrl(caminho);
        console.log("URL gerada:", data.publicUrl);

        urls.push(data.publicUrl);
    }

    return urls;
}


function obterCheckboxesSelecionados(nome) {
    return [
        ...document.querySelectorAll(
            `input[name="${nome}"]:checked`
        )
    ].map(checkbox => checkbox.value);
}

function mostrarMensagem(texto, cor) {
    const mensagem = document.getElementById("mensagem-sucesso");

    if (!mensagem) return;

    mensagem.textContent = texto;
    mensagem.style.color = cor;
    mensagem.style.display = "block";
}
