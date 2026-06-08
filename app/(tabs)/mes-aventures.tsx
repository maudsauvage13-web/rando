import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Pressable, StatusBar } from 'react-native';
import { useApp, PlannedTrip } from '../../context/AppContext';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

export default function MesAventuresScreen() {
  const { plannedAdventures, hikes } = useApp();
  const router = useRouter();
  
  const [activeSubTab, setActiveSubTab] = useState<'upcoming' | 'past'>('upcoming');

  // Filtrer les aventures
  const upcomingAdventures = plannedAdventures.filter((adv) => adv.status !== 'Terminée');
  const pastAdventures = plannedAdventures.filter((adv) => adv.status === 'Terminée');

  const currentList = activeSubTab === 'upcoming' ? upcomingAdventures : pastAdventures;

  const handleCardPress = (trip: PlannedTrip) => {
    // Naviguer vers recap en passant les données en paramètres
    router.push({
      pathname: '/recap' as any,
      params: {
        hikeId: trip.hikeId,
        dateLabel: trip.date,
        departureStation: trip.departureStation,
        allerTime: `${trip.departureTime} - ${trip.arrivalTime}`,
        retourTime: `${trip.returnDepartureTime} - ${trip.returnArrivalTime}`,
        pricePaid: trip.pricePaid.toString(),
        co2Saved: trip.co2Saved.toString(),
        isSaved: 'true'
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Title */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-slate-900 text-3xl font-black tracking-tight">Mes Aventures</Text>
        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-tight mt-1">Vos randonnées planifiées en transports</Text>
      </View>

      {/* Sub-tabs switch */}
      <View className="flex-row mx-5 bg-slate-100 p-1 rounded-[16px] border border-slate-200/50 mb-5">
        <TouchableOpacity
          onPress={() => setActiveSubTab('upcoming')}
          className={`flex-1 py-3 rounded-xl items-center ${
            activeSubTab === 'upcoming' ? 'bg-slate-900 shadow-sm' : 'bg-transparent'
          }`}
        >
          <Text className={`font-bold text-sm ${activeSubTab === 'upcoming' ? 'text-white' : 'text-slate-500'}`}>
            À venir ({upcomingAdventures.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveSubTab('past')}
          className={`flex-1 py-3 rounded-xl items-center ${
            activeSubTab === 'past' ? 'bg-slate-900 shadow-sm' : 'bg-transparent'
          }`}
        >
          <Text className={`font-bold text-sm ${activeSubTab === 'past' ? 'text-white' : 'text-slate-500'}`}>
            Passées ({pastAdventures.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        className="flex-1"
      >
        {currentList.length > 0 ? (
          currentList.map((trip) => {
            const hike = hikes.find((h) => h.id === trip.hikeId);
            
            return (
              <Pressable
                key={trip.id}
                onPress={() => handleCardPress(trip)}
                className="bg-white border border-slate-200 rounded-[24px] p-5 mb-4 shadow-sm shadow-slate-900/5"
              >
                {/* Date and Status Row */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <SymbolView
                      name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
                      tintColor="#f97316"
                      size={14}
                      style={{ marginRight: 6 }}
                    />
                    <Text className="text-orange-600 font-extrabold text-xs">{trip.date}</Text>
                  </View>
                  
                  {/* Status Badge */}
                  <View
                    className={`px-3 py-1 rounded-full border flex-row items-center ${
                      trip.status === 'Prêt au départ'
                        ? 'bg-emerald-50 border-emerald-200/60'
                        : 'bg-amber-50 border-amber-200/60'
                    }`}
                  >
                    <SymbolView
                      name={
                        trip.status === 'Prêt au départ'
                          ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }
                          : { ios: 'clock.fill', android: 'schedule', web: 'schedule' }
                      }
                      tintColor={trip.status === 'Prêt au départ' ? '#10b981' : '#d97706'}
                      size={10}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      className={`text-[9px] font-black uppercase ${
                        trip.status === 'Prêt au départ' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {trip.status}
                    </Text>
                  </View>
                </View>

                {/* Hike Title */}
                <Text className="text-slate-900 font-black text-xl mb-1 tracking-tight">{trip.hikeName}</Text>
                <Text className="text-slate-500 text-xs font-semibold mb-4">{hike?.location || 'Massif'}</Text>

                {/* Stations Timeline preview */}
                <View className="bg-slate-50 p-3.5 rounded-[16px] border border-slate-200/60 mb-3 space-y-2">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Text className="text-slate-400 text-xs w-12 font-bold">{trip.departureTime}</Text>
                      <Text className="text-slate-800 text-xs font-bold">{trip.departureStation}</Text>
                    </View>
                    <Text className="text-[10px] text-slate-400 font-bold uppercase">🚊 Aller</Text>
                  </View>
                  
                  <View className="h-[1px] bg-slate-200/60" />
                  
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Text className="text-slate-400 text-xs w-12 font-bold">{trip.returnDepartureTime}</Text>
                      <Text className="text-slate-800 text-xs font-bold">{hike?.nearbyStation.split(' (')[0]}</Text>
                    </View>
                    <Text className="text-[10px] text-slate-400 font-bold uppercase">🚊 Retour</Text>
                  </View>
                </View>

                {/* Co2 & Price metrics */}
                <View className="flex-row justify-between items-center border-t border-slate-100 pt-3">
                  <Text className="text-slate-500 text-[10px] font-bold uppercase">
                    Tarif : <Text className="text-emerald-700 font-black normal-case">{trip.pricePaid === 0 ? 'Gratuit' : `${trip.pricePaid.toFixed(2)}€`}</Text>
                  </Text>
                  <Text className="text-orange-600 text-[10px] font-black uppercase">
                    🌳 -{trip.co2Saved}kg CO2 économisés
                  </Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          // Empty State
          <View className="items-center justify-center py-20 px-6">
            <View className="w-20 h-20 bg-slate-50 border border-slate-200/80 rounded-full items-center justify-center mb-6 shadow-sm shadow-slate-900/5">
              <SymbolView
                name={{ ios: 'mountain.2.fill', android: 'terrain', web: 'terrain' }}
                tintColor="#64748b"
                size={36}
              />
            </View>
            <Text className="text-slate-900 font-black text-lg text-center mb-2 tracking-tight">
              {activeSubTab === 'upcoming' ? 'Aucune aventure planifiée' : 'Aucun trajet passé'}
            </Text>
            <Text className="text-slate-500 text-sm font-semibold text-center mb-8 px-4 leading-5">
              {activeSubTab === 'upcoming'
                ? 'Choisissez une randonnée sur la carte, configurez vos trains et lancez-vous sans voiture !'
                : 'Vos randonnées terminées apparaîtront ici pour garder un historique de vos économies de carbone.'}
            </Text>
            
            {activeSubTab === 'upcoming' && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)' as any)}
                className="bg-slate-900 px-6 py-4 rounded-[16px] shadow-sm"
              >
                <Text className="text-white font-extrabold text-sm">Découvrir les randonnées</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
