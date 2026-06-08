import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

export default function OnboardingScreen() {
  const { transitPasses, setUserPasses, setOnboardingCompleted } = useApp();
  const router = useRouter();
  
  const [hasPass, setHasPass] = useState<boolean | null>(null);
  const [selectedPasses, setSelectedPasses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'idf' | 'aura' | 'national'>('all');

  const handleSkip = () => {
    setUserPasses([]);
    setOnboardingCompleted(true);
    router.replace('/(tabs)' as any);
  };

  const handleTogglePass = (id: string) => {
    setSelectedPasses((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    setUserPasses(selectedPasses);
    setOnboardingCompleted(true);
    router.replace('/(tabs)' as any);
  };

  // Filtrer les pass selon la recherche et l'onglet actif
  const filteredPasses = transitPasses.filter((pass) => {
    const matchesSearch =
      pass.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pass.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pass.region.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'idf' && pass.region === 'Île-de-France') ||
      (activeTab === 'aura' && pass.region === 'Auvergne-Rhône-Alpes') ||
      (activeTab === 'national' && pass.region === 'National');

    return matchesSearch && matchesTab;
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {hasPass === null ? (
        // Étape 1 : Question Oui/Non
        <View className="flex-1 justify-between px-6 py-12">
          {/* Logo & Header */}
          <View className="items-center mt-12">
            <View className="w-20 h-20 bg-orange-500 rounded-[28px] items-center justify-center mb-6 shadow-md shadow-orange-500/20">
              <SymbolView
                name={{ ios: 'mountain.2.fill', android: 'terrain', web: 'terrain' }}
                tintColor="#ffffff"
                size={40}
              />
            </View>
            <Text className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Névé</Text>
            <Text className="text-slate-500 text-center px-8 text-sm font-semibold tracking-tight uppercase">
              Randonner sans voiture • V1
            </Text>
          </View>

          {/* Question card (Very rounded, fine border, shadow) */}
          <View className="bg-slate-50 border border-slate-200/80 p-6 rounded-[32px] shadow-sm my-auto">
            <Text className="text-2xl font-black text-slate-900 text-center mb-3 tracking-tight">
              Possèdes-tu un abonnement de transport ?
            </Text>
            <Text className="text-slate-500 text-sm text-center mb-8 font-medium">
              Navigo, cartes TER régionales, Carte Avantage... Nous ajusterons les itinéraires et calculerons vos prix réels en direct.
            </Text>

            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => setHasPass(true)}
                className="w-full bg-slate-900 py-4.5 rounded-[20px] items-center flex-row justify-center shadow-sm"
              >
                <SymbolView
                  name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                  tintColor="#ffffff"
                  size={18}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-extrabold text-base">Oui, j'ai des abonnements</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSkip}
                className="w-full bg-slate-100 hover:bg-slate-200/80 py-4.5 rounded-[20px] items-center mt-3 border border-slate-200/40"
              >
                <Text className="text-slate-800 font-bold text-base">Non, aucun pass</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer note */}
          <Text className="text-slate-400 text-xs text-center px-4 font-semibold tracking-tight">
            Vous pourrez modifier ces informations à tout moment depuis votre compte.
          </Text>
        </View>
      ) : (
        // Étape 2 : Sélection des abonnements
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-between px-6 py-6">
            <View className="flex-1">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity
                  onPress={() => setHasPass(null)}
                  className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200/40"
                >
                  <SymbolView
                    name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                    tintColor="#0f172a"
                    size={20}
                  />
                </TouchableOpacity>
                <Text className="text-lg font-black text-slate-900 tracking-tight">Sélectionner vos Pass</Text>
                <TouchableOpacity onPress={handleSkip}>
                  <Text className="text-orange-500 font-extrabold">Passer</Text>
                </TouchableOpacity>
              </View>

              {/* Barre de recherche */}
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-[20px] px-4 py-3.5 mb-4">
                <SymbolView
                  name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                  tintColor="#64748b"
                  size={18}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Rechercher un abonnement..."
                  placeholderTextColor="#94a3b8"
                  className="flex-1 text-slate-800 text-base font-medium"
                  style={Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : undefined}
                />
              </View>

              {/* Catégories de régions (Horizontal scroll) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4 max-h-[44px]"
                keyboardShouldPersistTaps="handled"
              >
                <TouchableOpacity
                  onPress={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-full mr-2 border ${
                    activeTab === 'all' ? 'bg-slate-900 border-slate-900' : 'bg-slate-100 border-slate-200/50'
                  }`}
                >
                  <Text className={`font-bold text-xs ${activeTab === 'all' ? 'text-white' : 'text-slate-600'}`}>Tous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab('idf')}
                  className={`px-4 py-2 rounded-full mr-2 border ${
                    activeTab === 'idf' ? 'bg-slate-900 border-slate-900' : 'bg-slate-100 border-slate-200/50'
                  }`}
                >
                  <Text className={`font-bold text-xs ${activeTab === 'idf' ? 'text-white' : 'text-slate-600'}`}>Île-de-France</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab('aura')}
                  className={`px-4 py-2 rounded-full mr-2 border ${
                    activeTab === 'aura' ? 'bg-slate-900 border-slate-900' : 'bg-slate-100 border-slate-200/50'
                  }`}
                >
                  <Text className={`font-bold text-xs ${activeTab === 'aura' ? 'text-white' : 'text-slate-600'}`}>Auvergne-Rhône-Alpes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab('national')}
                  className={`px-4 py-2 rounded-full border ${
                    activeTab === 'national' ? 'bg-slate-900 border-slate-900' : 'bg-slate-100 border-slate-200/50'
                  }`}
                >
                  <Text className={`font-bold text-xs ${activeTab === 'national' ? 'text-white' : 'text-slate-600'}`}>National</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Liste des Pass */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1 mt-2"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                {filteredPasses.length > 0 ? (
                  filteredPasses.map((pass) => {
                    const isSelected = selectedPasses.includes(pass.id);
                    return (
                      <TouchableOpacity
                        key={pass.id}
                        onPress={() => handleTogglePass(pass.id)}
                        className={`p-4.5 rounded-[24px] mb-3 border flex-row items-center justify-between ${
                          isSelected
                            ? 'bg-orange-50/50 border-orange-500 shadow-sm'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <View className="flex-1 pr-4">
                          <View className="flex-row items-center mb-1 flex-wrap">
                            <Text className="text-slate-900 font-extrabold text-base mr-2">{pass.name}</Text>
                            <Text className="text-slate-500 text-[10px] px-2 py-0.5 bg-slate-200/60 rounded border border-slate-300 font-bold uppercase tracking-tight">
                              {pass.region}
                            </Text>
                          </View>
                          <Text className="text-slate-500 text-xs mb-1.5 font-medium">{pass.description}</Text>
                          <Text className="text-orange-600 text-xs font-bold">{pass.priceInfo}</Text>
                        </View>
                        <View
                          className={`w-6 h-6 rounded-full border items-center justify-center ${
                            isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <SymbolView
                              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                              tintColor="#ffffff"
                              size={14}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View className="items-center justify-center py-12">
                    <Text className="text-slate-400 text-center font-medium">Aucun abonnement trouvé pour votre recherche.</Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Validation */}
            <View className="pt-4 border-t border-slate-100">
              <TouchableOpacity
                onPress={handleFinish}
                className={`w-full py-4.5 rounded-[20px] items-center ${
                  selectedPasses.length > 0 ? 'bg-slate-900 shadow-sm' : 'bg-slate-800'
                }`}
              >
                <Text className="text-white font-extrabold text-base">
                  {selectedPasses.length > 0
                    ? `Valider (${selectedPasses.length} sélectionné${selectedPasses.length > 1 ? 's' : ''})`
                    : 'Continuer sans pass'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
