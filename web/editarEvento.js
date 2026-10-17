
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
    alert("ID do evento não informado.");
    window.location.href = "eventos.html";
    throw new Error("ID do evento não informado.");
}

const docRef = doc(db, "eventos", id);

let evento = null;

// URLs das imagens
let imagensOriginais = [];
let imagensExistentes = [];

const inputImagens = document.getElementById("imagens");
const previewAtual = document.getElementById("preview-imagem-atual");
const previewNova = document.getElementById("preview-nova-imagem");

const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
    evento = docSnap.data();

    document.getElementById("nome").value = evento.nome || "";
    document.getElementById("endereco").value = evento.endereco || "";
    document.getElementById("descricao").value = evento.descricao || "";

    // Carrega as datas salvas no Firestore.
    document.getElementById("dataInicio").value =
        evento.dataInicio?.toDate
            ? evento.dataInicio.toDate().toISOString().split("T")[0]
            : "";

    document.getElementById("dataFim").value =
        evento.dataFim?.toDate
            ? evento.dataFim.toDate().toISOString().split("T")[0]
            : "";

    document.getElementById("horarioInicio").value =
        evento.horarioInicio || "";

    document.getElementById("horarioFim").value =
        evento.horarioFim || "";

    // Marca as modalidades já cadastradas.
    (evento.modalidades || []).forEach((modalidade) => {
        const checkbox = [
            ...document.querySelectorAll('input[name="modalidades[]"]')
        ].find((item) => item.value === modalidade);

        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Marca as opções de acessibilidade já cadastradas.
    (evento.acessibilidade || []).forEach((opcao) => {
        const checkbox = [
            ...document.querySelectorAll('input[name="acessibilidade[]"]')
        ].find((item) => item.value === opcao);

        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Aceita tanto o array novo quanto uma URL antiga.
    const imagensSalvas = evento.imagem || [];
    
    imagensOriginais = Array.isArray(imagensSalvas)
        ? [...imagensSalvas]
        : [imagensSalvas].filter(Boolean);

    imagensExistentes = [...imagensOriginais];

    // Mostra todas as imagens atuais.
    mostrarMiniaturasAtuais();

} else {
    alert("Evento não encontrado.");
    window.location.href = "eventos.html";
    throw new Error("Evento não encontrado.");
}

// Mostra a quantidade de imagens selecionadas
// e as prévias das novas imagens.
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

// Atualiza o evento.
document.getElementById("form-evento").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const nome = document.getElementById("nome").value.trim();
        const endereco = document.getElementById("endereco").value.trim();
        const descricao = document.getElementById("descricao").value.trim();
        const dataInicio = document.getElementById("dataInicio").value;
        const dataFim = document.getElementById("dataFim").value;
        const horarioInicio = document.getElementById("horarioInicio").value;
        const horarioFim = document.getElementById("horarioFim").value;

        const imagensNovas = inputImagens
            ? Array.from(inputImagens.files)
            : [];
        

        const modalidades =
            obterCheckboxesSelecionados("modalidades[]");

        const acessibilidade =
            obterCheckboxesSelecionados("acessibilidade[]");

        // Validação dos campos obrigatórios.
        if (
            !nome ||
            !endereco ||
            !descricao ||
            !dataInicio ||
            !dataFim ||
            !horarioInicio ||
            !horarioFim ||
            modalidades.length === 0
        ) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        // Valida os tipos de arquivo antes de enviar.
        if (imagensNovas.some(
            (imagem) => !imagem.type.startsWith("image/")
        )) {
            alert("Selecione somente arquivos de imagem.");
            return;
        }

        // Converte as datas para Date.
        const inicio = new Date(`${dataInicio}T00:00:00`);
        const fim = new Date(`${dataFim}T00:00:00`);

        if (
            Number.isNaN(inicio.getTime()) ||
            Number.isNaN(fim.getTime())
        ) {
            alert("Informe datas válidas.");
            return;
        }

        // Envia todas as imagens novas ao Supabase.
        const urlsNovas = imagensNovas.length > 0
            ? await enviarImagens(imagensNovas)
            : [];

        // Mantém as imagens existentes que não foram removidas
        // e acrescenta as URLs das novas imagens.
        const imagensFinais = [
            ...imagensExistentes,
            ...urlsNovas
        ];

        // Atualiza o evento no Firestore.
        // O campo imagem passa a ser um array de URLs.
        console.log('Imagens que serão salvas:', imagensFinais);
        await updateDoc(docRef, {
            nome,
            endereco,
            descricao,
            modalidades,
            acessibilidade,
            dataInicio: inicio,
            dataFim: fim,
            horarioInicio,
            horarioFim,
            imagem: imagensFinais
        });

        // Exclui do Supabase as imagens que foram removidas.
        const imagensRemovidas = imagensOriginais.filter(
            (url) => !imagensFinais.includes(url)
        );

        for (const url of imagensRemovidas) {
            await excluirImagemSupabase(url);
        }

        alert("Evento atualizado com sucesso!");
        window.location.href = "eventos.html";

    } catch (error) {
        console.error(
            "Erro ao atualizar evento ou enviar imagem:",
            error
        );

        alert(
            error.message ||
            "Ocorreu um erro ao atualizar o evento."
        );

        setTimeout(() => {
            window.location.href = "eventos.html";
        }, 1500);
    }
});

// Exibe as imagens já salvas, cada uma com seu botão de remoção.
function mostrarMiniaturasAtuais() {
    previewAtual.innerHTML = "";

    imagensExistentes.forEach((url, indice) => {
        const container = document.createElement("div");
        container.className = "miniatura-container";

        const imagem = document.createElement("img");
        imagem.src = url;
        imagem.alt = `Imagem ${indice + 1} do evento`;
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

const caminho = `eventos/${nomeArquivo}`;

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

// Retorna os valores dos checkboxes marcados.
function obterCheckboxesSelecionados(nome) {
    return [
        ...document.querySelectorAll(
            `input[name="${nome}"]:checked`
        )
    ].map((checkbox) => checkbox.value);
}
