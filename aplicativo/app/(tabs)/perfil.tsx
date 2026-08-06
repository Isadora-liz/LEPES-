import {
  collection,
  getDocs
} from 'firebase/firestore';

import {
  useEffect,
  useState
} from 'react';

import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";
import LocaisCard from '../../componentes/Locais';
import { db } from '../../FirebaseConfig';

export default function perfil() {  
    const [perfil, setperfil] = useState<any[]>([]);
}