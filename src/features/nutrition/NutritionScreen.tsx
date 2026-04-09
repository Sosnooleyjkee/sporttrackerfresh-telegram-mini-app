import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { Screen } from "@/components/Screen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { foodCatalogSeed } from "@/constants/foodCatalog";
import type { MealType } from "@/domain/common";
import type { FoodCatalogItem } from "@/domain/nutrition";
import {
  FilterChip,
  MacroCard,
  MealSlotChip,
  NutritionSearchBar,
  ProductCard,
  QuickPreset,
  SuggestedMealCard,
} from "@/features/nutrition/NutritionWidgets";
import { calculateMacrosForGrams, generateCutMenu } from "@/services/nutrition/nutritionEngine";
import { useAppStore, useTodayNutritionSummary } from "@/store/useAppStore";
import { appTheme } from "@/theme/appTheme";
import { formatDecimal } from "@/utils/format";

type NutritionFilter =
  | "high_protein"
  | "low_calorie"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "recent";

type NutritionSort = "relevance" | "calories" | "protein" | "recently_used";

type SuggestionRecipe = {
  id: string;
  title: string;
  composition: string;
  mealType: MealType;
  tag: string;
  items: Array<{ foodId: string; grams: number }>;
};

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

const filterDefinitions: Array<{ id: NutritionFilter; label: string }> = [
  { id: "high_protein", label: "Много белка" },
  { id: "low_calorie", label: "Мало калорий" },
  { id: "breakfast", label: "Завтрак" },
  { id: "lunch", label: "Обед" },
  { id: "dinner", label: "Ужин" },
  { id: "snack", label: "Перекус" },
  { id: "recent", label: "Недавние" },
];

const sortDefinitions: Array<{ id: NutritionSort; label: string }> = [
  { id: "relevance", label: "По релевантности" },
  { id: "calories", label: "По калориям" },
  { id: "protein", label: "По белку" },
  { id: "recently_used", label: "По недавним" },
];

const gramPresets = [50, 100, 150];

const suggestedRecipes: SuggestionRecipe[] = [
  {
    id: "suggest_breakfast_bowl",
    title: "Белковый завтрак",
    composition: "Овсянка, греческий йогурт и банан",
    mealType: "breakfast",
    tag: "Balanced",
    items: [
      { foodId: "food_oats", grams: 60 },
      { foodId: "food_greek_yogurt", grams: 180 },
      { foodId: "food_banana", grams: 120 },
    ],
  },
  {
    id: "suggest_lunch_chicken_rice",
    title: "Chicken rice plate",
    composition: "Куриная грудка, рис и оливковое масло",
    mealType: "lunch",
    tag: "Много белка",
    items: [
      { foodId: "food_chicken_breast", grams: 180 },
      { foodId: "food_rice", grams: 180 },
      { foodId: "food_olive_oil", grams: 8 },
    ],
  },
  {
    id: "suggest_dinner_salmon",
    title: "Легкий ужин с лососем",
    composition: "Лосось, картофель и греческий салат",
    mealType: "dinner",
    tag: "Легкий ужин",
    items: [
      { foodId: "food_salmon", grams: 160 },
      { foodId: "food_potato_boiled", grams: 180 },
      { foodId: "meal_greek_salad", grams: 180 },
    ],
  },
  {
    id: "suggest_snack_cottage",
    title: "Белковый перекус",
    composition: "Творог, ягоды и миндаль",
    mealType: "snack",
    tag: "Много белка",
    items: [
      { foodId: "food_cottage_5", grams: 180 },
      { foodId: "food_berries", grams: 100 },
      { foodId: "food_almonds", grams: 20 },
    ],
  },
];

function getRecentFoodIds(logs: ReturnType<typeof useAppStore.getState>["foodLogEntries"]) {
  return Array.from(new Set(logs.map((entry) => entry.foodId)));
}

function resolveRecipeMeta(recipe: SuggestionRecipe) {
  return recipe.items.reduce(
    (acc, item) => {
      const food = foodCatalogSeed.find((candidate) => candidate.id === item.foodId);
      if (!food) {
        return acc;
      }

      const macros = calculateMacrosForGrams(food, item.grams);
      return {
        kcal: acc.kcal + macros.kcal,
        protein: acc.protein + macros.protein,
        fat: acc.fat + macros.fat,
        carbs: acc.carbs + macros.carbs,
      };
    },
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

function getProgress(current: number, target: number) {
  if (!target) {
    return 0;
  }

  return current / target;
}

function getNutritionStatus(current: number, target: number, unit: string) {
  if (!target) {
    return `${formatDecimal(current)} ${unit}`;
  }

  return `${formatDecimal(current)} / ${target} ${unit}`;
}

function buildProductMeta(item: FoodCatalogItem) {
  const categoryLabel =
    item.category === "meal"
      ? "Готовое блюдо"
      : item.category === "protein"
        ? "Белковый продукт"
        : item.category === "carbs"
          ? "Углеводы"
          : item.category === "fat"
            ? "Жиры"
            : item.category === "fruit"
              ? "Фрукты"
              : item.category === "dairy"
                ? "Молочные"
                : "Продукт";

  return `${categoryLabel} • на 100 г`;
}

export function NutritionScreen() {
  const { width } = useWindowDimensions();
  const questionnaire = useAppStore((state) => state.questionnaire);
  const nutritionPlan = useAppStore((state) => state.nutritionPlan);
  const foodLogEntries = useAppStore((state) => state.foodLogEntries);
  const addFoodLogEntry = useAppStore((state) => state.addFoodLogEntry);
  const summary = useTodayNutritionSummary();
  const cutMenu = generateCutMenu(questionnaire);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<NutritionFilter[]>([]);
  const [sortBy, setSortBy] = useState<NutritionSort>("relevance");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const [quickAddFood, setQuickAddFood] = useState<FoodCatalogItem | null>(null);
  const [quickAddMealType, setQuickAddMealType] = useState<MealType>("lunch");
  const [quickAddGrams, setQuickAddGrams] = useState(100);
  const [customGramsInput, setCustomGramsInput] = useState("100");

  const isWide = width >= 860;
  const recentFoodIds = useMemo(() => getRecentFoodIds(foodLogEntries), [foodLogEntries]);

  const filteredCatalog = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    let items = foodCatalogSeed.filter((item) => {
      if (!normalized) {
        return true;
      }

      const haystack = `${item.name} ${item.category}`.toLowerCase();
      return haystack.includes(normalized);
    });

    for (const filter of activeFilters) {
      switch (filter) {
        case "high_protein":
          items = items.filter((item) => item.proteinPer100g >= 15);
          break;
        case "low_calorie":
          items = items.filter((item) => item.kcalPer100g <= 120);
          break;
        case "recent":
          items = items.filter((item) => recentFoodIds.includes(item.id));
          break;
        case "breakfast":
        case "lunch":
        case "dinner":
        case "snack":
          items = items.filter((item) => {
            if (item.category === "meal") {
              return true;
            }

            if (filter === "breakfast") {
              return ["fruit", "dairy", "carbs"].includes(item.category);
            }

            if (filter === "lunch" || filter === "dinner") {
              return ["meal", "protein", "carbs"].includes(item.category);
            }

            return ["fruit", "dairy", "fat"].includes(item.category);
          });
          break;
      }
    }

    switch (sortBy) {
      case "calories":
        items = [...items].sort((a, b) => a.kcalPer100g - b.kcalPer100g);
        break;
      case "protein":
        items = [...items].sort((a, b) => b.proteinPer100g - a.proteinPer100g);
        break;
      case "recently_used":
        items = [...items].sort((a, b) => Number(recentFoodIds.includes(b.id)) - Number(recentFoodIds.includes(a.id)));
        break;
      case "relevance":
      default:
        break;
    }

    return items.slice(0, normalized ? 24 : 18);
  }, [activeFilters, recentFoodIds, searchQuery, sortBy]);

  const suggestedMeals = useMemo(
    () =>
      suggestedRecipes.map((recipe) => ({
        ...recipe,
        ...resolveRecipeMeta(recipe),
      })),
    [],
  );

  const toggleFilter = (filter: NutritionFilter) => {
    setActiveFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
    );

    if (filter === "breakfast" || filter === "lunch" || filter === "dinner" || filter === "snack") {
      setSelectedMealType(filter);
    }
  };

  const openQuickAdd = (food: FoodCatalogItem) => {
    setQuickAddFood(food);
    setQuickAddMealType(selectedMealType);
    setQuickAddGrams(100);
    setCustomGramsInput("100");
  };

  const applyQuickAdd = () => {
    if (!quickAddFood) {
      return;
    }

    addFoodLogEntry({
      foodId: quickAddFood.id,
      grams: quickAddGrams,
      mealType: quickAddMealType,
    });
    setQuickAddFood(null);
  };

  const addSuggestedMeal = (recipe: SuggestionRecipe) => {
    recipe.items.forEach((item) => {
      addFoodLogEntry({
        foodId: item.foodId,
        grams: item.grams,
        mealType: recipe.mealType,
      });
    });
  };

  const quickAddPreview = quickAddFood ? calculateMacrosForGrams(quickAddFood, quickAddGrams) : null;

  return (
    <Screen>
      <View style={styles.shell}>
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Сегодня</Text>
              <Text style={styles.heroTitle}>Питание</Text>
              <Text style={styles.heroStatus}>
                {nutritionPlan.targetKcal
                  ? "Калории и КБЖУ уже считаются относительно дневной цели."
                  : "Сводка дня по питанию уже доступна без заданной цели."}
              </Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeLabel}>Поиск и лог</Text>
              <Text style={styles.heroBadgeValue}>Fast add</Text>
            </View>
          </View>

          <View style={[styles.heroSummaryRow, isWide ? styles.heroSummaryRowWide : null]}>
            <View style={styles.heroHighlight}>
              <Text style={styles.heroHighlightValue}>{formatDecimal(summary.totalKcal)}</Text>
              <Text style={styles.heroHighlightLabel}>
                {nutritionPlan.targetKcal ? `${nutritionPlan.targetKcal} ккал цель` : "ккал за сегодня"}
              </Text>
            </View>
            <Text style={styles.heroSummaryText}>
              {nutritionPlan.targetKcal
                ? `Осталось ${Math.max(0, nutritionPlan.targetKcal - Math.round(summary.totalKcal))} ккал до цели.`
                : "Следи за totals и быстро добирай макросы через поиск и быстрые пресеты."}
            </Text>
          </View>
        </View>

        <View style={[styles.macroGrid, isWide ? styles.macroGridWide : null]}>
          <MacroCard
            label="Калории"
            value={formatDecimal(summary.totalKcal)}
            secondary={getNutritionStatus(summary.totalKcal, nutritionPlan.targetKcal, "ккал")}
            progress={getProgress(summary.totalKcal, nutritionPlan.targetKcal)}
            accent="amber"
          />
          <MacroCard
            label="Белки"
            value={`${formatDecimal(summary.totalProtein)} г`}
            secondary={getNutritionStatus(summary.totalProtein, nutritionPlan.targetProtein, "г")}
            progress={getProgress(summary.totalProtein, nutritionPlan.targetProtein)}
            accent="green"
          />
          <MacroCard
            label="Жиры"
            value={`${formatDecimal(summary.totalFat)} г`}
            secondary={getNutritionStatus(summary.totalFat, nutritionPlan.targetFat, "г")}
            progress={getProgress(summary.totalFat, nutritionPlan.targetFat)}
            accent="violet"
          />
          <MacroCard
            label="Углеводы"
            value={`${formatDecimal(summary.totalCarbs)} г`}
            secondary={getNutritionStatus(summary.totalCarbs, nutritionPlan.targetCarbs, "г")}
            progress={getProgress(summary.totalCarbs, nutritionPlan.targetCarbs)}
            accent="blue"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>Поиск</Text>
            <Text style={styles.sectionTitle}>Быстрый поиск и добавление еды</Text>
            <Text style={styles.sectionDescription}>
              Главный сценарий экрана: быстро найти продукт, выбрать meal slot и добавить нужное количество без лишних шагов.
            </Text>
          </View>

          <View style={styles.searchArea}>
            <NutritionSearchBar value={searchQuery} onChangeText={setSearchQuery} />

            <View style={styles.mealSlotsRow}>
              {(Object.keys(mealTypeLabels) as MealType[]).map((mealType) => (
                <MealSlotChip
                  key={mealType}
                  label={mealTypeLabels[mealType]}
                  active={selectedMealType === mealType}
                  onPress={() => setSelectedMealType(mealType)}
                />
              ))}
            </View>

            <View style={styles.filterWrap}>
              {filterDefinitions.map((filter) => (
                <FilterChip
                  key={filter.id}
                  label={filter.label}
                  active={activeFilters.includes(filter.id)}
                  onPress={() => toggleFilter(filter.id)}
                />
              ))}
            </View>

            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sort</Text>
              <View style={styles.sortWrap}>
                {sortDefinitions.map((sort) => (
                  <FilterChip
                    key={sort.id}
                    label={sort.label}
                    active={sortBy === sort.id}
                    onPress={() => setSortBy(sort.id)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.searchMetaCard}>
              <Text style={styles.searchMetaTitle}>В базе {foodCatalogSeed.length} позиций</Text>
              <Text style={styles.searchMetaText}>
                Сейчас показано {filteredCatalog.length}. Активный meal slot: {mealTypeLabels[selectedMealType]}.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>Results</Text>
            <Text style={styles.sectionTitle}>Продукты и блюда</Text>
            <Text style={styles.sectionDescription}>
              Список собран для быстрого сканирования: название, контекст, КБЖУ и явное действие добавления.
            </Text>
          </View>

          <View style={styles.productList}>
            {filteredCatalog.map((food) => (
              <ProductCard
                key={food.id}
                title={food.name}
                meta={buildProductMeta(food)}
                nutrition={`Ккал ${food.kcalPer100g} • Б ${food.proteinPer100g} • Ж ${food.fatPer100g} • У ${food.carbsPer100g}`}
                onAdd={() => openQuickAdd(food)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>Suggestions</Text>
            <Text style={styles.sectionTitle}>{cutMenu.title}</Text>
            <Text style={styles.sectionDescription}>
              Нижний блок теперь работает как полезный модуль: готовые наборы можно сразу добавить в нужный meal slot.
            </Text>
          </View>

          <View style={[styles.mealGrid, isWide ? styles.mealGridWide : null]}>
            {suggestedMeals.map((meal) => (
              <SuggestedMealCard
                key={meal.id}
                title={meal.title}
                composition={meal.composition}
                kcal={`${Math.round(meal.kcal)} ккал`}
                macros={`Б ${Math.round(meal.protein)} • Ж ${Math.round(meal.fat)} • У ${Math.round(meal.carbs)}`}
                tag={meal.tag}
                onAdd={() => addSuggestedMeal(meal)}
              />
            ))}
          </View>
        </View>
      </View>

      <Modal animationType="slide" transparent visible={Boolean(quickAddFood)} onRequestClose={() => setQuickAddFood(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setQuickAddFood(null)} />
          {quickAddFood ? (
            <View style={styles.sheet}>
              <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetCopy}>
                    <Text style={styles.sheetEyebrow}>Быстрое добавление</Text>
                    <Text style={styles.sheetTitle}>{quickAddFood.name}</Text>
                    <Text style={styles.sheetDescription}>
                      Выбери meal slot и количество. Добавление занимает один финальный тап.
                    </Text>
                  </View>
                  <Pressable onPress={() => setQuickAddFood(null)} style={styles.sheetCloseButton}>
                    <Text style={styles.sheetCloseText}>Закрыть</Text>
                  </Pressable>
                </View>

                <View style={styles.sheetSection}>
                  <Text style={styles.sheetSectionTitle}>Meal slot</Text>
                  <View style={styles.mealSlotsRow}>
                    {(Object.keys(mealTypeLabels) as MealType[]).map((mealType) => (
                      <MealSlotChip
                        key={mealType}
                        label={mealTypeLabels[mealType]}
                        active={quickAddMealType === mealType}
                        onPress={() => setQuickAddMealType(mealType)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.sheetSection}>
                  <Text style={styles.sheetSectionTitle}>Быстрые пресеты</Text>
                  <View style={styles.presetsRow}>
                    {gramPresets.map((grams) => (
                      <QuickPreset
                        key={grams}
                        label={`${grams}g`}
                        active={quickAddGrams === grams}
                        onPress={() => {
                          setQuickAddGrams(grams);
                          setCustomGramsInput(String(grams));
                        }}
                      />
                    ))}
                    <QuickPreset
                      label="1 serving"
                      active={quickAddGrams === 100}
                      onPress={() => {
                        setQuickAddGrams(100);
                        setCustomGramsInput("100");
                      }}
                    />
                  </View>
                </View>

                <View style={styles.sheetSection}>
                  <Text style={styles.sheetSectionTitle}>Количество</Text>
                  <TextInput
                    value={customGramsInput}
                    onChangeText={(value) => {
                      setCustomGramsInput(value);
                      setQuickAddGrams(Number(value.replace(/[^\d]/g, "")) || 0);
                    }}
                    keyboardType="numeric"
                    style={styles.gramsInput}
                    placeholder="Введите граммы"
                    placeholderTextColor={appTheme.colors.textMuted}
                  />
                </View>

                {quickAddPreview ? (
                  <View style={styles.previewCard}>
                    <Text style={styles.previewTitle}>Предпросмотр</Text>
                    <Text style={styles.previewText}>
                      {quickAddPreview.kcal} ккал • Б {quickAddPreview.protein} • Ж {quickAddPreview.fat} • У {quickAddPreview.carbs}
                    </Text>
                    <Text style={styles.previewText}>Добавится в {mealTypeLabels[quickAddMealType]}.</Text>
                  </View>
                ) : null}

                <PrimaryButton
                  label={`Добавить в ${mealTypeLabels[quickAddMealType]}`}
                  onPress={applyQuickAdd}
                  disabled={!quickAddGrams}
                />
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shell: { width: "100%", maxWidth: 940, alignSelf: "center", gap: appTheme.spacing.lg },
  hero: { padding: appTheme.spacing.xl, borderRadius: 28, borderWidth: 1, borderColor: appTheme.colors.borderStrong, backgroundColor: "#17130F", gap: appTheme.spacing.lg },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: appTheme.spacing.md },
  heroCopy: { flex: 1, gap: 4 },
  heroEyebrow: { color: appTheme.colors.warning, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  heroTitle: { color: appTheme.colors.textPrimary, fontSize: 34, fontWeight: "800" },
  heroStatus: { color: appTheme.colors.textSecondary, fontSize: 14, lineHeight: 21 },
  heroBadge: { display: "none" },
  heroBadgeLabel: { display: "none" },
  heroBadgeValue: { display: "none" },
  heroSummaryRow: { gap: appTheme.spacing.md },
  heroSummaryRowWide: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroHighlight: { gap: 4 },
  heroHighlightValue: { color: appTheme.colors.textPrimary, fontSize: 38, fontWeight: "800" },
  heroHighlightLabel: { color: appTheme.colors.textSecondary, fontSize: 14 },
  heroSummaryText: { flex: 1, color: appTheme.colors.textSecondary, fontSize: 14, lineHeight: 21 },
  macroGrid: { gap: appTheme.spacing.md },
  macroGridWide: { flexDirection: "row", flexWrap: "wrap" },
  section: { gap: appTheme.spacing.md },
  sectionHeader: { gap: 6 },
  sectionEyebrow: { color: appTheme.colors.warning, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  sectionTitle: { color: appTheme.colors.textPrimary, fontSize: 24, fontWeight: "800" },
  sectionDescription: { color: appTheme.colors.textSecondary, fontSize: 14, lineHeight: 21 },
  searchArea: { gap: appTheme.spacing.md },
  mealSlotsRow: { flexDirection: "row", flexWrap: "wrap", gap: appTheme.spacing.sm },
  filterWrap: { flexDirection: "row", flexWrap: "wrap", gap: appTheme.spacing.sm },
  sortRow: { gap: appTheme.spacing.sm },
  sortLabel: { color: appTheme.colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  sortWrap: { flexDirection: "row", flexWrap: "wrap", gap: appTheme.spacing.sm },
  searchMetaCard: { gap: 4, padding: appTheme.spacing.md, borderRadius: 20, backgroundColor: appTheme.colors.surface, borderWidth: 1, borderColor: appTheme.colors.border },
  searchMetaTitle: { color: appTheme.colors.textPrimary, fontSize: 15, fontWeight: "700" },
  searchMetaText: { color: appTheme.colors.textSecondary, fontSize: 13, lineHeight: 19 },
  productList: { gap: appTheme.spacing.sm },
  mealGrid: { gap: appTheme.spacing.md },
  mealGridWide: { flexDirection: "row", flexWrap: "wrap" },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(6,8,12,0.72)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: appTheme.colors.border, backgroundColor: appTheme.colors.surface, maxHeight: "88%", overflow: "hidden" },
  sheetContent: { padding: appTheme.spacing.lg, gap: appTheme.spacing.lg },
  sheetHeader: { gap: appTheme.spacing.md },
  sheetCopy: { gap: 4 },
  sheetEyebrow: { color: appTheme.colors.warning, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  sheetTitle: { color: appTheme.colors.textPrimary, fontSize: 24, fontWeight: "800" },
  sheetDescription: { color: appTheme.colors.textSecondary, fontSize: 14, lineHeight: 21 },
  sheetCloseButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 10, borderRadius: appTheme.radius.pill, backgroundColor: appTheme.colors.surfaceRaised, borderWidth: 1, borderColor: appTheme.colors.borderStrong },
  sheetCloseText: { color: appTheme.colors.textPrimary, fontSize: 13, fontWeight: "700" },
  sheetSection: { gap: appTheme.spacing.sm },
  sheetSectionTitle: { color: appTheme.colors.textPrimary, fontSize: 15, fontWeight: "700" },
  presetsRow: { flexDirection: "row", flexWrap: "wrap", gap: appTheme.spacing.sm },
  gramsInput: { minHeight: 52, borderRadius: 18, backgroundColor: appTheme.colors.surfaceRaised, borderWidth: 1, borderColor: appTheme.colors.border, color: appTheme.colors.textPrimary, paddingHorizontal: appTheme.spacing.md, fontSize: 16, fontWeight: "600" },
  previewCard: { gap: 6, padding: appTheme.spacing.md, borderRadius: 20, backgroundColor: "#151A22", borderWidth: 1, borderColor: "rgba(124,140,255,0.18)" },
  previewTitle: { color: appTheme.colors.textPrimary, fontSize: 15, fontWeight: "700" },
  previewText: { color: appTheme.colors.textSecondary, fontSize: 13, lineHeight: 19 },
});
