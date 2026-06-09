import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

    const cards = document.querySelectorAll(".card");

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
                        .querySelectorAll(
                            ".bot-modalidade"
                        )
                        .forEach(b =>
                            b.classList.remove(
                                "ativo"
                            )
                        );

                    bot.classList.add(
                        "ativo"
                    );
                }

                

                aplicaFiltro();
            });
        });
}

async function carregarExplorar() {

    console.log("Função iniciou");


    const container = document.getElementById("cards-container");

    container.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db,"espaco"));

         console.log("Quantidade de documentos:", snapshot.size);

        snapshot.forEach(doc => {

             console.log("ID:", doc.id);
            console.log("Dados:", doc.data());

            const lugar = doc.data();

            const div =
                document.createElement("div");

            div.classList.add("card");

            div.dataset.id = doc.id;

            div.dataset.modalidades =
                JSON.stringify(
                    lugar.modalidades_ids || []
                );

            div.innerHTML = `
                 <button class="botao-editar">
        <span class="material-icons">edit</span>
    </button>

    <img
        src="${lugar.imagem}"
        alt="${lugar.nome}"
        class="card-image"
    >

    <div class="card-content">

        <h3 class="card-titulo">
            ${lugar.nome}
        </h3>

        <p class="card-endereco">
            ${lugar.endereco}
        </p>

        <p class="card-descricao">
            ${lugar.descricao}
        </p>

    </div>
`;
            container.appendChild(div);
        });

        aplicaFiltro();

    } catch (erro) {

        console.error(
            "Erro ao carregar espaços:",
            erro
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarBusca();

        configurarFiltros();

        carregarExplorar();
    }
);