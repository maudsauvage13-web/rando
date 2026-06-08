import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp, SearchFilters } from '../context/AppContext';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

const RECOMMENDATIONS = [
  { name: 'Tous les massifs', count: 6 },
  { name: 'Fontainebleau', count: 2 },
  { name: 'Vercors', count: 2 },
  { name: 'Chartreuse', count: 1 },
  { name: 'Lac d\'Annecy', count: 1 },
  { name: 'Chamonix', count: 1 },
];

export default function SearchFiltersScreen() {
  const { filters, setFilters, hikes } = useApp();
  const router = useRouter();

  const [place, setPlace] = useState(filters.place);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>(filters.difficulty);
  const [maxTransportTime, setMaxTransportTime] = useState<number>(filters.maxTransportTime);
  const [maxElevation, setMaxElevation] = useState<number>(filters.maxElevation);
  const [maxDistance, setMaxDistance] = useState<number>(filters.maxDistance);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(filters.activities);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>(filters.accessibility);
  const [minRating, setMinRating] = useState<number>(filters.minRating);
  
  // Si le lieu est sélectionné, on montre les autres filtres
  const [isPlaceChosen, setIsPlaceChosen] = useState<boolean>(!!filters.place);

  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulty((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const toggleActivity = (act: string) => {
    setSelectedActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const toggleAccessibility = (acc: string) => {
    setSelectedAccessibility((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const handlePlaceSelect = (name: string) => {
    setPlace(name === 'Tous les massifs' ? '' : name);
    setIsPlaceChosen(true);
  };

  const handleApply = () => {
    const newFilters: SearchFilters = {
      place,
      difficulty: selectedDifficulty,
      maxTransportTime,
      maxElevation,
      maxDistance,
      activities: selectedActivities,
      accessibility: selectedAccessibility,
      minRating,
    };
    setFilters(newFilters);
    router.back();
  };

  const handleReset = () => {
    setPlace('');
    setSelectedDifficulty([]);
    setMaxTransportTime(180);
    setMaxElevation(2000);
    setMaxDistance(30);
    setSelectedActivities([]);
    setSelectedAccessibility([]);
    setMinRating(0);
    setIsPlaceChosen(false);
  };

  // Calculer en direct le nombre de randonnées correspondantes
  const resultCount = hikes.filter((hike) => {
    if (place && !hike.location.toLowerCase().includes(place.toLowerCase()) && !hike.name.toLowerCase().includes(place.toLowerCase())) {
      return false;
    }
    if (selectedDifficulty.length > 0 && !selectedDifficulty.includes(hike.difficulty)) {
      return false;
    }
    if (selectedActivities.length > 0 && !selectedActivities.includes(hike.activity)) {
      return false;
    }
    const hours = parseFloat(hike.transportDuration.replace('h', '.'));
    if (hours > maxTransportTime / 60) {
      return false;
    }
    if (hike.elevation > maxElevation) {
      return false;
    }
    if (hike.distance > maxDistance) {
      return false;
    }
    if (hike.rating < minRating) {
      return false;
    }
    return true;
  }).length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200/40"
        >
          <SymbolView
            name={{ ios: 'xmark', android: 'close', web: 'close' }}
            tintColor="#0f172a"
            size={18}
          />
        </TouchableOpacity>
        <Text className="text-slate-900 text-lg font-black tracking-tight">Filtres de Recherche</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text className="text-orange-500 font-extrabold text-sm">Effacer</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-5 py-4" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ÉTAPE 1 : Choix du lieu */}
          <View className="mb-6">
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Massif ou Lieu</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-[20px] px-4 py-3.5">
              <SymbolView
                name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' }}
                tintColor="#f97316"
                size={18}
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={place}
                onChangeText={(txt) => {
                  setPlace(txt);
                  if (txt.length > 0) setIsPlaceChosen(true);
                }}
                placeholder="Où voulez-vous aller ? (ex: Vercors, Chamonix)"
                placeholderTextColor="#94a3b8"
                className="flex-1 text-slate-800 text-base font-semibold"
                style={Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : undefined}
              />
              {place.length > 0 && (
                <TouchableOpacity onPress={() => { setPlace(''); setIsPlaceChosen(false); }}>
                  <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} tintColor="#94a3b8" size={18} />
                </TouchableOpacity>
              )}
            </View>

          {/* Recommandations rapides de lieux */}
          {!isPlaceChosen && (
            <View className="mt-4">
              <Text className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Recommandations</Text>
              <View className="flex-row flex-wrap">
                {RECOMMENDATIONS.map((rec) => (
                  <TouchableOpacity
                    key={rec.name}
                    onPress={() => handlePlaceSelect(rec.name)}
                    className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-[16px] mr-2 mb-2 flex-row items-center shadow-sm shadow-slate-900/5"
                  >
                    <Text className="text-slate-800 text-sm font-extrabold mr-1.5">{rec.name}</Text>
                    <Text className="text-slate-500 text-xs font-medium">({rec.count})</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ÉTAPE 2 : Filtres avancés */}
        {isPlaceChosen && (
          <View className="space-y-6">
            <View className="h-[1px] bg-slate-100 my-4" />

            {/* Difficulté */}
            <View className="mb-6">
              <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Difficulté</Text>
              <View className="flex-row flex-wrap">
                {['Facile', 'Moyen', 'Difficile', 'Sportif'].map((diff) => {
                  const isSel = selectedDifficulty.includes(diff);
                  return (
                    <TouchableOpacity
                      key={diff}
                      onPress={() => toggleDifficulty(diff)}
                      className={`px-4 py-2.5 rounded-[16px] mr-2 mb-2 border ${
                        isSel
                          ? 'bg-orange-50 border-orange-500'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <Text className={`font-extrabold text-xs ${isSel ? 'text-orange-700' : 'text-slate-600'}`}>
                        {diff}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Temps de transport max */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Temps de transport max</Text>
                <Text className="text-orange-600 font-extrabold text-sm">
                  {maxTransportTime >= 180 ? 'Pas de limite' : `${Math.floor(maxTransportTime / 60)}h${maxTransportTime % 60 !== 0 ? maxTransportTime % 60 : ''}`}
                </Text>
              </View>
              <View className="flex-row justify-between bg-slate-100 p-1 rounded-[16px] border border-slate-200/50">
                {[60, 90, 120, 150, 180].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    onPress={() => setMaxTransportTime(mins)}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      maxTransportTime === mins ? 'bg-slate-900 shadow-sm' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-extrabold ${maxTransportTime === mins ? 'text-white' : 'text-slate-600'}`}>
                      {mins === 180 ? '3h+' : `${mins / 60}h${mins % 60 !== 0 ? '30' : ''}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dénivelé max */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Dénivelé cumulé max</Text>
                <Text className="text-orange-600 font-extrabold text-sm">+{maxElevation} m</Text>
              </View>
              <View className="flex-row justify-between bg-slate-100 p-1 rounded-[16px] border border-slate-200/50">
                {[300, 600, 1000, 1500, 2000].map((elev) => (
                  <TouchableOpacity
                    key={elev}
                    onPress={() => setMaxElevation(elev)}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      maxElevation === elev ? 'bg-slate-900 shadow-sm' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-extrabold ${maxElevation === elev ? 'text-white' : 'text-slate-600'}`}>+{elev}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance max */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Distance max de parcours</Text>
                <Text className="text-orange-600 font-extrabold text-sm">{maxDistance} km</Text>
              </View>
              <View className="flex-row justify-between bg-slate-100 p-1 rounded-[16px] border border-slate-200/50">
                {[8, 12, 16, 20, 30].map((dist) => (
                  <TouchableOpacity
                    key={dist}
                    onPress={() => setMaxDistance(dist)}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      maxDistance === dist ? 'bg-slate-900 shadow-sm' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-extrabold ${maxDistance === dist ? 'text-white' : 'text-slate-600'}`}>{dist}km</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Type d'activité */}
            <View className="mb-6">
              <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Type d'activité</Text>
              <View className="flex-row flex-wrap">
                {['Randonnée', 'Trail', 'VTT', 'Raquettes'].map((act) => {
                  const isSel = selectedActivities.includes(act);
                  return (
                    <TouchableOpacity
                      key={act}
                      onPress={() => toggleActivity(act)}
                      className={`px-4 py-2.5 rounded-[16px] mr-2 mb-2 border ${
                        isSel
                          ? 'bg-orange-50 border-orange-500'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <Text className={`font-extrabold text-xs ${isSel ? 'text-orange-700' : 'text-slate-600'}`}>
                        {act}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Accessibilité */}
            <View className="mb-6">
              <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Accessibilité / Spécificités</Text>
              <View className="flex-row flex-wrap">
                {['Proche gare', 'PMR', 'Sans poussette'].map((acc) => {
                  const isSel = selectedAccessibility.includes(acc);
                  return (
                    <TouchableOpacity
                      key={acc}
                      onPress={() => toggleAccessibility(acc)}
                      className={`px-4 py-2.5 rounded-[16px] mr-2 mb-2 border ${
                        isSel
                          ? 'bg-orange-50 border-orange-500'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <Text className={`font-extrabold text-xs ${isSel ? 'text-orange-700' : 'text-slate-600'}`}>
                        {acc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Notation minimum */}
            <View className="mb-12">
              <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Note minimale des utilisateurs</Text>
              <View className="flex-row justify-between bg-slate-100 p-1 rounded-[16px] border border-slate-200/50">
                {[0, 3, 4, 4.5].map((rate) => (
                  <TouchableOpacity
                    key={rate}
                    onPress={() => setMinRating(rate)}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      minRating === rate ? 'bg-slate-900 shadow-sm' : 'bg-transparent'
                    }`}
                  >
                    <Text className={`text-xs font-extrabold ${minRating === rate ? 'text-white' : 'text-slate-600'}`}>
                      {rate === 0 ? 'Toutes' : `${rate} ★+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Button valider fixe en bas */}
      <View className="p-5 border-t border-slate-100 bg-white">
        <TouchableOpacity
          onPress={handleApply}
          disabled={isPlaceChosen && resultCount === 0}
          className={`w-full py-4.5 rounded-[20px] items-center justify-center flex-row shadow-sm ${
            isPlaceChosen && resultCount === 0 ? 'bg-slate-100 opacity-60' : 'bg-slate-900 shadow-sm'
          }`}
        >
          <SymbolView
            name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
            tintColor="#ffffff"
            size={18}
            style={{ marginRight: 6 }}
          />
          <Text className="text-white font-extrabold text-base">
            {!isPlaceChosen
              ? 'Sélectionner un massif'
              : resultCount > 0
              ? `Rechercher (${resultCount} randonnée${resultCount > 1 ? 's' : ''})`
              : 'Aucun résultat'}
          </Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
