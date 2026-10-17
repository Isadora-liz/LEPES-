import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { db, auth } from "./firebase.js";
import { supabase } from "./supabase.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
    alert("ID do local não informado.");
    window.location.href = "explorar.html";
}

const docRef = doc(db, "espaco", id);
let espaco = null;

let imagensOriginais = [];
let imagensExistentes = [];

const inputImagens = document.getElementById("imagens");
const previewAtual = document.getElementById("preview-imagem-atual");
const previewNova = document.getElementById("preview-nova-imagem");


const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
    espaco = docSnap.data();
    
    document.getElementById("nome").value = espaco.nome || "";
    document.getElementById("endereco").value = espaco.endereco || "";
    document.getElementById("descricao").value = espaco.descricao || "";
    document.getElementById("horarioFuncionamento").value =espaco.horarioFuncionamento || "";
    

    // Marca as modalidades já cadastradas
    (espaco.modalidades || []).forEach((modalidade) => {
        const checkbox = document.querySelector(
            `input[name="modalidades[]"][value="${modalidade}"]`
        );

        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Marca as opções de acessibilidade já cadastradas
    (espaco.acessibilidade || []).forEach((opcao) => {
        const checkbox = document.querySelector(
            `input[name="acessibilidade[]"][value="${opcao}"]`
        );

        if (checkbox) {
            checkbox.checked = true;
        }
    });

    const imagensSalvas = espaco.imagem || [];

    imagensOriginais = Array.isArray(imagensSalvas)
        ? [...imagensSalvas]
        : [imagensSalvas].filter(Boolean);

    imagensExistentes = [...imagensOriginais];

    // Mostra todas as imagens atuais.
    mostrarMiniaturasAtuais();

} else {
    alert("Espaço não encontrado.");
    window.location.href = "explorar.html";
}

if (inputImagens) {
    inputImagens.addEventListener("change", function () {
        const mensagemImagem =
            document.getElementById("mensagem-imagem");

        const arquivos = Array.from(this.files || []);

        if (mensagemImagem) {
            if (arquivos.length > 0) {
                mensagemImagem.style.display = "block";
                mensagemImagem.textContent =
                    arquivos.length === 1
                        ? "✅ 1 imagem selecionada!"
                        : `✅ ${arquivos.length} imagens selecionadas!`;
            } else {
                mensagemImagem.style.display = "none";
                mensagemImagem.textContent = "";
            }
        }

        // Limpa as prévias anteriores.
        previewNova.innerHTML = "";

        arquivos.forEach((arquivo) => {
            if (!arquivo.type.startsWith("image/")) {
                return;
            }

            const container = document.createElement("div");
            container.className = "miniatura-container";

            const imagem = document.createElement("img");
            imagem.src = URL.createObjectURL(arquivo);
            imagem.alt = arquivo.name;
            imagem.className = "miniatura-imagem";

            container.appendChild(imagem);
            previewNova.appendChild(container);
        });
    });
}

document.getElementById("form-local").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const nome = document.getElementById("nome").value.trim();
        const endereco = document.getElementById("endereco").value.trim();
        const descricao = document.getElementById("descricao").value.trim();
        const horarioFuncionamento = document.getElementById("horarioFuncionamento").value;
         const imagensNovas = inputImagens
            ? Array.from(inputImagens.files)
            : [];


        // Obtém somente as modalidades marcadas
        const modalidades = obterCheckboxesSelecionados("modalidades[]");

        // Obtém somente as opções de acessibilidade marcadas
        const acessibilidade =
            obterCheckboxesSelecionados("acessibilidade[]");

        if (
            !nome ||
            !endereco ||
            !descricao ||
            !horarioFuncionamento ||
            modalidades.length === 0
        ) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }
        if (imagensNovas.some(
            (imagem) => !imagem.type.startsWith("image/")
        )) {
            alert("Selecione somente arquivos de imagem.");
            return;
        }

        // Guarda a URL antiga para removê-la somente após salvar
         const urlsNovas = imagensNovas.length > 0
            ? await enviarImagens(imagensNovas)
            : [];
        // Mantém as imagens existentes que não foram removidas
        // e acrescenta as URLs das novas imagens.
        const imagensFinais = [
            ...imagensExistentes,
            ...urlsNovas
        ];
// Atualiza o espaço existente no Firestore
await updateDoc(docRef, {
    nome,
    endereco,
    descricao,
    modalidades,
    acessibilidade,
    horarioFuncionamento,
    imagem: imagensFinais
});

// Se a imagem mudou ou foi removida, exclui o arquivo antigo
const imagensRemovidas = imagensOriginais.filter(
            (url) => !imagensFinais.includes(url)
        );

        for (const url of imagensRemovidas) {
            await excluirImagemSupabase(url);
        }

alert("Espaço atualizado com sucesso!");
window.location.href = "explorar.html";
        // Atualiza o espaço existente no Firestore
        await updateDoc(docRef, {
            nome,
            endereco,
            descricao,
            modalidades,
            acessibilidade,
            horarioFuncionamento,
            imagem
        });

        alert("Espaço atualizado com sucesso!");

        window.location.href = "explorar.html";

    } catch (error) {
        console.error("Erro ao atualizar espaço ou enviar imagem:", error);

        alert(
            error.message ||
            "Ocorreu um erro ao atualizar o espaço."
        );

        // Redireciona para outra página em caso de erro
        setTimeout(() => {
            window.location.href = "explorar.html";
        }, 1500);
    }
});

function mostrarMiniaturasAtuais() {
    previewAtual.innerHTML = "";

    imagensExistentes.forEach((url, indice) => {
        const container = document.createElement("div");
        container.className = "miniatura-container";

        const imagem = document.createElement("img");
        imagem.src = url;
        imagem.alt = `Imagem ${indice + 1} do local`;
        imagem.className = "miniatura-imagem";

        const botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.className = "remover-imagem";
        botaoRemover.textContent = "×";
        botaoRemover.title = "Remover imagem";
        botaoRemover.setAttribute(
            "aria-label",
            `Remover imagem ${indice + 1}`
        );

        botaoRemover.addEventListener("click", () => {
            imagensExistentes.splice(indice, 1);
            mostrarMiniaturasAtuais();
        });

        container.append(imagem, botaoRemover);
        previewAtual.appendChild(container);
    });
}

// Envia várias imagens ao Supabase e retorna suas URLs públicas.
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
        throw new Error(
            "O token do Firebase não possui a permissão necessária para enviar imagens ao Supabase."
        );
    }

    const bucket = supabase.storage.from("imagens-lepes");

    for (const imagem of imagens) {
        if (!imagem.type.startsWith("image/")) {
            throw new Error("Selecione somente arquivos de imagem.");
        }

        const extensao = imagem.name.split('.').pop()?.toLowerCase() || 'jpg';

const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;


        const caminho = `lugares/${nomeArquivo}`;

        const { error } = await bucket.upload(caminho, imagem, {
            contentType: imagem.type || "application/octet-stream",
            upsert: false
        });

        if (error) {
            throw error;
        }

        const { data } = bucket.getPublicUrl(caminho);
        urls.push(data.publicUrl);
    }

    return urls;
}

// Exclui um arquivo antigo do Supabase usando sua URL pública.
async function excluirImagemSupabase(url) {
    const marcador =
        "/storage/v1/object/public/imagens-lepes/";

    const indice = url.indexOf(marcador);

    if (indice === -1) {
        console.warn(
            "Não foi possível identificar o caminho da imagem:",
            url
        );
        return;
    }

    const caminho = decodeURIComponent(
        url.substring(indice + marcador.length)
    );

    const { error } = await supabase.storage
        .from("imagens-lepes")
        .remove([caminho]);

    if (error) {
        console.error("Erro ao excluir imagem antiga:", error);
    }
}

function obterCheckboxesSelecionados(nome) {
    return [
        ...document.querySelectorAll(
            `input[name="${nome}"]:checked`
        )
    ].map((checkbox) => checkbox.value);
}
