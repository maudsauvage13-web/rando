import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Modal, StatusBar } from 'react-native';
import { useApp } from '../context/AppContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';

// Horaires de rechange (identiques à plan-transport.tsx pour la synchro)
const TRAIN_SCHEDULES: Record<string, { aller: string[]; retour: string[] }> = {
  'Fontainebleau': {
    aller: ['07:45 - 08:30 (Direct)', '08:45 - 09:30 (Direct)', '09:45 - 10:30 (1 correspond.)'],
    retour: ['16:15 - 17:00 (Direct)', '17:15 - 18:00 (Direct)', '18:15 - 19:00 (1 correspond.)']
  },
  'Vercors': {
    aller: ['08:00 - 09:35 (Bus incl.)', '09:15 - 10:50 (Bus incl.)', '10:30 - 12:05 (Bus incl.)'],
    retour: ['16:30 - 18:05 (Bus incl.)', '17:30 - 19:05 (Bus incl.)', '18:45 - 20:20 (Bus incl.)']
  },
  'Chartreuse': {
    aller: ['08:15 - 09:30 (Bus incl.)', '09:45 - 11:00 (Bus incl.)', '11:15 - 12:30 (Bus incl.)'],
    retour: ['16:00 - 17:15 (Bus incl.)', '17:30 - 18:45 (Bus incl.)', '19:00 - 20:15 (Bus incl.)']
  },
  'Lac d\'Annecy': {
    aller: ['07:50 - 09:10 (Bus incl.)', '09:00 - 10:20 (Bus incl.)', '10:45 - 12:05 (Bus incl.)'],
    retour: ['16:15 - 17:35 (Bus incl.)', '17:45 - 19:05 (Bus incl.)', '19:15 - 20:35 (Bus incl.)']
  },
  'Chamonix': {
    aller: ['07:10 - 09:25 (Train + Exp)', '08:40 - 10:55 (Train + Exp)', '10:10 - 12:25 (Train + Exp)'],
    retour: ['15:45 - 18:00 (Train + Exp)', '17:15 - 19:30 (Train + Exp)', '18:45 - 21:00 (Train + Exp)']
  }
};

export default function RecapScreen() {
  const params = useLocalSearchParams();
  const { hikes, addAdventure } = useApp();
  const router = useRouter();

  const hike = hikes.find((h) => h.id === params.hikeId) || hikes[0];

  // États locaux modifiables
  const [departureStation, setDepartureStation] = useState((params.departureStation as string) || hike.departureStation);
  const [allerTime, setAllerTime] = useState((params.allerTime as string) || '');
  const [retourTime, setRetourTime] = useState((params.retourTime as string) || '');
  const [price, setPrice] = useState(parseFloat((params.pricePaid as string) || '0'));
  
  // Modals d'édition rapide d'horaires
  const [showAllerModal, setShowAllerModal] = useState(false);
  const [showRetourModal, setShowRetourModal] = useState(false);
  const [showBuySuccessModal, setShowBuySuccessModal] = useState(false);

  const scheduleKey = hike.location.includes('Fontainebleau') ? 'Fontainebleau' : hike.location.includes('Vercors') ? 'Vercors' : hike.location.includes('Chartreuse') ? 'Chartreuse' : hike.location.includes('Annecy') ? 'Lac d\'Annecy' : 'Chamonix';
  const schedules = TRAIN_SCHEDULES[scheduleKey] || TRAIN_SCHEDULES['Fontainebleau'];

  // Extraction d'heures pour la timeline
  const getAllerTimes = () => {
    const parts = allerTime.split(' - ');
    return { dep: parts[0] || '08:45', arr: (parts[1] || '09:30').split(' (')[0] };
  };

  const getRetourTimes = () => {
    const parts = retourTime.split(' - ');
    return { dep: parts[0] || '17:15', arr: (parts[1] || '18:00').split(' (')[0] };
  };

  const timesAller = getAllerTimes();
  const timesRetour = getRetourTimes();

  // Enregistrer le voyage
  const handleSaveAdventure = (status: 'Prêt au départ' | 'En attente billet') => {
    addAdventure({
      hikeId: hike.id,
      hikeName: hike.name,
      date: params.dateLabel as string,
      departureStation,
      departureTime: timesAller.dep,
      arrivalTime: timesAller.arr,
      returnDepartureTime: timesRetour.dep,
      returnArrivalTime: timesRetour.arr,
      pricePaid: price,
      co2Saved: hike.co2Saved,
      status: status
    });
    router.replace('/(tabs)/mes-aventures' as any);
  };

  const handleBuyTickets = () => {
    setShowBuySuccessModal(true);
  };

  const handleConfirmBuy = () => {
    setShowBuySuccessModal(false);
    handleSaveAdventure('Prêt au départ');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3 border border-slate-200/40"
        >
          <SymbolView
            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
            tintColor="#0f172a"
            size={18}
          />
        </TouchableOpacity>
        <View>
          <Text className="text-slate-900 text-lg font-black tracking-tight">Récapitulatif du voyage</Text>
          <Text className="text-slate-500 text-xs font-semibold">{params.dateLabel}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {/* Résumé carte */}
        <View className="bg-slate-50 border border-slate-200 rounded-[24px] p-5 mb-6 shadow-sm shadow-slate-900/5">
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Votre Aventure</Text>
          <Text className="text-slate-900 font-black text-2xl mb-1 tracking-tight">{hike.name}</Text>
          <Text className="text-slate-500 text-sm font-semibold">{hike.location} • {hike.distance} km • +{hike.elevation}m</Text>
          
          <View className="flex-row items-center justify-between border-t border-slate-200/60 pt-4 mt-4">
            <View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase">Prix Total Estimé</Text>
              <Text className="text-emerald-700 font-black text-lg">{price === 0 ? 'Gratuit' : `${price.toFixed(2)}€`}</Text>
            </View>
            <View className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl flex-row items-center">
              <Text className="text-emerald-700 font-extrabold text-xs">🌳 -{hike.co2Saved}kg CO2 évité</Text>
            </View>
          </View>
        </View>

        {/* TIMELINE VERTICALE */}
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4 px-2">Timeline de la journée</Text>
        
        <View className="pl-6 relative mb-8">
          {/* Ligne verticale de la timeline */}
          <View className="absolute left-[7px] top-[14px] bottom-[14px] w-[2px] bg-slate-200" />

          {/* Étape 1 : Départ Train */}
          <View className="relative mb-6">
            {/* Rond timeline */}
            <View className="absolute -left-[24px] top-1.5 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white z-10 shadow-sm" />
            <View className="bg-white border border-slate-200 p-4 rounded-[20px] shadow-sm shadow-slate-900/5">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-orange-600 font-black text-xs uppercase">🚊 Train Aller</Text>
                  <Text className="text-slate-900 font-extrabold text-sm mt-1">Départ : {departureStation}</Text>
                  <Text className="text-slate-500 text-xs font-medium mt-0.5">Arrivée : {hike.nearbyStation.split(' (')[0]}</Text>
                </View>
                <Text className="text-slate-900 font-black text-sm">{timesAller.dep}</Text>
              </View>
              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-100">
                <Text className="text-slate-400 text-xs font-bold">Arrivée à {timesAller.arr}</Text>
                <TouchableOpacity
                  onPress={() => setShowAllerModal(true)}
                  className="px-2.5 py-1 bg-slate-50 rounded-lg flex-row items-center border border-slate-200"
                >
                  <Text className="text-slate-800 text-[10px] font-extrabold uppercase mr-1">Modifier</Text>
                  <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} tintColor="#0f172a" size={10} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Étape 2 : Randonnée */}
          <View className="relative mb-6">
            <View className="absolute -left-[24px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white z-10 shadow-sm" />
            <View className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-[20px] shadow-sm shadow-slate-900/5">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-emerald-700 font-black text-xs uppercase">🥾 Début Randonnée</Text>
                  <Text className="text-slate-900 font-extrabold text-sm mt-1">{hike.name}</Text>
                  <Text className="text-slate-500 text-xs font-medium mt-0.5">Boucle de {hike.distance}km (+{hike.elevation}m)</Text>
                </View>
                <Text className="text-slate-900 font-black text-sm">{timesAller.arr}</Text>
              </View>
              <Text className="text-slate-500 text-xs font-bold mt-3 pt-3 border-t border-emerald-100">
                Durée de marche estimée : {hike.duration}
              </Text>
            </View>
          </View>

          {/* Étape 3 : Retour Train */}
          <View className="relative">
            <View className="absolute -left-[24px] top-1.5 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white z-10 shadow-sm" />
            <View className="bg-white border border-slate-200 p-4 rounded-[20px] shadow-sm shadow-slate-900/5">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-orange-600 font-black text-xs uppercase">🚊 Train Retour</Text>
                  <Text className="text-slate-900 font-extrabold text-sm mt-1">Départ : {hike.nearbyStation.split(' (')[0]}</Text>
                  <Text className="text-slate-500 text-xs font-medium mt-0.5">Vers {departureStation}</Text>
                </View>
                <Text className="text-slate-900 font-black text-sm">{timesRetour.dep}</Text>
              </View>
              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-100">
                <Text className="text-slate-400 text-xs font-bold">Arrivée à {timesRetour.arr}</Text>
                <TouchableOpacity
                  onPress={() => setShowRetourModal(true)}
                  className="px-2.5 py-1 bg-slate-50 rounded-lg flex-row items-center border border-slate-200"
                >
                  <Text className="text-slate-800 text-[10px] font-extrabold uppercase mr-1">Modifier</Text>
                  <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} tintColor="#0f172a" size={10} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* DOUBLE CTAS EN BAS */}
      <View className="p-5 border-t border-slate-100 bg-white space-y-3">
        <TouchableOpacity
          onPress={handleBuyTickets}
          className="w-full py-4.5 bg-slate-900 rounded-[20px] items-center justify-center flex-row shadow-sm"
        >
          <SymbolView
            name={{ ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' }}
            tintColor="#ffffff"
            size={18}
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-extrabold text-base">Acheter sur SNCF Connect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSaveAdventure('En attente billet')}
          className="w-full py-3.5 bg-slate-100 rounded-[20px] items-center justify-center border border-slate-200"
        >
          <Text className="text-slate-800 font-bold text-sm">Enregistrer pour plus tard</Text>
        </TouchableOpacity>
      </View>

      {/* 4. MODALS POUR CHOIX D'HORAIRES ALLER/RETOUR */}
      {/* Modal Aller */}
      <Modal visible={showAllerModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-slate-900/60">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-slate-200 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-900 font-black text-base tracking-tight">Modifier l'horaire Aller</Text>
              <TouchableOpacity onPress={() => setShowAllerModal(false)} className="p-1">
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor="#0f172a" size={18} />
              </TouchableOpacity>
            </View>
            {schedules.aller.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => { setAllerTime(time); setShowAllerModal(false); }}
                className={`p-4 rounded-[20px] border mb-2.5 flex-row justify-between items-center ${
                  allerTime === time ? 'bg-orange-50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/60'
                }`}
              >
                <Text className="text-slate-900 text-sm font-bold">{time}</Text>
                {allerTime === time && (
                  <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} tintColor="#f97316" size={16} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal Retour */}
      <Modal visible={showRetourModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-slate-900/60">
          <View className="bg-white rounded-t-[32px] p-6 border-t border-slate-200 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-900 font-black text-base tracking-tight">Modifier l'horaire Retour</Text>
              <TouchableOpacity onPress={() => setShowRetourModal(false)} className="p-1">
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor="#0f172a" size={18} />
              </TouchableOpacity>
            </View>
            {schedules.retour.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => { setRetourTime(time); setShowRetourModal(false); }}
                className={`p-4 rounded-[20px] border mb-2.5 flex-row justify-between items-center ${
                  retourTime === time ? 'bg-orange-50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/60'
                }`}
              >
                <Text className="text-slate-900 text-sm font-bold">{time}</Text>
                {retourTime === time && (
                  <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} tintColor="#f97316" size={16} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal SNCF Connect Success Mock */}
      <Modal visible={showBuySuccessModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-slate-900/50 px-6">
          <View className="bg-white border border-slate-200 p-6 rounded-[32px] w-full items-center shadow-lg">
            <View className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full items-center justify-center mb-4">
              <SymbolView name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} tintColor="#10b981" size={34} />
            </View>
            <Text className="text-slate-900 font-black text-xl text-center mb-2 tracking-tight">Redirection SNCF Connect</Text>
            <Text className="text-slate-500 text-sm text-center mb-6 font-semibold">
              Vos pass de transport ont été appliqués automatiquement ! Trajet réservé avec succès et synchronisé avec Névé.
            </Text>
            
            <TouchableOpacity
              onPress={handleConfirmBuy}
              className="w-full py-4 bg-slate-900 rounded-[16px] items-center"
            >
              <Text className="text-white font-extrabold">Super, merci !</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
