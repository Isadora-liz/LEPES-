const {setGlobalOptions} = require("firebase-functions");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {onDocumentDeleted} = require("firebase-functions/v2/firestore");

initializeApp();

const db = getFirestore();

setGlobalOptions({
  maxInstances: 10,
});

/**
 * Envia uma notificação através do Expo Push Service.
 *
 * @param {string} token Token do Expo.
 * @param {string} titulo Título da notificação.
 * @param {string} corpo Texto da notificação.
 * @param {object} data Dados enviados junto com a notificação.
 */
async function enviarNotificacao(token, titulo, corpo, data) {
  try {
    const resposta = await fetch(
        "https://exp.host/--/api/v2/push/send",
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: token,
            sound: "default",
            title: titulo,
            body: corpo,
            data: data,
          }),
        },
    );

    const resultado = await resposta.json();

    console.log("Resposta do Expo:", resultado);
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
  }
}

/**
 * Envia uma notificação quando um evento é excluído.
 */
exports.notificarEventoCancelado = onDocumentDeleted(
    "eventos/{eventoId}",
    async (event) => {
      const snapshot = event.data;

      if (!snapshot) {
        console.log(
            "Não foi possível encontrar os dados do evento.",
        );
        return;
      }

      const dadosEvento = snapshot.data();
      const eventoId = event.params.eventoId;

      console.log("Evento excluído:", eventoId);
      console.log("Nome:", dadosEvento.nome);

      const usuariosSnapshot = await db
          .collection("usuarios")
          .where(
              "interesses.notificacaoAtiva",
              "array-contains",
              eventoId,
          )
          .get();

      console.log(
          "Usuários que ativaram a notificação:",
          usuariosSnapshot.size,
      );

      for (const doc of usuariosSnapshot.docs) {
        const usuario = doc.data();
        const token = usuario.expoPushToken;

        if (!token) {
          console.log("Usuário sem token:", doc.id);
          continue;
        }

        await enviarNotificacao(
            token,
            "⚠️ Evento cancelado",
            `O evento ${dadosEvento.nome} foi cancelado. ',
            'Confira os detalhes no LEPES.`,
            {
              tipo: "evento_cancelado",
              eventoId: eventoId,
            },
        );
      }
    },
);
