import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let filtroSelecionado = null;

function semAcento(texto) {
    if (!texto) return "";

    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function debounce(fn, wait = 150) {

    let timeout;

    return function (...args) {

        clearTimeout(timeout);

        timeout = setTimeout(
            () => fn.apply(this, args),
            wait
        );
    };
}

function aplicaFiltro() {

    const filtros = document.getElementById("filtros-modalidades");

    document.getElementById("seta-dir")
        .addEventListener("click", () => {
            filtros.scrollLeft += 200;
        });

    document.getElementById("seta-esq")
        .addEventListener("click", () => {
            filtros.scrollLeft -= 200;
        });

    const termo = semAcento(
        document.getElementById("busca-container").value
    );

    const cards = document.querySelectorAll(".evento");

    cards.forEach(card => {

        const textoCard =
            semAcento(card.textContent || "");

        const modalidades =
            JSON.parse(
                card.dataset.modalidades || "[]"
            );

        const textoOk =
            termo === "" ||
            textoCard.includes(termo);

        const modalidadeOk =
            !filtroSelecionado ||
            modalidades.includes(
                Number(filtroSelecionado)
            );

        card.style.display =
            textoOk && modalidadeOk
                ? "flex"
                : "none";
    });
}

function configurarBusca() {

    document
        .getElementById("busca-container")
        .addEventListener(
            "input",
            debounce(aplicaFiltro)
        );
}

function configurarFiltros() {

    document
        .querySelectorAll(".bot-modalidade")
        .forEach(bot => {

            bot.addEventListener("click", () => {

                const id = bot.dataset.id;

                if (filtroSelecionado === id) {

                    filtroSelecionado = null;

                    bot.classList.remove(
                        "ativo"
                    );

                } else {

                    filtroSelecionado = id;

                    document
                        .querySelectorAll(".bot-modalidade")
                        .forEach(b =>
                            b.classList.remove("ativo")
                        );

                    bot.classList.add("ativo");
                }

                aplicaFiltro();
            });
        });
}

async function carregarEventos() {

    console.log("Função iniciou");

    const container = document.getElementById("lista-eventos");

    container.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "eventos"));

        const aviso = document.getElementById("sem-eventos");

        if (snapshot.empty) {
            aviso.style.display = "block";
        } else {
            aviso.style.display = "none";
        }

        console.log("Quantidade de documentos:", snapshot.size);

        snapshot.forEach(docSnap => {

            console.log("ID:", docSnap.id);
            console.log("Dados:", docSnap.data());

            const evento = docSnap.data();

            const div = document.createElement("div");

            div.classList.add("evento");

            div.dataset.id = docSnap.id;

            div.dataset.modalidades =
                JSON.stringify(
                    evento.modalidades_ids || []
                );

            div.innerHTML = `
<div class="imagem-evento">

    <img
        src="${evento.imagens?.[0] || ''}"
        alt="${evento.nome}"
    >

</div>

    <button class="botao-editar">
        <i class="material-icons">edit</i>
    </button>

    <button class="botao-remover">
        <i class="material-icons">delete</i>
    </button>


<div class="info">

    <span class="modalidade">
        ${(evento.modalidades || []).join(" • ")}
    </span>

    <h2>${evento.nome}</h2>

    <div class="detalhes">

        <span>
            <i class="material-icons">event</i>
            ${evento.data.toDate().toLocaleDateString("pt-BR")}
        </span>

        <span>
            <i class="material-icons">schedule</i>
            ${evento.data.toDate().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
})}
        </span>

    </div>

    <div class="endereco">
        <span>
            <i class="material-icons">location_on</i>
            ${evento.endereco || ""}
        </span>
    </div>

    <p class="descricao">
        ${evento.descricao || ""}
    </p>

</div>
`;

            container.appendChild(div);

            const botaoEditar =
                div.querySelector(".botao-editar");

            botaoEditar.addEventListener("click", () => {

                window.location.href = `editarEvento.html?id=${docSnap.id}`;


            });

            const botaoRemover =
                div.querySelector(".botao-remover");

            botaoRemover.addEventListener("click", async () => {

                const confirmar = confirm(
                    "Deseja realmente excluir este evento?"
                );

                if (!confirmar) return;

                try {

                    await deleteDoc(
                        doc(db, "eventos", docSnap.id)
                    );

                    div.remove();

                    alert("Evento removido com sucesso!");

                } catch (erro) {

                    console.error(erro);

                    alert(
                        "Erro ao remover o evento."
                    );

                }

            });

        });

        aplicaFiltro();

    } catch (erro) {

        console.error(
            "Erro ao carregar eventos:",
            erro
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarBusca();

        configurarFiltros();

        carregarEventos();

    }
);