import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useApp, getHikePriceInfo } from '../context/AppContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';

// Horaires de train fictifs réalistes selon les massifs
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

export default function PlanTransportScreen() {
  const { hikeId, dateLabel } = useLocalSearchParams();
  const { hikes, userPasses } = useApp();
  const router = useRouter();

  const hike = hikes.find((h) => h.id === hikeId) || hikes[0];
  const priceInfo = getHikePriceInfo(hike, userPasses);

  // Étapes pliables
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Étape 1 : Dates & Durée
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [durationDays, setDurationDays] = useState(1);

  // Étape 2 : Gare de départ
  const [selectedStation, setSelectedStation] = useState(hike.departureStation);
  const stationOptions = hike.departureStation.includes('Paris')
    ? ['Paris Gare de Lyon', 'Paris Montparnasse', 'Paris Gare du Nord']
    : hike.departureStation.includes('Grenoble')
    ? ['Grenoble Gare', 'Grenoble Universités']
    : [hike.departureStation, 'Autre gare à proximité'];

  // Étape 3 : Sélection des horaires
  const scheduleData = TRAIN_SCHEDULES[hike.location.includes('Fontainebleau') ? 'Fontainebleau' : hike.location.includes('Vercors') ? 'Vercors' : hike.location.includes('Chartreuse') ? 'Chartreuse' : hike.location.includes('Annecy') ? 'Lac d\'Annecy' : 'Chamonix'] || TRAIN_SCHEDULES['Fontainebleau'];

  const [selectedAller, setSelectedAller] = useState(scheduleData.aller[0]);
  const [selectedRetour, setSelectedRetour] = useState(scheduleData.retour[0]);

  const handleNextStep = () => {
    if (activeStep < 3) {
      setActiveStep((prev) => (prev + 1) as any);
    } else {
      // Aller sur le récapitulatif
      router.push({
        pathname: '/recap' as any,
        params: {
          hikeId: hike.id,
          dateLabel,
          departureStation: selectedStation,
          allerTime: selectedAller,
          retourTime: selectedRetour,
          pricePaid: priceInfo.price,
          co2Saved: hike.co2Saved,
          isMultiDay: isMultiDay ? 'true' : 'false',
          durationDays: durationDays.toString()
        }
      });
    }
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
          <Text className="text-slate-900 text-lg font-black tracking-tight">Planifier le transport</Text>
          <Text className="text-slate-500 text-xs font-semibold">{hike.name}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-5 space-y-4" showsVerticalScrollIndicator={false}>
        
        {/* ÉTAPE 1 : DATES & DURÉE */}
        <View className="bg-slate-50 border border-slate-200/60 rounded-[24px] overflow-hidden mb-4 shadow-sm shadow-slate-900/5">
          <TouchableOpacity
            onPress={() => setActiveStep(1)}
            className="p-5 flex-row justify-between items-center bg-slate-50"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-900 items-center justify-center mr-3">
                <Text className="text-white font-black text-sm">1</Text>
              </View>
              <View>
                <Text className="text-slate-900 font-extrabold text-base tracking-tight">Dates & Durée du trajet</Text>
                <Text className="text-slate-500 text-xs font-semibold">
                  {isMultiDay ? `Randonnée longue (${durationDays} jours)` : 'Aller-retour sur la journée'}
                </Text>
              </View>
            </View>
            <SymbolView
              name={{
                ios: activeStep === 1 ? 'chevron.up' : 'chevron.down',
                android: activeStep === 1 ? 'expand_less' : 'expand_more',
                web: activeStep === 1 ? 'expand_less' : 'expand_more'
              }}
              tintColor="#0f172a"
              size={18}
            />
          </TouchableOpacity>

          {activeStep === 1 && (
            <View className="p-5 border-t border-slate-200/60 bg-white space-y-4">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Type d'aventure</Text>
              
              <View className="flex-row mb-4">
                <TouchableOpacity
                  onPress={() => { setIsMultiDay(false); setDurationDays(1); }}
                  className={`flex-1 p-4.5 rounded-[20px] border items-center mr-2.5 ${
                    !isMultiDay ? 'bg-orange-50/50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <SymbolView name={{ ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' }} tintColor={!isMultiDay ? '#f97316' : '#64748b'} size={22} />
                  <Text className="text-slate-900 font-extrabold text-sm mt-2">Journée</Text>
                  <Text className="text-slate-500 text-[10px] font-bold mt-1 text-center">Aller-retour le même jour</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { setIsMultiDay(true); setDurationDays(2); }}
                  className={`flex-1 p-4.5 rounded-[20px] border items-center ${
                    isMultiDay ? 'bg-orange-50/50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <SymbolView name={{ ios: 'moon.stars.fill', android: 'nights_stay', web: 'nights_stay' }} tintColor={isMultiDay ? '#f97316' : '#64748b'} size={22} />
                  <Text className="text-slate-900 font-extrabold text-sm mt-2">Plusieurs jours</Text>
                  <Text className="text-slate-500 text-[10px] font-bold mt-1 text-center">Bivouac ou nuit en refuge</Text>
                </TouchableOpacity>
              </View>

              {isMultiDay && (
                <View className="bg-slate-50 p-4 rounded-[20px] border border-slate-200/60">
                  <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Nombre de jours sur place</Text>
                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                      onPress={() => setDurationDays((d) => Math.max(2, d - 1))}
                      className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm"
                    >
                      <Text className="text-slate-800 font-extrabold text-lg">-</Text>
                    </TouchableOpacity>
                    <Text className="text-slate-900 font-black text-lg">{durationDays} Jours</Text>
                    <TouchableOpacity
                      onPress={() => setDurationDays((d) => Math.min(5, d + 1))}
                      className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm"
                    >
                      <Text className="text-slate-800 font-extrabold text-lg">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleNextStep}
                className="w-full py-4 bg-slate-900 rounded-[16px] items-center mt-2 shadow-sm"
              >
                <Text className="text-white font-extrabold text-sm">Continuer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ÉTAPE 2 : GARE DE DÉPART */}
        <View className="bg-slate-50 border border-slate-200/60 rounded-[24px] overflow-hidden mb-4 shadow-sm shadow-slate-900/5">
          <TouchableOpacity
            onPress={() => setActiveStep(2)}
            disabled={activeStep < 2}
            className="p-5 flex-row justify-between items-center bg-slate-50"
            style={{ opacity: activeStep < 2 ? 0.6 : 1 }}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-900 items-center justify-center mr-3">
                <Text className="text-white font-black text-sm">2</Text>
              </View>
              <View>
                <Text className="text-slate-900 font-extrabold text-base tracking-tight">Gare & Station de départ</Text>
                <Text className="text-slate-500 text-xs font-semibold">{selectedStation}</Text>
              </View>
            </View>
            {activeStep >= 2 && (
              <SymbolView
                name={{
                  ios: activeStep === 2 ? 'chevron.up' : 'chevron.down',
                  android: activeStep === 2 ? 'expand_less' : 'expand_more',
                  web: activeStep === 2 ? 'expand_less' : 'expand_more'
                }}
                tintColor="#0f172a"
                size={18}
              />
            )}
          </TouchableOpacity>

          {activeStep === 2 && (
            <View className="p-5 border-t border-slate-200/60 bg-white space-y-4">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Choisir votre gare de départ</Text>
              
              <View className="space-y-3">
                {stationOptions.map((station) => (
                  <TouchableOpacity
                    key={station}
                    onPress={() => setSelectedStation(station)}
                    className={`p-4 rounded-[20px] border flex-row justify-between items-center mb-2 ${
                      selectedStation === station ? 'bg-orange-50/50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/60'
                    }`}
                  >
                    <Text className="text-slate-900 font-extrabold text-sm">{station}</Text>
                    {selectedStation === station && (
                      <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} tintColor="#f97316" size={18} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleNextStep}
                className="w-full py-4 bg-slate-900 rounded-[16px] items-center mt-2 shadow-sm"
              >
                <Text className="text-white font-extrabold text-sm">Continuer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ÉTAPE 3 : HORAIRES DES TRAINS & TARIFS */}
        <View className="bg-slate-50 border border-slate-200/60 rounded-[24px] overflow-hidden mb-8 shadow-sm shadow-slate-900/5">
          <TouchableOpacity
            onPress={() => setActiveStep(3)}
            disabled={activeStep < 3}
            className="p-5 flex-row justify-between items-center bg-slate-50"
            style={{ opacity: activeStep < 3 ? 0.6 : 1 }}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-900 items-center justify-center mr-3">
                <Text className="text-white font-black text-sm">3</Text>
              </View>
              <View>
                <Text className="text-slate-900 font-extrabold text-base tracking-tight">Sélection des horaires</Text>
                <Text className="text-slate-500 text-xs font-semibold">
                  A: {selectedAller.split(' (')[0]} • R: {selectedRetour.split(' (')[0]}
                </Text>
              </View>
            </View>
            {activeStep >= 3 && (
              <SymbolView
                name={{
                  ios: activeStep === 3 ? 'chevron.up' : 'chevron.down',
                  android: activeStep === 3 ? 'expand_less' : 'expand_more',
                  web: activeStep === 3 ? 'expand_less' : 'expand_more'
                }}
                tintColor="#0f172a"
                size={18}
              />
            )}
          </TouchableOpacity>

          {activeStep === 3 && (
            <View className="p-5 border-t border-slate-200/60 bg-white space-y-4">
              {/* Aller */}
              <View className="mb-4">
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">TRAJET ALLER ({dateLabel})</Text>
                {scheduleData.aller.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSelectedAller(t)}
                    className={`p-3.5 rounded-[16px] border flex-row justify-between items-center mb-2.5 ${
                      selectedAller === t ? 'bg-orange-50/50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/50'
                    }`}
                  >
                    <View>
                      <Text className="text-slate-900 font-extrabold text-sm">{t}</Text>
                      <Text className="text-slate-500 text-[10px] font-bold mt-0.5">Depuis {selectedStation}</Text>
                    </View>
                    <Text className={`text-xs font-black ${priceInfo.isFree ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {priceInfo.isFree ? 'Gratuit' : `${(priceInfo.price / 2).toFixed(2)}€`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Retour */}
              <View className="mb-4">
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  TRAJET RETOUR ({isMultiDay ? `+ ${durationDays - 1} jours` : dateLabel})
                </Text>
                {scheduleData.retour.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSelectedRetour(t)}
                    className={`p-3.5 rounded-[16px] border flex-row justify-between items-center mb-2.5 ${
                      selectedRetour === t ? 'bg-orange-50/50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/50'
                    }`}
                  >
                    <View>
                      <Text className="text-slate-900 font-extrabold text-sm">{t}</Text>
                      <Text className="text-slate-500 text-[10px] font-bold mt-0.5">Vers {selectedStation}</Text>
                    </View>
                    <Text className={`text-xs font-black ${priceInfo.isFree ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {priceInfo.isFree ? 'Gratuit' : `${(priceInfo.price / 2).toFixed(2)}€`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleNextStep}
                className="w-full py-4.5 bg-slate-900 rounded-[20px] items-center mt-2 shadow-sm"
              >
                <Text className="text-white font-extrabold text-base">Voir le récapitulatif</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
