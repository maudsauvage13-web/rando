import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Pressable, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
import { useApp, Hike, getHikePriceInfo } from '../../context/AppContext';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ExplorerScreen() {
  const { hikes, userPasses, filters, toggleFavorite, favorites } = useApp();
  const router = useRouter();
  
  const [selectedHike, setSelectedHike] = useState<Hike | null>(null);
  const [bottomSheetState, setBottomSheetState] = useState<'collapsed' | 'half' | 'full'>('half');

  // Filtrer les randonnées selon les filtres globaux de recherche
  const filteredHikes = hikes.filter((hike) => {
    if (filters.place && !hike.location.toLowerCase().includes(filters.place.toLowerCase()) && !hike.name.toLowerCase().includes(filters.place.toLowerCase())) {
      return false;
    }
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(hike.difficulty)) {
      return false;
    }
    if (filters.activities.length > 0 && !filters.activities.includes(hike.activity)) {
      return false;
    }
    const hours = parseFloat(hike.transportDuration.replace('h', '.'));
    const filterHours = filters.maxTransportTime / 60;
    if (hours > filterHours) {
      return false;
    }
    if (hike.elevation > filters.maxElevation) {
      return false;
    }
    if (hike.distance > filters.maxDistance) {
      return false;
    }
    if (hike.rating < filters.minRating) {
      return false;
    }
    return true;
  });

  const handleMarkerPress = (hike: Hike) => {
    setSelectedHike(hike);
    setBottomSheetState('half');
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Facile': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Moyen': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Difficile': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Sportif': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <View className="flex-1 bg-slate-100">
      {/* 1. MOCK INTERACTIVE MAP (Light Theme, high visibility) */}
      <View className="absolute inset-0">
        <Svg width="100%" height="100%" viewBox="0 0 360 640" style={StyleSheet.absoluteFill}>
          <Rect width="360" height="640" fill="#f8fafc" />
          
          <Path d="M -20,100 Q 80,40 180,110 T 380,80" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          <Path d="M -20,130 Q 80,70 180,140 T 380,110" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
          <Path d="M -20,160 Q 80,100 180,170 T 380,140" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          
          <Path d="M -20,250 Q 120,310 240,240 T 380,270" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          
          <Path d="M 30,280 Q 70,250 120,290 T 160,330 T 80,360 Z" fill="#d1fae5" fillOpacity="0.6" stroke="#a7f3d0" strokeWidth="1" />
          <Path d="M 220,120 Q 280,90 320,140 T 300,200 T 210,160 Z" fill="#d1fae5" fillOpacity="0.6" stroke="#a7f3d0" strokeWidth="1" />
          
          <Path d="M 170,140 Q 190,115 210,135 T 230,165 T 190,175 T 160,155 Z" fill="#e0f2fe" fillOpacity="0.8" stroke="#bae6fd" strokeWidth="1.5" />
          
          <Path d="M 0,400 L 100,380 L 180,420 L 360,400" fill="none" stroke="#334155" strokeWidth="2.5" strokeDasharray="6,4" />
          
          <G>
            <Circle cx="180" cy="280" r="16" fill="#f97316" fillOpacity="0.1" />
            <Circle cx="180" cy="280" r="8" fill="#f97316" fillOpacity="0.3" />
            <Circle cx="180" cy="280" r="4.5" fill="#ffffff" stroke="#f97316" strokeWidth="2.5" />
          </G>

          {filteredHikes.map((hike) => {
            const isSelected = selectedHike?.id === hike.id;
            const diffColor = hike.difficulty === 'Facile' ? '#10b981' : hike.difficulty === 'Moyen' ? '#f59e0b' : hike.difficulty === 'Difficile' ? '#f43f5e' : '#a855f7';
            
            return (
              <G key={hike.id}>
                <Circle
                  cx={hike.coordinates.x}
                  cy={hike.coordinates.y}
                  r="18"
                  fill="transparent"
                  onPress={() => handleMarkerPress(hike)}
                />
                <Circle
                  cx={hike.coordinates.x}
                  cy={hike.coordinates.y}
                  r={isSelected ? 10 : 7}
                  fill={diffColor}
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  onPress={() => handleMarkerPress(hike)}
                />
                {isSelected && (
                  <Circle
                    cx={hike.coordinates.x}
                    cy={hike.coordinates.y}
                    r="15"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                )}
              </G>
            );
          })}
        </Svg>
      </View>

      {/* 2. TOP FLOATING INTERFACE (Light theme, high contrast) */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-20 px-4">
        {/* Search Input Bar (Rounded, fine border, shadow) */}
        <Pressable
          onPress={() => router.push('/search' as any)}
          className="flex-row items-center bg-white border border-slate-900/10 rounded-[24px] px-4 py-4 shadow-sm shadow-black/5"
        >
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            tintColor="#0f172a"
            size={18}
            style={{ marginRight: 10 }}
          />
          <Text className="text-slate-800 text-base font-bold flex-1">
            {filters.place ? `Région : ${filters.place}` : 'Où voulez-vous randonner ?'}
          </Text>
          <SymbolView
            name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
            tintColor="#f97316"
            size={18}
          />
        </Pressable>

        {/* Quick Filter Pills (Horizontal scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mt-2 max-h-[38px]"
        >
          {filters.difficulty.length > 0 ? (
            <TouchableOpacity
              onPress={() => router.push('/search' as any)}
              className="bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full mr-2 flex-row items-center"
            >
              <Text className="text-orange-700 text-xs font-bold mr-1">Diff : {filters.difficulty.join(', ')}</Text>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor="#f97316" size={10} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/search' as any)}
              className="bg-white border border-slate-200 px-3 py-1.5 rounded-full mr-2"
            >
              <Text className="text-slate-700 text-xs font-bold">Difficulté</Text>
            </TouchableOpacity>
          )}

          {filters.maxTransportTime < 180 ? (
            <TouchableOpacity
              onPress={() => router.push('/search' as any)}
              className="bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full mr-2 flex-row items-center"
            >
              <Text className="text-orange-700 text-xs font-bold mr-1">Transport &lt; {filters.maxTransportTime / 60}h</Text>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor="#f97316" size={10} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/search' as any)}
              className="bg-white border border-slate-200 px-3 py-1.5 rounded-full mr-2"
            >
              <Text className="text-slate-700 text-xs font-bold">Dénivelé &lt; {filters.maxElevation}m</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.push('/search' as any)}
            className="bg-white border border-slate-200 px-3 py-1.5 rounded-full mr-2"
          >
            <Text className="text-slate-700 text-xs font-bold">Distance &lt; {filters.maxDistance}km</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* 3. DYNAMIC BOTTOM SHEET (Very rounded, white, thin border) */}
      <View
        className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-100 rounded-t-[32px] shadow-lg shadow-slate-900/10"
        style={{
          height:
            bottomSheetState === 'collapsed'
              ? 110
              : bottomSheetState === 'half'
              ? 340
              : SCREEN_HEIGHT - 120,
        }}
      >
        {/* Drag Handle Indicator */}
        <TouchableOpacity
          onPress={() =>
            setBottomSheetState((prev) =>
              prev === 'collapsed' ? 'half' : prev === 'half' ? 'full' : 'collapsed'
            )
          }
          className="items-center py-3.5"
        >
          <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </TouchableOpacity>

        {/* Title Header */}
        <View className="px-5 pb-3.5 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-900 text-lg font-black tracking-tight">Randonnées disponibles</Text>
            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-tight">{filteredHikes.length} randos trouvées sans voiture</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setBottomSheetState((prev) => (prev === 'full' ? 'half' : 'full'))
            }
            className="px-3.5 py-1.5 bg-slate-100 rounded-full border border-slate-200/40"
          >
            <Text className="text-slate-800 text-xs font-extrabold">
              {bottomSheetState === 'full' ? 'Réduire' : 'Agrandir'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet Body Content */}
        {bottomSheetState === 'collapsed' ? (
          <View className="px-5 pt-1">
            {filteredHikes.length > 0 ? (
              <Pressable
                onPress={() => router.push({ pathname: '/details' as any, params: { id: (selectedHike || filteredHikes[0]).id } })}
                className="bg-slate-50 border border-slate-200/80 p-3 rounded-[20px] flex-row items-center"
              >
                <Image
                  source={{ uri: (selectedHike || filteredHikes[0]).image }}
                  className="w-12 h-12 rounded-xl mr-3"
                />
                <View className="flex-1">
                  <Text className="text-slate-900 font-extrabold text-sm" numberOfLines={1}>
                    {(selectedHike || filteredHikes[0]).name}
                  </Text>
                  <Text className="text-slate-500 text-xs font-semibold" numberOfLines={1}>
                    {(selectedHike || filteredHikes[0]).location} • {(selectedHike || filteredHikes[0]).transportDuration}
                  </Text>
                </View>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                  tintColor="#f97316"
                  size={20}
                />
              </Pressable>
            ) : (
              <Text className="text-slate-400 text-sm text-center py-2">Aucune randonnée à proximité.</Text>
            )}
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            className="flex-1"
          >
            {/* Si un marqueur est sélectionné */}
            {selectedHike && (
              <View className="mb-4">
                <Text className="text-orange-500 text-[10px] font-black uppercase tracking-wider mb-2">Sélectionné sur la carte</Text>
                {renderHikeCard(selectedHike, true)}
                <View className="h-[1px] bg-slate-100 my-4" />
              </View>
            )}

            {/* Liste générale */}
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2">Tous les résultats</Text>
            {filteredHikes.length > 0 ? (
              filteredHikes
                .filter((h) => h.id !== selectedHike?.id)
                .map((hike) => renderHikeCard(hike, false))
            ) : (
              <View className="items-center justify-center py-12">
                <SymbolView
                  name={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
                  tintColor="#64748b"
                  size={32}
                  style={{ marginBottom: 8 }}
                />
                <Text className="text-slate-600 text-center font-bold">Aucun résultat ne correspond à vos filtres.</Text>
                <TouchableOpacity
                  onPress={() => router.push('/search' as any)}
                  className="mt-4 px-5 py-2.5 bg-slate-900 rounded-full"
                >
                  <Text className="text-white text-xs font-bold">Modifier les filtres</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );

  function renderHikeCard(hike: Hike, isHighlighted: boolean) {
    const isFav = favorites.includes(hike.id);
    const priceInfo = getHikePriceInfo(hike, userPasses);
    
    return (
      <Pressable
        key={hike.id}
        onPress={() => router.push({ pathname: '/details' as any, params: { id: hike.id } })}
        className={`bg-white border rounded-[24px] p-4.5 mb-4 flex-row ${
          isHighlighted ? 'border-orange-500 shadow-sm' : 'border-slate-200/80 shadow-sm shadow-slate-900/5'
        }`}
      >
        {/* Hike Image */}
        <View className="relative">
          <Image
            source={{ uri: hike.image }}
            className="w-24 h-24 rounded-[16px]"
          />
          {/* Rating Badge */}
          <View className="absolute top-1 left-1 bg-white/95 px-1.5 py-0.5 rounded-lg flex-row items-center border border-slate-200/40">
            <Text className="text-orange-500 text-[10px] font-bold mr-0.5">★</Text>
            <Text className="text-slate-900 text-[10px] font-extrabold">{hike.rating}</Text>
          </View>
        </View>

        {/* Card info */}
        <View className="flex-1 ml-4 justify-between">
          <View>
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-2">
                <Text className="text-slate-900 font-extrabold text-base" numberOfLines={1}>
                  {hike.name}
                </Text>
                <Text className="text-slate-500 text-xs font-semibold" numberOfLines={1}>
                  {hike.location}
                </Text>
              </View>
              {/* Favorite Button */}
              <TouchableOpacity
                onPress={() => toggleFavorite(hike.id)}
                className="w-7 h-7 bg-slate-100 rounded-full items-center justify-center border border-slate-200/40"
              >
                <SymbolView
                  name={{
                    ios: isFav ? 'heart.fill' : 'heart',
                    android: isFav ? 'favorite' : 'favorite_border',
                    web: isFav ? 'favorite' : 'favorite_border',
                  }}
                  tintColor={isFav ? '#f43f5e' : '#64748b'}
                  size={13}
                />
              </TouchableOpacity>
            </View>

            {/* Quick Metrics */}
            <View className="flex-row items-center flex-wrap mt-1.5 space-x-1">
              <Text className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${getDifficultyColor(hike.difficulty)}`}>
                {hike.difficulty}
              </Text>
              <Text className="text-slate-500 text-[11px] font-bold ml-1">
                {hike.distance}km • +{hike.elevation}m • {hike.duration}
              </Text>
            </View>
          </View>

          {/* Transport Info Footer (Névé magic price) */}
          <View className="flex-row items-center justify-between border-t border-slate-100 pt-2 mt-2">
            <View className="flex-row items-center">
              <SymbolView
                name={{ ios: 'train.side.front.car', android: 'train', web: 'train' }}
                tintColor="#0f172a"
                size={14}
                style={{ marginRight: 4 }}
              />
              <Text className="text-slate-600 text-xs font-semibold">
                {hike.transportDuration}
              </Text>
            </View>
            
            {/* Price Badge */}
            <View className="items-end">
              <Text className={`text-sm font-black ${priceInfo.isFree ? 'text-emerald-700' : 'text-slate-900'}`}>
                {priceInfo.displayText}
              </Text>
              {priceInfo.badgeText && (
                <Text className="text-[9px] text-orange-600 font-extrabold mt-0.5">
                  {priceInfo.badgeText}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  }
}
