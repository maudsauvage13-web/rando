import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Pressable, StatusBar } from 'react-native';
import { useApp, getHikePriceInfo } from '../../context/AppContext';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

export default function MonCompteScreen() {
  const { userPasses, transitPasses, favorites, hikes, plannedAdventures, resetOnboarding } = useApp();
  const router = useRouter();

  // Filtrer les pass possédés
  const activePasses = transitPasses.filter((pass) => userPasses.includes(pass.id));

  // Randonnées favorites
  const favoriteHikes = hikes.filter((hike) => favorites.includes(hike.id));

  // Calculs statistiques
  const completedHikesCount = plannedAdventures.length + 3; // +3 randonnées fictives passées
  const totalDistance = plannedAdventures.reduce((sum, trip) => {
    const hike = hikes.find((h) => h.id === trip.hikeId);
    return sum + (hike?.distance || 0);
  }, 0) + 38; // +38 km fictifs passés

  const totalCo2Saved = parseFloat((plannedAdventures.reduce((sum, trip) => {
    return sum + trip.co2Saved;
  }, 0) + 22.5).toFixed(1)); // +22.5 kg fictifs passés

  const treeEquivalent = Math.floor(totalCo2Saved / 2.5); // 1 arbre absorbe ~25kg/an, donc 2.5kg par mois

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
        
        {/* PROFILE CARD */}
        <View className="items-center mt-6 mb-6">
          <View className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-full items-center justify-center mb-4 relative shadow-sm shadow-slate-900/5">
            <SymbolView
              name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
              tintColor="#0f172a"
              size={88}
            />
          </View>
          <Text className="text-slate-900 text-2xl font-black tracking-tight">Thomas Martin</Text>
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-tight mt-1">Aventurier Éco-Responsable</Text>
        </View>

        {/* ECOLOGICAL STATS GRID */}
        <View className="bg-slate-50 border border-slate-200/80 rounded-[24px] p-5 mb-6 shadow-sm shadow-slate-900/5">
          <View className="flex-row items-center mb-4">
            <SymbolView name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }} tintColor="#10b981" size={18} style={{ marginRight: 6 }} />
            <Text className="text-slate-950 font-black text-base tracking-tight">Mon impact Carbone</Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 items-center bg-white p-3.5 rounded-[16px] border border-slate-200/60 shadow-sm shadow-slate-900/5 mr-2">
              <Text className="text-emerald-700 font-black text-xl">{totalCo2Saved} kg</Text>
              <Text className="text-slate-500 text-[9px] font-bold uppercase text-center mt-0.5">CO2 évité</Text>
            </View>
            
            <View className="flex-1 items-center bg-white p-3.5 rounded-[16px] border border-slate-200/60 shadow-sm shadow-slate-900/5 ml-2">
              <Text className="text-emerald-700 font-black text-xl">{treeEquivalent}</Text>
              <Text className="text-slate-500 text-[9px] font-bold uppercase text-center mt-0.5">Arbres équiv.</Text>
            </View>
          </View>

          <View className="flex-row justify-around border-t border-slate-200/60 pt-4">
            <View className="items-center">
              <Text className="text-slate-900 font-black text-sm">{completedHikesCount}</Text>
              <Text className="text-slate-500 text-[10px] font-bold uppercase">Randonnées</Text>
            </View>
            <View className="w-[1px] bg-slate-200 h-6" />
            <View className="items-center">
              <Text className="text-slate-900 font-black text-sm">{totalDistance} km</Text>
              <Text className="text-slate-500 text-[10px] font-bold uppercase">Distance</Text>
            </View>
          </View>
        </View>

        {/* MY PASSES SECTION */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Mes Abonnements</Text>
            <TouchableOpacity onPress={() => resetOnboarding()}>
              <Text className="text-orange-500 font-extrabold text-xs">Modifier</Text>
            </TouchableOpacity>
          </View>
          
          <View className="space-y-2">
            {activePasses.length > 0 ? (
              activePasses.map((pass) => (
                <View
                  key={pass.id}
                  className="bg-white border border-slate-200 rounded-[20px] p-4 flex-row justify-between items-center mb-2 shadow-sm shadow-slate-900/5"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-slate-900 font-extrabold text-sm">{pass.name}</Text>
                    <Text className="text-slate-500 text-[10px] font-bold uppercase mt-0.5">{pass.region}</Text>
                  </View>
                  <SymbolView
                    name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }}
                    tintColor="#f97316"
                    size={18}
                  />
                </View>
              ))
            ) : (
              <TouchableOpacity
                onPress={() => resetOnboarding()}
                className="bg-white border border-slate-200 border-dashed rounded-[20px] p-5 items-center justify-center"
              >
                <SymbolView
                  name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
                  tintColor="#94a3b8"
                  size={20}
                  style={{ marginBottom: 6 }}
                />
                <Text className="text-slate-700 font-bold text-xs text-center">Aucun abonnement configuré</Text>
                <Text className="text-slate-500 text-[10px] text-center mt-0.5 font-semibold">Cliquez pour ajouter vos pass et économiser</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* MY FAVORITES SECTION */}
        <View className="mb-12">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Mes Randonnées Favorites ({favoriteHikes.length})</Text>
          {favoriteHikes.length > 0 ? (
            favoriteHikes.map((hike) => {
              const priceInfo = getHikePriceInfo(hike, userPasses);
              return (
                <Pressable
                  key={hike.id}
                  onPress={() => router.push({ pathname: '/details' as any, params: { id: hike.id } })}
                  className="bg-white border border-slate-200 rounded-[20px] p-3 mb-3 flex-row items-center shadow-sm shadow-slate-900/5"
                >
                  <Image source={{ uri: hike.image }} className="w-12 h-12 rounded-[12px] mr-3" />
                  <View className="flex-1 pr-2">
                    <Text className="text-slate-900 font-extrabold text-sm" numberOfLines={1}>{hike.name}</Text>
                    <Text className="text-slate-500 text-xs font-semibold" numberOfLines={1}>{hike.location} • {hike.duration}</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`text-xs font-black ${priceInfo.isFree ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {priceInfo.displayText}
                    </Text>
                    <SymbolView
                      name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                      tintColor="#f97316"
                      size={14}
                      style={{ marginTop: 2 }}
                    />
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View className="bg-white border border-slate-200 rounded-[20px] p-5 items-center justify-center">
              <Text className="text-slate-400 text-xs text-center font-semibold">Vous n'avez pas encore de randonnées favorites.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
