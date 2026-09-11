import { app, db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";


const storage = getStorage(app);

document.addEventListener("DOMContentLoaded", () => {


    const form = document.getElementById("form-evento");

    /*const inputImagens = document.getElementById("imagens");*/



    if (!form) {
        console.error("Formulário não encontrado");
        return;
    }



    form.addEventListener("submit", async (e) => {


        e.preventDefault();


        try {

            const nome = document.getElementById("nome").value.trim();
            const endereco = document.getElementById("endereco").value.trim();
            const descricao = document.getElementById("descricao").value.trim();
            const dataInicio = document.getElementById("dataInicio").value;
            const dataFim = document.getElementById("dataFim").value;
            const horarioInicio = document.getElementById("horarioInicio").value;
            const horarioFim = document.getElementById("horarioFim").value;
            /*const imagens = inputImagens.files;*/
            const modalidades = obterCheckboxesSelecionados("modalidades[]");
            const acessibilidade = obterCheckboxesSelecionados("acessibilidade[]");


            if (
                !nome ||
                !endereco ||
                !dataInicio ||
                !dataFim ||
                !horarioInicio ||
                !horarioFim ||
                modalidades.length === 0
            ) {


                mostrarMensagem(
                    "Preencha todos os campos obrigatórios!",
                    "red"
                );


                return;

            }


            const inicio = Timestamp.fromDate(
                new Date(`${dataInicio}T00:00:00`)
            );

            const fim = Timestamp.fromDate(
                new Date(`${dataFim}T00:00:00`)
            );


            /*const urlsImagens = await enviarImagens(imagens);



            console.log("URLs das imagens:", urlsImagens);*/


            console.log("Antes do addDoc");


            await addDoc(collection(db, "eventos"), {


                nome,

                endereco,

                descricao,

                modalidades,

                acessibilidade,


                dataInicio: inicio,

                dataFim: fim,

                horarioInicio,

                horarioFim,

                /*imagens: urlsImagens,*/


                criadoEm: serverTimestamp()


            });



            console.log("Evento salvo!");



            mostrarMensagem(
                "Evento adicionado com sucesso!",
                "green"
            );



            form.reset();



            /*const mensagemImagem = document.getElementById("mensagem-imagem");


            if (mensagemImagem) {

                mensagemImagem.style.display = "none";

            }*/



        } catch(error) {


            console.error(
                "Erro ao cadastrar evento:",
                error
            );


            mostrarMensagem(
                error.message,
                "red"
            );


        }


    });


    /*if(inputImagens){


        inputImagens.addEventListener(
            "change",
            function(){


                const quantidade = this.files.length;


                const mensagemImagem =
                document.getElementById("mensagem-imagem");



                if(!mensagemImagem) return;



                mensagemImagem.style.display = "block";



                if(quantidade === 1){

                    mensagemImagem.innerHTML =
                    "✅ 1 imagem adicionada com sucesso!";

                } else {


                    mensagemImagem.innerHTML =
                    `✅ ${quantidade} imagens adicionadas com sucesso!`;

                }


            }
        );

    }*/



});

function obterCheckboxesSelecionados(nome){


    return [
        ...document.querySelectorAll(
            `input[name="${nome}"]:checked`
        )
    ]
    .map(checkbox => checkbox.value);


}

/*async function enviarImagens(imagens){


    const urls = [];



    if(!imagens || imagens.length === 0){

        return urls;

    }



    for(const imagem of imagens){


        console.log(
            "Enviando imagem:",
            imagem.name
        );



        const caminho = ref(
            storage,
            `eventos/${Date.now()}-${imagem.name}`
        );



        await uploadBytes(
            caminho,
            imagem
        );



        const url = await getDownloadURL(
            caminho
        );



        urls.push(url);


    }



    return urls;


}*/


function mostrarMensagem(texto, cor){

    const mensagem = document.getElementById("mensagem-sucesso");

    if(!mensagem) return;

    mensagem.textContent = texto;
    mensagem.style.color = cor;
    mensagem.style.display = "block";
}