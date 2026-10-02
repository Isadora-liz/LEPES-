/* import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


export async function pedirPermissaoNotificacao() {

  if (!Device.isDevice) {
    console.log(
      'As notificações push precisam de um dispositivo físico.'
    );

    return false;
  }

  if (Platform.OS === 'android') {

    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',

      importance: Notifications.AndroidImportance.MAX,

      vibrationPattern: [0, 250, 250, 250],

      sound: 'default',

      lockscreenVisibility:
        Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }


  const { status: statusAtual } =
    await Notifications.getPermissionsAsync();

  console.log(
    'Permissão atual:',
    statusAtual
  );


  let statusFinal = statusAtual;


  if (statusAtual !== 'granted') {

    const { status } =
      await Notifications.requestPermissionsAsync();

    statusFinal = status;

    console.log(
      'Permissão após solicitação:',
      statusFinal
    );
  }


  if (statusFinal !== 'granted') {

    console.log(
      'Permissão para notificações negada.'
    );

    return false;
  }


  console.log(
    'Permissão para notificações concedida!'
  );

  return true;
}



export async function pegarTokenNotificacao() {

  try {

    if (!Device.isDevice) {

      console.log(
        'Push notifications precisam de dispositivo físico.'
      );

      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    console.log(
      'PROJECT ID:',
      projectId
    );

    if (!projectId) {

      console.log(
        'Project ID não encontrado.'
      );

      return null;
    }

    const resultado =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    console.log(
      'TOKEN COMPLETO:',
      resultado
    );

    console.log(
      'EXPO PUSH TOKEN:',
      resultado.data
    );

    return resultado.data;

  } catch (error) {

    console.log(
      'ERRO AO PEGAR TOKEN:',
      error
    );

    return null;
  }
}

export async function salvarTokenNotificacao(
  uid: string,
  token: string
) {

  try {

    await setDoc(
      doc(db, "usuarios", uid),
      {
        expoPushToken: token
      },
      {
        merge: true
      }
    );

    console.log(
      "Token salvo no Firebase!"
    );

    return true;

  } catch (error) {

    console.log(
      "ERRO AO SALVAR TOKEN:",
      error
    );

    return false;
  }
}

export function configurarCliqueNotificacao(
  callback: (data: any) => void
) {

  const subscription =
    Notifications.addNotificationResponseReceivedListener(
      response => {

        const data =
          response.notification.request.content.data;

        console.log(
          "Usuário clicou na notificação:",
          data
        );

        callback(data);
      }
    );


  return () => {
    subscription.remove();
  };
}

//console.log(
  //"configurarCliqueNotificacao:",
//  configurarCliqueNotificacao
//); */