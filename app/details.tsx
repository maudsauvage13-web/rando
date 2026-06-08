import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions, StatusBar, Platform } from 'react-native';
import { useApp, getHikePriceInfo } from '../context/AppContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import Svg, { Path, LinearGradient, Stop, Defs } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Liste des 7 prochains jours pour le sélecteur rapide de date
const getNextDays = () => {
  const days = [];
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
  const formatter = new Intl.DateTimeFormat('fr-FR', options);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const parts = formatter.format(d).split(' ');
    days.push({
      id: d.toISOString().split('T')[0],
      raw: d,
      dayName: parts[0].replace('.', ''),
      dayNum: parts[1],
      month: parts[2],
      formatted: formatter.format(d)
    });
  }
  return days;
};

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

const getArrivalDateLabel = (startDate: Date, durationDays: number) => {
  const arrivalDate = new Date(startDate);
  arrivalDate.setDate(arrivalDate.getDate() + (durationDays - 1));
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat('fr-FR', options).format(arrivalDate);
};

export default function HikeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { hikes, userPasses, toggleFavorite, favorites } = useApp();
  const router = useRouter();
  
  const hike = hikes.find((h) => h.id === id) || hikes[0];
  const isFav = favorites.includes(hike.id);
  const priceInfo = getHikePriceInfo(hike, userPasses);
  
  const nextDays = getNextDays();
  const [selectedDate, setSelectedDate] = useState(nextDays[1]); // Par défaut, demain

  // Planifier le transport states
  const [showTransportConfig, setShowTransportConfig] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [durationDays, setDurationDays] = useState(1);

  const [selectedStation, setSelectedStation] = useState(hike.departureStation);
  const stationOptions = hike.departureStation.includes('Paris')
    ? ['Paris Gare de Lyon', 'Paris Montparnasse', 'Paris Gare du Nord']
    : hike.departureStation.includes('Grenoble')
    ? ['Grenoble Gare', 'Grenoble Universités']
    : [hike.departureStation, 'Autre gare à proximité'];

  const scheduleData = TRAIN_SCHEDULES[
    hike.location.includes('Fontainebleau') ? 'Fontainebleau' :
    hike.location.includes('Vercors') ? 'Vercors' :
    hike.location.includes('Chartreuse') ? 'Chartreuse' :
    hike.location.includes('Annecy') ? 'Lac d\'Annecy' : 'Chamonix'
  ] || TRAIN_SCHEDULES['Fontainebleau'];

  const [selectedAller, setSelectedAller] = useState(scheduleData.aller[0]);
  const [selectedRetour, setSelectedRetour] = useState(scheduleData.retour[0]);

  const scrollViewRef = React.useRef<ScrollView>(null);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Facile': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Moyen': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Difficile': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Sportif': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getWeatherText = (temp: number, icon: string) => {
    if (icon === 'sunny') return `Ensoleillé • ${temp}°C`;
    if (icon === 'cloudy') return `Nuageux • ${temp}°C`;
    return `Pluie • ${temp}°C`;
  };

  const getWeatherIconName = (icon: string) => {
    if (icon === 'sunny') return 'sun.max.fill';
    if (icon === 'cloudy') return 'cloud.sun.fill';
    return 'cloud.rain.fill';
  };

  const getWeatherIconColor = (icon: string) => {
    if (icon === 'sunny') return '#f97316'; // Orange vif
    if (icon === 'cloudy') return '#0284c7'; // Bleu ciel
    return '#0284c7';
  };

  const handlePlanTrajet = () => {
    if (!showTransportConfig) {
      setShowTransportConfig(true);
      setActiveStep(1);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    } else if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      setActiveStep(3);
    } else {
      // Aller sur le récapitulatif
      router.push({
        pathname: '/recap' as any,
        params: {
          hikeId: hike.id,
          dateLabel: selectedDate.formatted,
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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* 1. HEADER IMAGE & BUTTONS */}
      <View className="relative h-72">
        <Image
          source={{ uri: hike.image }}
          className="w-full h-full object-cover"
        />
        <View className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
        
        {/* Navigation Buttons (White glassmorphism, fine border) */}
        <SafeAreaView className="absolute top-0 left-0 right-0 z-10 flex-row justify-between px-5 pt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/90 border border-slate-200 rounded-full items-center justify-center shadow-sm"
          >
            <SymbolView
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              tintColor="#0f172a"
              size={20}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleFavorite(hike.id)}
            className="w-10 h-10 bg-white/90 border border-slate-200 rounded-full items-center justify-center shadow-sm"
          >
            <SymbolView
              name={{
                ios: isFav ? 'heart.fill' : 'heart',
                android: isFav ? 'favorite' : 'favorite_border',
                web: isFav ? 'favorite' : 'favorite_border',
              }}
              tintColor={isFav ? '#f43f5e' : '#0f172a'}
              size={16}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* 2. BODY CONTENT (SCROLLABLE) */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        className="flex-1 -mt-8 px-5 rounded-t-[32px] bg-white"
      >
        {/* Category & Rating */}
        <View className="flex-row justify-between items-center mt-6 mb-2">
          <View className="flex-row items-center space-x-2">
            <Text className="text-orange-500 font-extrabold text-xs uppercase tracking-wider">{hike.activity}</Text>
            <Text className="text-slate-300 text-xs">•</Text>
            <Text className="text-slate-500 text-xs font-semibold">{hike.location}</Text>
          </View>
          <View className="flex-row items-center bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-xl">
            <Text className="text-orange-500 text-xs mr-1">★</Text>
            <Text className="text-slate-900 text-xs font-extrabold">{hike.rating}</Text>
            <Text className="text-slate-400 text-[10px] font-bold ml-1">({hike.reviewsCount})</Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-slate-900 text-3xl font-black tracking-tight mb-4">{hike.name}</Text>

        {/* ECO & TRANSPORT CARD */}
        <View className="bg-slate-50 border border-slate-200 rounded-[24px] p-4.5 mb-6 flex-row items-center justify-between shadow-sm shadow-slate-900/5">
          <View className="flex-1 pr-3">
            <View className="flex-row items-center mb-1">
              <SymbolView
                name={{ ios: 'train.side.front.car', android: 'train', web: 'train' }}
                tintColor="#0f172a"
                size={16}
                style={{ marginRight: 6 }}
              />
              <Text className="text-slate-900 font-extrabold text-sm">Trajet en transport</Text>
            </View>
            <Text className="text-slate-500 text-xs font-medium mt-0.5">
              {hike.departureStation} ➔ {hike.nearbyStation.split(' (')[0]} ({hike.transportDuration})
            </Text>
            {priceInfo.badgeText && (
              <Text className="text-orange-600 text-[10px] font-black uppercase mt-1.5">
                ✓ {priceInfo.badgeText}
              </Text>
            )}
          </View>
          <View className="items-end">
            <Text className="text-slate-400 text-[10px] font-bold">ALLER SIMPLE</Text>
            <Text className={`text-xl font-black ${priceInfo.isFree ? 'text-emerald-700' : 'text-slate-900'}`}>
              {priceInfo.displayText}
            </Text>
            <Text className="text-orange-600 text-[10px] font-extrabold mt-0.5">
              🌳 -{hike.co2Saved} kg CO2
            </Text>
          </View>
        </View>

        {/* KEY METRICS GRID */}
        <View className="flex-row flex-wrap mb-6 bg-slate-50 border border-slate-200/80 p-4 rounded-[24px] shadow-sm shadow-slate-900/5">
          <View className="w-1/3 py-2 items-center">
            <SymbolView name={{ ios: 'hourglass', android: 'schedule', web: 'schedule' }} tintColor="#64748b" size={20} />
            <Text className="text-slate-900 font-extrabold text-sm mt-1">{hike.duration}</Text>
            <Text className="text-slate-400 text-[10px] font-bold">Durée</Text>
          </View>
          <View className="w-1/3 py-2 items-center border-l border-r border-slate-200">
            <SymbolView name={{ ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' }} tintColor="#64748b" size={20} />
            <Text className="text-slate-900 font-extrabold text-sm mt-1">{hike.distance} km</Text>
            <Text className="text-slate-400 text-[10px] font-bold">Distance</Text>
          </View>
          <View className="w-1/3 py-2 items-center">
            <SymbolView name={{ ios: 'mountain.2', android: 'terrain', web: 'terrain' }} tintColor="#64748b" size={20} />
            <Text className="text-slate-900 font-extrabold text-sm mt-1">+{hike.elevation} m</Text>
            <Text className="text-slate-400 text-[10px] font-bold">Dénivelé</Text>
          </View>
          <View className="w-full h-[1px] bg-slate-200/60 my-2" />
          <View className="w-1/2 py-2 items-center border-r border-slate-200">
            <Text className={`text-[10px] font-extrabold border px-3 py-0.5 rounded-full ${getDifficultyColor(hike.difficulty)}`}>
              {hike.difficulty}
            </Text>
            <Text className="text-slate-400 text-[10px] font-bold mt-1.5">Difficulté</Text>
          </View>
          <View className="w-1/2 py-2 items-center">
            <View className="flex-row items-center">
              <SymbolView
                name={{
                  ios: getWeatherIconName(hike.weatherIcon),
                  android: 'cloud',
                  web: 'cloud'
                }}
                tintColor={getWeatherIconColor(hike.weatherIcon)}
                size={16}
                style={{ marginRight: 4 }}
              />
              <Text className="text-slate-900 font-extrabold text-xs">
                {getWeatherText(hike.weatherTemp, hike.weatherIcon)}
              </Text>
            </View>
            <Text className="text-slate-400 text-[10px] font-bold mt-1.5">Météo Prévue</Text>
          </View>
        </View>

        {/* GPX ALTITUDE PROFILE / PATH PREVIEW (Modern colored track A3) */}
        <View className="mb-6">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Aperçu du tracé GPX & Altitude</Text>
          <View className="bg-slate-50 border border-slate-200/80 rounded-[24px] p-4.5 items-center relative overflow-hidden shadow-sm shadow-slate-900/5">
            {/* Altitudes labels */}
            <View className="absolute top-2 left-4">
              <Text className="text-slate-400 text-[10px] font-bold">Max: +{hike.elevation}m</Text>
            </View>
            <View className="absolute bottom-2 left-4">
              <Text className="text-slate-400 text-[10px] font-bold">Min: +0m</Text>
            </View>
            <View className="absolute bottom-2 right-4">
              <Text className="text-slate-400 text-[10px] font-bold">{hike.distance}km</Text>
            </View>

            {/* SVG Path with slope-colored stroke gradient (A3) */}
            <View className="w-full h-32 items-center justify-center mt-2">
              <Svg width="300" height="100" viewBox="0 0 300 100">
                <Defs>
                  <LinearGradient id="slopeGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#10b981" />
                    <Stop offset="35%" stopColor="#f59e0b" />
                    <Stop offset="65%" stopColor="#f43f5e" />
                    <Stop offset="85%" stopColor="#f59e0b" />
                    <Stop offset="100%" stopColor="#10b981" />
                  </LinearGradient>
                  
                  <LinearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#f97316" stopOpacity="0.08" />
                    <Stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>
                <Path
                  d={`${hike.gpxPath} L 290,100 L 10,100 Z`}
                  fill="url(#fillGrad)"
                />
                <Path
                  d={hike.gpxPath}
                  fill="none"
                  stroke="url(#slopeGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </View>
        </View>

        {/* DESCRIPTION */}
        <View className="mb-6">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Description</Text>
          <Text className="text-slate-700 text-sm leading-6 font-medium">{hike.description}</Text>
        </View>

        {/* PLANNER DATE SELECTOR */}
        <View className="mb-6">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Sélectionner la Date de départ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {nextDays.map((day) => {
              const isSelected = selectedDate.id === day.id;
              return (
                <TouchableOpacity
                  key={day.id}
                  onPress={() => setSelectedDate(day)}
                  className={`w-16 h-20 rounded-[20px] items-center justify-center mr-3 border ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <Text className={`text-[10px] font-black uppercase ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                    {day.dayName}
                  </Text>
                  <Text className={`text-xl font-black my-0.5 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {day.dayNum}
                  </Text>
                  <Text className={`text-[10px] font-bold ${isSelected ? 'text-orange-400' : 'text-slate-500'}`}>
                    {day.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* STEP-BY-STEP COLLAPSIBLE TRANSPORT CONFIGURATION */}
        <View className="mb-6 pt-4 border-t border-slate-100">
          <TouchableOpacity 
            onPress={() => {
              setShowTransportConfig(!showTransportConfig);
              if (!showTransportConfig) {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 150);
              }
            }}
            className="flex-row justify-between items-center py-2"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
                <SymbolView 
                  name={{ ios: 'train.side.front.car', android: 'train', web: 'train' }} 
                  tintColor="#f97316" 
                  size={20} 
                />
              </View>
              <View>
                <Text className="text-slate-900 text-lg font-black tracking-tight">Configuration du trajet</Text>
                <Text className="text-slate-500 text-xs font-semibold">Planifier votre aller-retour sans voiture</Text>
              </View>
            </View>
            <SymbolView 
              name={{ 
                ios: showTransportConfig ? 'chevron.up' : 'chevron.down', 
                android: showTransportConfig ? 'expand_less' : 'expand_more', 
                web: showTransportConfig ? 'expand_less' : 'expand_more' 
              }} 
              tintColor="#0f172a" 
              size={20} 
            />
          </TouchableOpacity>

          {showTransportConfig && (
            <View className="mt-4 space-y-4">
              {/* Étape 1 : Dates & Durée */}
              <View className="bg-slate-50 border border-slate-200/60 rounded-[24px] overflow-hidden mb-3 shadow-sm shadow-slate-900/5">
                <TouchableOpacity
                  onPress={() => setActiveStep(1)}
                  className="p-4 flex-row justify-between items-center bg-slate-50"
                >
                  <View className="flex-row items-center">
                    <View className="w-7 h-7 rounded-full bg-slate-900 items-center justify-center mr-3">
                      <Text className="text-white font-black text-xs">1</Text>
                    </View>
                    <View className="pr-4 flex-1">
                      <Text className="text-slate-900 font-extrabold text-sm tracking-tight">Durée & Dates</Text>
                      <Text className="text-slate-500 text-[10px] font-bold" numberOfLines={1}>
                        {isMultiDay 
                          ? `Départ : ${selectedDate.dayNum} ${selectedDate.month} • Arrivée : ${getArrivalDateLabel(selectedDate.raw, durationDays)}` 
                          : `Aller-retour : ${selectedDate.formatted}`}
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
                    size={16}
                  />
                </TouchableOpacity>

                {activeStep === 1 && (
                  <View className="p-4 border-t border-slate-200/60 bg-white space-y-4">
                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Type de trajet</Text>
                    
                    <View className="flex-row mb-2">
                      <TouchableOpacity
                        onPress={() => { setIsMultiDay(false); setDurationDays(1); }}
                        className={`flex-1 p-3 rounded-[20px] border items-center mr-2 ${
                          !isMultiDay ? 'bg-orange-50/50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <SymbolView name={{ ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' }} tintColor={!isMultiDay ? '#f97316' : '#64748b'} size={20} />
                        <Text className="text-slate-900 font-extrabold text-xs mt-1">Journée</Text>
                        <Text className="text-slate-500 text-[9px] font-semibold mt-0.5 text-center">Aller-retour le même jour</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => { setIsMultiDay(true); setDurationDays(2); }}
                        className={`flex-1 p-3 rounded-[20px] border items-center ${
                          isMultiDay ? 'bg-orange-50/50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <SymbolView name={{ ios: 'moon.stars.fill', android: 'nights_stay', web: 'nights_stay' }} tintColor={isMultiDay ? '#f97316' : '#64748b'} size={20} />
                        <Text className="text-slate-900 font-extrabold text-xs mt-1">Plusieurs jours</Text>
                        <Text className="text-slate-500 text-[9px] font-semibold mt-0.5 text-center">Randonnée longue</Text>
                      </TouchableOpacity>
                    </View>

                    {isMultiDay && (
                      <View className="bg-slate-50 p-3 rounded-[20px] border border-slate-200/60">
                        <Text className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-2">Nombre de jours sur place</Text>
                        <View className="flex-row items-center justify-between">
                          <TouchableOpacity
                            onPress={() => setDurationDays((d) => Math.max(2, d - 1))}
                            className="w-8 h-8 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm"
                          >
                            <Text className="text-slate-800 font-extrabold text-base">-</Text>
                          </TouchableOpacity>
                          <Text className="text-slate-900 font-black text-sm">{durationDays} Jours</Text>
                          <TouchableOpacity
                            onPress={() => setDurationDays((d) => Math.min(5, d + 1))}
                            className="w-8 h-8 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm"
                          >
                            <Text className="text-slate-800 font-extrabold text-base">+</Text>
                          </TouchableOpacity>
                        </View>
                        <View className="mt-3 pt-3 border-t border-slate-200/40">
                          <Text className="text-slate-500 text-[10px] font-bold">
                            📅 Date de départ : <Text className="text-slate-800 font-extrabold">{selectedDate.formatted}</Text>
                          </Text>
                          <Text className="text-slate-500 text-[10px] font-bold mt-1">
                            📅 Date d'arrivée : <Text className="text-slate-800 font-extrabold">{getArrivalDateLabel(selectedDate.raw, durationDays)}</Text>
                          </Text>
                        </View>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => setActiveStep(2)}
                      className="w-full py-3 bg-slate-900 rounded-[16px] items-center mt-2 shadow-sm"
                    >
                      <Text className="text-white font-extrabold text-xs">Continuer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Étape 2 : Gare de départ */}
              <View className="bg-slate-50 border border-slate-200/60 rounded-[24px] overflow-hidden mb-3 shadow-sm shadow-slate-900/5" style={{ opacity: activeStep < 2 ? 0.6 : 1 }}>
                <TouchableOpacity
                  onPress={() => activeStep >= 2 && setActiveStep(2)}
                  disabled={activeStep < 2}
                  className="p-4 flex-row justify-between items-center bg-slate-50"
                >
                  <View className="flex-row items-center">
                    <View className="w-7 h-7 rounded-full bg-slate-900 items-center justify-center mr-3">
                      <Text className="text-white font-black text-xs">2</Text>
                    </View>
                    <View>
                      <Text className="text-slate-900 font-extrabold text-sm tracking-tight">Gare de départ</Text>
                      <Text className="text-slate-500 text-[10px] font-bold">{selectedStation}</Text>
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
                      size={16}
                    />
                  )}
                </TouchableOpacity>

                {activeStep === 2 && (
                  <View className="p-4 border-t border-slate-200/60 bg-white space-y-3">
                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Choisir votre gare de départ</Text>
                    
                    <View className="space-y-2">
                      {stationOptions.map((station) => (
                        <TouchableOpacity
                          key={station}
                          onPress={() => setSelectedStation(station)}
                          className={`p-3 rounded-[16px] border flex-row justify-between items-center ${
                            selectedStation === station ? 'bg-orange-50/50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/60'
                          }`}
                        >
                          <Text className="text-slate-900 font-extrabold text-xs">{station}</Text>
                          {selectedStation === station && (
                            <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} tintColor="#f97316" size={16} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      onPress={() => setActiveStep(3)}
                      className="w-full py-3 bg-slate-900 rounded-[16px] items-center mt-2 shadow-sm"
                    >
                      <Text className="text-white font-extrabold text-xs">Continuer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Étape 3 : Sélection des horaires */}
              <View className="bg-slate-50 border border-slate-200/60 rounded-[24px] overflow-hidden mb-3 shadow-sm shadow-slate-900/5" style={{ opacity: activeStep < 3 ? 0.6 : 1 }}>
                <TouchableOpacity
                  onPress={() => activeStep >= 3 && setActiveStep(3)}
                  disabled={activeStep < 3}
                  className="p-4 flex-row justify-between items-center bg-slate-50"
                >
                  <View className="flex-row items-center">
                    <View className="w-7 h-7 rounded-full bg-slate-900 items-center justify-center mr-3">
                      <Text className="text-white font-black text-xs">3</Text>
                    </View>
                    <View className="pr-4 flex-1">
                      <Text className="text-slate-900 font-extrabold text-sm tracking-tight">Horaires Aller & Retour</Text>
                      <Text className="text-slate-500 text-[10px] font-bold" numberOfLines={1}>
                        Aller: {selectedAller.split(' (')[0]} • Retour: {selectedRetour.split(' (')[0]}
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
                      size={16}
                    />
                  )}
                </TouchableOpacity>

                {activeStep === 3 && (
                  <View className="p-4 border-t border-slate-200/60 bg-white space-y-4">
                    {/* Aller */}
                    <View className="mb-2">
                      <Text className="text-slate-400 text-[9px] font-black uppercase tracking-wider mb-2">TRAJET ALLER ({selectedDate.formatted})</Text>
                      {scheduleData.aller.map((t) => (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setSelectedAller(t)}
                          className={`p-3 rounded-[16px] border flex-row justify-between items-center mb-2 ${
                            selectedAller === t ? 'bg-orange-50/50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/50'
                          }`}
                        >
                          <View>
                            <Text className="text-slate-900 font-extrabold text-xs">{t}</Text>
                            <Text className="text-slate-500 text-[9px] font-bold mt-0.5">Depuis {selectedStation}</Text>
                          </View>
                          <Text className={`text-xs font-black ${priceInfo.isFree ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {priceInfo.isFree ? 'Gratuit' : `${(priceInfo.price / 2).toFixed(2)}€`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Retour */}
                    <View className="mb-2">
                      <Text className="text-slate-400 text-[9px] font-black uppercase tracking-wider mb-2">
                        TRAJET RETOUR ({isMultiDay ? `+ ${durationDays - 1} jours` : selectedDate.formatted})
                      </Text>
                      {scheduleData.retour.map((t) => (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setSelectedRetour(t)}
                          className={`p-3 rounded-[16px] border flex-row justify-between items-center mb-2 ${
                            selectedRetour === t ? 'bg-orange-50/50 border-orange-500 shadow-sm' : 'bg-slate-50 border-slate-200/50'
                          }`}
                        >
                          <View>
                            <Text className="text-slate-900 font-extrabold text-xs">{t}</Text>
                            <Text className="text-slate-500 text-[9px] font-bold mt-0.5">Vers {selectedStation}</Text>
                          </View>
                          <Text className={`text-xs font-black ${priceInfo.isFree ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {priceInfo.isFree ? 'Gratuit' : `${(priceInfo.price / 2).toFixed(2)}€`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 3. FIXED BOTTOM BAR WITH CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-slate-100 p-5 backdrop-blur-md flex-row items-center justify-between z-40">
        <View className="flex-1 pr-4">
          <Text className="text-slate-400 text-[10px] uppercase font-black">
            {isMultiDay ? 'Aventure multi-jours' : 'Date de départ'}
          </Text>
          <Text className="text-slate-900 text-sm font-extrabold" numberOfLines={1}>
            {isMultiDay 
              ? `${selectedDate.dayNum} ${selectedDate.month} ➔ ${getArrivalDateLabel(selectedDate.raw, durationDays)}` 
              : selectedDate.formatted}
          </Text>
          <Text className="text-slate-500 text-xs mt-0.5 font-medium">
            Tarif pass : <Text className="text-emerald-700 font-extrabold">{priceInfo.displayText}</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={handlePlanTrajet}
          className="bg-slate-900 px-6 py-4.5 rounded-[20px] shadow-sm flex-row items-center"
        >
          <Text className="text-white font-extrabold text-base mr-2">
            {!showTransportConfig 
              ? 'Configurer le transport' 
              : activeStep === 1 
              ? 'Valider les dates' 
              : activeStep === 2 
              ? 'Valider la gare' 
              : 'Confirmer & Réserver'}
          </Text>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            tintColor="#ffffff"
            size={16}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
